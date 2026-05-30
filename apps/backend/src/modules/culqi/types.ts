/**
 * Types for the Culqi payment provider integration.
 *
 * Culqi is a Peruvian payment gateway. Amounts are always expressed in the
 * currency's minor unit (céntimos for PEN), e.g. `1000` = S/ 10.00. Only PEN is
 * supported by this integration (see `CULQI_CURRENCY`).
 *
 * API reference: https://apidocs.culqi.com
 */

/** Options passed to the provider in `medusa-config.ts`. */
export type CulqiOptions = {
  /** Secret key (`sk_...`). Used server-side to create charges/refunds. */
  secretKey: string
  /** Public key (`pk_...`). Exposed to the storefront for tokenization. */
  publicKey: string
  /** Override the API base URL. Defaults to https://api.culqi.com/v2. */
  apiUrl?: string
}

/** A Culqi charge object (subset of the fields we rely on). */
export type CulqiCharge = {
  id: string
  object: "charge"
  amount: number
  currency_code: string
  email: string
  capture: boolean
  captured: boolean
  reference_code?: string
  outcome?: {
    type: string
    code: string
    merchant_message?: string
    user_message?: string
  }
  metadata?: Record<string, unknown>
}

/** A Culqi refund object. */
export type CulqiRefund = {
  id: string
  object: "refund"
  amount: number
  charge_id: string
  reason: string
}

/** Shape of an error response returned by Culqi. */
export type CulqiErrorResponse = {
  object: "error"
  type: string
  charge_id?: string
  code?: string
  merchant_message?: string
  user_message?: string
}

/** Valid `reason` values accepted by Culqi's refunds endpoint. */
export type CulqiRefundReason =
  | "duplicado"
  | "fraudulento"
  | "solicitud_comprador"
