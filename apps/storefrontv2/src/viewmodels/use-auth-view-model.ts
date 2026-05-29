import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { queryKeys } from "@/application/query-keys";
import { useUseCases } from "@/di/context";

const loginSchema = z.object({
	email: z.string().email("A valid email is required"),
	password: z.string().min(1, "Required"),
});

const signupSchema = z.object({
	first_name: z.string().min(1, "Required"),
	last_name: z.string().min(1, "Required"),
	email: z.string().email("A valid email is required"),
	phone: z.string().optional(),
	password: z.string().min(6, "At least 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;

function errorMessage(error: unknown) {
	return error instanceof Error ? error.message : "Something went wrong";
}

/**
 * Auth view model: owns the login + signup TanStack Forms, the active tab and
 * the login/signup commands (via DI). On success it invalidates customer and
 * cart so the UI reflects the authenticated session and merged cart.
 */
export function useAuthViewModel() {
	const { login, signup } = useUseCases();
	const queryClient = useQueryClient();
	const invalidateAuth = () => {
		queryClient.invalidateQueries({ queryKey: queryKeys.customer() });
		queryClient.invalidateQueries({ queryKey: queryKeys.cart() });
	};

	const [tab, setTab] = useState("login");

	const loginMut = useMutation({
		mutationFn: login,
		onSuccess: invalidateAuth,
	});
	const signupMut = useMutation({
		mutationFn: signup,
		onSuccess: invalidateAuth,
	});

	const loginForm = useForm({
		defaultValues: { email: "", password: "" } as LoginFormValues,
		validators: { onChange: loginSchema },
		onSubmit: async ({ value }) => {
			try {
				await loginMut.mutateAsync(value);
			} catch (error) {
				toast.error(errorMessage(error));
			}
		},
	});

	const signupForm = useForm({
		defaultValues: {
			first_name: "",
			last_name: "",
			email: "",
			phone: "",
			password: "",
		} as SignupFormValues,
		validators: { onChange: signupSchema },
		onSubmit: async ({ value }) => {
			try {
				await signupMut.mutateAsync(value);
			} catch (error) {
				toast.error(errorMessage(error));
			}
		},
	});

	return {
		state: {
			tab,
			loginForm,
			signupForm,
			isLoggingIn: loginMut.isPending,
			isSigningUp: signupMut.isPending,
		},
		actions: { setTab },
	};
}

export type AuthViewModel = ReturnType<typeof useAuthViewModel>;
