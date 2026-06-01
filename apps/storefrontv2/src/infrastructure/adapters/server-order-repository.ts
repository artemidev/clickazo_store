import type { OrderRepository } from "@/application/ports/order-repository";
import {
	acceptTransferRequest,
	createTransferRequest,
	declineTransferRequest,
} from "@/infrastructure/server/orders";

/** Server-function-backed OrderRepository (transfer-request commands only). */
export const serverOrderRepository: OrderRepository = {
	createTransferRequest: (orderId) => createTransferRequest({ data: orderId }),
	acceptTransferRequest: (input) => acceptTransferRequest({ data: input }),
	declineTransferRequest: (input) => declineTransferRequest({ data: input }),
};
