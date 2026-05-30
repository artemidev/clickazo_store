import { ModuleProvider, Modules } from "@medusajs/framework/utils"
import CulqiPaymentProviderService from "./service"

export default ModuleProvider(Modules.PAYMENT, {
  services: [CulqiPaymentProviderService],
})
