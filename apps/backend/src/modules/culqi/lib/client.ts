import { MedusaError } from "@medusajs/framework/utils"
import type {
  CulqiCharge,
  CulqiErrorResponse,
  CulqiRefund,
  CulqiRefundReason,
} from "../types"

const DEFAULT_API_URL = "https://api.culqi.com/v2"

export type CreateChargeParams = {
  /** Amount in céntimos (minor unit), e.g. 1000 = S/ 10.00. */
  amount: number
  /** ISO currency code Culqi expects in uppercase, e.g. "PEN". */
  currency_code: string
  email: string
  /** Token id (`tkn_...`) created on the storefront with the public key. */
  source_id: string
  /** When true, the charge is captured immediately. */
  capture: boolean
  description?: string
  metadata?: Record<string, unknown>
}

export type CreateRefundParams = {
  charge_id: string
  /** Amount in céntimos. Omit for a full refund. */
  amount?: number
  reason: CulqiRefundReason
}

/**
 * Minimal typed HTTP client for the Culqi REST API. Uses the global `fetch`
 * (Node 18+) so the integration carries no extra runtime dependency. All calls
 * authenticate with the secret key and surface Culqi errors as `MedusaError`s.
 */
export class CulqiClient {
  private readonly secretKey: string
  private readonly apiUrl: string

  constructor(secretKey: string, apiUrl: string = DEFAULT_API_URL) {
    this.secretKey = secretKey
    this.apiUrl = apiUrl.replace(/\/$/, "")
  }

  async createCharge(params: CreateChargeParams): Promise<CulqiCharge> {
    return this.request<CulqiCharge>("POST", "/charges", params)
  }

  async getCharge(id: string): Promise<CulqiCharge> {
    return this.request<CulqiCharge>("GET", `/charges/${id}`)
  }

  /** Captures a charge previously created with `capture: false`. */
  async captureCharge(id: string): Promise<CulqiCharge> {
    return this.request<CulqiCharge>("POST", `/charges/${id}/capture`)
  }

  async createRefund(params: CreateRefundParams): Promise<CulqiRefund> {
    return this.request<CulqiRefund>("POST", "/refunds", params)
  }

  private async request<T>(
    method: "GET" | "POST",
    path: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    let response: Response
    try {
      response = await fetch(`${this.apiUrl}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      })
    } catch (e) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Could not reach Culqi: ${(e as Error).message}`
      )
    }

    const payload = (await response.json().catch(() => ({}))) as
      | T
      | CulqiErrorResponse

    if (!response.ok) {
      const error = payload as CulqiErrorResponse
      const message =
        error?.user_message ||
        error?.merchant_message ||
        `Culqi request failed with status ${response.status}`
      throw new MedusaError(MedusaError.Types.INVALID_DATA, message)
    }

    return payload as T
  }
}
