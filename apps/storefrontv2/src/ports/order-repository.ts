import type { HttpTypes } from "@medusajs/types";

export type OrderTransferResult = {
	success: boolean;
	error: string | null;
	order: HttpTypes.StoreOrder | null;
};

/** Order transfer-request repository contract (port). Reads stay direct queries. */
export interface OrderRepository {
	createTransferRequest(orderId: string): Promise<OrderTransferResult>;
	acceptTransferRequest(input: {
		id: string;
		token: string;
	}): Promise<OrderTransferResult>;
	declineTransferRequest(input: {
		id: string;
		token: string;
	}): Promise<OrderTransferResult>;
}
