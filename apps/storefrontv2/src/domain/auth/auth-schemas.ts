import { z } from "zod";

export const loginSchema = z.object({
	email: z.string().email("A valid email is required"),
	password: z.string().min(1, "Required"),
});

export const signupSchema = z.object({
	first_name: z.string().min(1, "Required"),
	last_name: z.string().min(1, "Required"),
	email: z.string().email("A valid email is required"),
	phone: z.string().optional(),
	password: z.string().min(6, "At least 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
