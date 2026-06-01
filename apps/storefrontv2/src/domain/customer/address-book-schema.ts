import { z } from "zod";

/** Address captured in the account address book (simpler than checkout, no email). */
export const addressBookSchema = z.object({
	first_name: z.string().min(1, "Required"),
	last_name: z.string().min(1, "Required"),
	address_1: z.string().min(1, "Required"),
	postal_code: z.string().min(1, "Required"),
	city: z.string().min(1, "Required"),
	country_code: z.string().min(1, "Required"),
	phone: z.string().optional(),
});

export type AddressBookValues = z.infer<typeof addressBookSchema>;
