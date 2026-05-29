import {
	acceptTransferRequest,
	createTransferRequest,
	declineTransferRequest,
} from "@/infrastructure/server/orders";
import type { OrderRepository } from "@/ports/order-repository";

/** Server-function-backed OrderRepository (transfer-request commands only). */
export const serverOrderRepository: OrderRepository = {
	createTransferRequest: (orderId) => createTransferRequest({ data: orderId }),
	acceptTransferRequest: (input) => acceptTransferRequest({ data: input }),
	declineTransferRequest: (input) => declineTransferRequest({ data: input }),
};
