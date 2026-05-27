import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { listLocales, updateLocale } from "@/infrastructure/server/locales";
import { queryKeys } from "./query-keys";

export const localesQueryOptions = () =>
	queryOptions({
		queryKey: queryKeys.locales(),
		queryFn: () => listLocales(),
		staleTime: 60 * 60 * 1000,
	});

export function useUpdateLocale() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (localeCode: string) => updateLocale({ data: localeCode }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.cart() });
			queryClient.invalidateQueries({ queryKey: queryKeys.products.all() });
		},
	});
}
