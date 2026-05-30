import { randomUUID } from "node:crypto"
import {
  AbstractPaymentProvider,
  BigNumber,
  MedusaError,
} from "@medusajs/framework/utils"
import type {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  BigNumberInput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  Logger,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from "@medusajs/framework/types"
import { CulqiClient } from "./lib/client"
import type { CulqiCharge, CulqiOptions } from "./types"

type InjectedDependencies = {
  logger: Logger
}

/** Only PEN is supported (Culqi operates in Peru). */
const CULQI_CURRENCY = "pen"

/** Converts a Medusa amount (major unit, e.g. 10.5) to Culqi céntimos (1050). */
function toMinorUnits(amount: BigNumberInput): number {
  return Math.round(new BigNumber(amount).numeric * 100)
}

/**
 * Culqi payment provider.
 *
 * Flow: the storefront tokenizes the card with Culqi Checkout (public key) and
 * sends the resulting token (`tkn_...`) when (re-)initiating the payment
 * session. On cart completion, {@link authorizePayment} creates a charge with
 * `capture: true`, so the payment is captured in a single synchronous step.
 *
 * The card data never reaches our server — only the token does.
 */
class CulqiPaymentProviderService extends AbstractPaymentProvider<CulqiOptions> {
  static identifier = "culqi"

  protected logger_: Logger
  protected options_: CulqiOptions
  protected client_: CulqiClient

  constructor(container: InjectedDependencies, options: CulqiOptions) {
    super(container, options)

    this.logger_ = container.logger
    this.options_ = options
    this.client_ = new CulqiClient(options.secretKey, options.apiUrl)
  }

  static validateOptions(options: Record<string, unknown>): void {
    if (!options.secretKey) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Culqi provider requires a `secretKey` option."
      )
    }
    if (!options.publicKey) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Culqi provider requires a `publicKey` option."
      )
    }
  }

  private assertCurrency(currencyCode: string): void {
    if (currencyCode.toLowerCase() !== CULQI_CURRENCY) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Culqi only supports PEN payments, received "${currencyCode}".`
      )
    }
  }

  /**
   * Creates the payment session. No Culqi resource is created yet — we only
   * persist the data needed to charge later (amount, currency, and the card
   * token once the storefront re-initiates the session with it).
   */
  async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    this.assertCurrency(input.currency_code)

    const incoming = input.data ?? {}

    return {
      id: randomUUID(),
      status: "pending",
      data: {
        ...incoming,
        amount: new BigNumber(input.amount).numeric,
        currency_code: input.currency_code,
        public_key: this.options_.publicKey,
      },
    }
  }

  /**
   * Merges new data into the session — used when the storefront attaches the
   * Culqi token (`culqi_token`) before placing the order.
   */
  async updatePayment(
    input: UpdatePaymentInput
  ): Promise<UpdatePaymentOutput> {
    this.assertCurrency(input.currency_code)

    return {
      data: {
        ...(input.data ?? {}),
        amount: new BigNumber(input.amount).numeric,
        currency_code: input.currency_code,
      },
    }
  }

  /**
   * Charges the card token via Culqi with `capture: true`. Returns `captured`
   * since the money is taken in a single step.
   */
  async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    const data = (input.data ?? {}) as Record<string, unknown>
    const token = data.culqi_token as string | undefined
    const currencyCode = (data.currency_code as string) ?? CULQI_CURRENCY
    const email =
      input.context?.customer?.email ?? (data.email as string | undefined)

    if (!token) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Missing Culqi card token. The storefront must tokenize the card before placing the order."
      )
    }
    if (!email) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "A customer email is required to create a Culqi charge."
      )
    }
    this.assertCurrency(currencyCode)

    try {
      const charge = await this.client_.createCharge({
        amount: toMinorUnits(data.amount as BigNumberInput),
        currency_code: currencyCode.toUpperCase(),
        email,
        source_id: token,
        capture: true,
        metadata: { medusa: "true" },
      })

      return {
        status: charge.captured ? "captured" : "authorized",
        data: { ...data, charge_id: charge.id, charge },
      }
    } catch (e) {
      this.logger_.error(`Culqi charge failed: ${(e as Error).message}`)
      return {
        status: "error",
        data: { ...data, error: (e as Error).message },
      }
    }
  }

  /**
   * Charges are captured at authorization (`capture: true`), so this is a
   * no-op that returns the existing data. Kept idempotent for the manual
   * capture action in the admin.
   */
  async capturePayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    return { data: input.data ?? {} }
  }

  async refundPayment(
    input: RefundPaymentInput
  ): Promise<RefundPaymentOutput> {
    const data = (input.data ?? {}) as Record<string, unknown>
    const chargeId = data.charge_id as string | undefined

    if (!chargeId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Cannot refund: no Culqi charge id stored on the payment."
      )
    }

    const refund = await this.client_.createRefund({
      charge_id: chargeId,
      amount: toMinorUnits(input.amount),
      reason: "solicitud_comprador",
    })

    return { data: { ...data, refund } }
  }

  /**
   * Culqi has no "void" for an uncaptured charge, so cancellation refunds the
   * charge in full when one exists; otherwise it's a no-op.
   */
  async cancelPayment(
    input: CancelPaymentInput
  ): Promise<CancelPaymentOutput> {
    const data = (input.data ?? {}) as Record<string, unknown>
    const chargeId = data.charge_id as string | undefined

    if (!chargeId) {
      return { data }
    }

    try {
      const refund = await this.client_.createRefund({
        charge_id: chargeId,
        reason: "solicitud_comprador",
      })
      return { data: { ...data, refund } }
    } catch (e) {
      this.logger_.error(`Culqi cancel/refund failed: ${(e as Error).message}`)
      return { data }
    }
  }

  async deletePayment(
    input: DeletePaymentInput
  ): Promise<DeletePaymentOutput> {
    return { data: input.data ?? {} }
  }

  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    const data = (input.data ?? {}) as Record<string, unknown>
    const chargeId = data.charge_id as string | undefined

    if (!chargeId) {
      return { status: "pending", data }
    }

    try {
      const charge = await this.client_.getCharge(chargeId)
      return {
        status: charge.captured ? "captured" : "authorized",
        data: { ...data, charge },
      }
    } catch {
      return { status: "pending", data }
    }
  }

  async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    const data = (input.data ?? {}) as Record<string, unknown>
    const chargeId = data.charge_id as string | undefined

    if (!chargeId) {
      return { data }
    }

    const charge = await this.client_.getCharge(chargeId)
    return { data: { ...data, charge } }
  }

  /**
   * Secondary safety net: charges are captured synchronously in
   * {@link authorizePayment}, so webhooks are only reconciliation. We re-fetch
   * the charge from Culqi to validate the event before acting on it.
   */
  async getWebhookActionAndData(
    payload: ProviderWebhookPayload["payload"]
  ): Promise<WebhookActionResult> {
    const data = payload.data as Record<string, unknown>
    const charge = (data.data ?? data) as Partial<CulqiCharge>
    const sessionId =
      (charge.metadata as Record<string, unknown> | undefined)?.session_id ?? ""

    if (!charge.id || !sessionId) {
      return {
        action: "not_supported",
        data: { session_id: String(sessionId), amount: new BigNumber(0) },
      }
    }

    try {
      const verified = await this.client_.getCharge(charge.id)
      return {
        action: verified.captured ? "captured" : "authorized",
        data: {
          session_id: String(sessionId),
          amount: new BigNumber(verified.amount),
        },
      }
    } catch {
      return {
        action: "failed",
        data: { session_id: String(sessionId), amount: new BigNumber(0) },
      }
    }
  }
}

export default CulqiPaymentProviderService
