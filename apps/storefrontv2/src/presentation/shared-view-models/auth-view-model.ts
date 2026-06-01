import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useCacheActions } from "@/application/cache";
import { useUseCases } from "@/di/context";
import {
	type LoginFormValues,
	loginSchema,
	type SignupFormValues,
	signupSchema,
} from "@/domain/auth/auth-schemas";
import { getErrorMessage } from "@/shared/utils";

/**
 * Auth view model: owns the login + signup TanStack Forms, the active tab and
 * the login/signup commands (via DI). On success it invalidates customer and
 * cart so the UI reflects the authenticated session and merged cart.
 */
export function useAuthViewModel() {
	const useCases = useUseCases();
	const cache = useCacheActions();

	const [tab, setTab] = useState("login");

	const loginMut = useMutation({
		mutationFn: useCases.login,
		onSuccess: cache.invalidateSession,
	});
	const signupMut = useMutation({
		mutationFn: useCases.signup,
		onSuccess: cache.invalidateSession,
	});

	const loginForm = useForm({
		defaultValues: { email: "", password: "" } as LoginFormValues,
		validators: { onChange: loginSchema },
		onSubmit: async ({ value }) => {
			try {
				await loginMut.mutateAsync(value);
			} catch (error) {
				toast.error(getErrorMessage(error));
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
				toast.error(getErrorMessage(error));
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
