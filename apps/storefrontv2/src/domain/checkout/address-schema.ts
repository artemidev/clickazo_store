import { z } from "zod";

/** Shipping/billing address captured during checkout. */
export const addressSchema = z.object({
	email: z.string().email("A valid email is required"),
	first_name: z.string().min(1, "Required"),
	last_name: z.string().min(1, "Required"),
	company: z.string().optional(),
	address_1: z.string().min(1, "Required"),
	postal_code: z.string().min(1, "Required"),
	city: z.string().min(1, "Required"),
	province: z.string().optional(),
	country_code: z.string().min(1, "Required"),
	phone: z.string().optional(),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
