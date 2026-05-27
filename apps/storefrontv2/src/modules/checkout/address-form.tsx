import { zodResolver } from "@hookform/resolvers/zod";
import type { HttpTypes } from "@medusajs/types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const addressSchema = z.object({
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

export function AddressForm({
	region,
	defaultValues,
	isSubmitting,
	onSubmit,
}: {
	region: HttpTypes.StoreRegion;
	defaultValues?: Partial<AddressFormValues>;
	isSubmitting?: boolean;
	onSubmit: (values: AddressFormValues) => void;
}) {
	const form = useForm<AddressFormValues>({
		resolver: zodResolver(addressSchema),
		defaultValues: {
			email: "",
			first_name: "",
			last_name: "",
			company: "",
			address_1: "",
			postal_code: "",
			city: "",
			province: "",
			country_code: region.countries?.[0]?.iso_2 ?? "",
			phone: "",
			...defaultValues,
		},
	});

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4"
			>
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input type="email" autoComplete="email" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="grid grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="first_name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>First name</FormLabel>
								<FormControl>
									<Input autoComplete="given-name" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="last_name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Last name</FormLabel>
								<FormControl>
									<Input autoComplete="family-name" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={form.control}
					name="company"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Company (optional)</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="address_1"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Address</FormLabel>
							<FormControl>
								<Input autoComplete="address-line1" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="grid grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="postal_code"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Postal code</FormLabel>
								<FormControl>
									<Input autoComplete="postal-code" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="city"
						render={({ field }) => (
							<FormItem>
								<FormLabel>City</FormLabel>
								<FormControl>
									<Input autoComplete="address-level2" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="province"
						render={({ field }) => (
							<FormItem>
								<FormLabel>State / Province (optional)</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="country_code"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Country</FormLabel>
								<Select value={field.value} onValueChange={field.onChange}>
									<FormControl>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select a country" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{(region.countries ?? []).map((country) => (
											<SelectItem
												key={country.iso_2}
												value={country.iso_2 ?? ""}
											>
												{country.display_name ?? country.iso_2}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={form.control}
					name="phone"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Phone (optional)</FormLabel>
							<FormControl>
								<Input autoComplete="tel" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? "Saving…" : "Save and continue"}
				</Button>
			</form>
		</Form>
	);
}
