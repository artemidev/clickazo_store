import type { HttpTypes } from "@medusajs/types";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { CheckoutViewModel } from "@/presentation/pages/checkout/use-checkout-view-model";

type AddressFormApi = CheckoutViewModel["state"]["addressForm"];

/**
 * Presentational address form. The TanStack Form instance is owned by the
 * checkout view model and passed in, so this component only renders fields and
 * forwards intents.
 */
export function AddressForm({
	form,
	region,
	isSubmitting,
}: {
	form: AddressFormApi;
	region: HttpTypes.StoreRegion;
	isSubmitting: boolean;
}) {
	return (
		<form
			className="flex flex-col gap-4"
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<form.Field name="email">
				{(field) => (
					<TextField
						field={field}
						label="Email"
						type="email"
						autoComplete="email"
					/>
				)}
			</form.Field>

			<div className="grid grid-cols-2 gap-4">
				<form.Field name="first_name">
					{(field) => (
						<TextField
							field={field}
							label="First name"
							autoComplete="given-name"
						/>
					)}
				</form.Field>
				<form.Field name="last_name">
					{(field) => (
						<TextField
							field={field}
							label="Last name"
							autoComplete="family-name"
						/>
					)}
				</form.Field>
			</div>

			<form.Field name="company">
				{(field) => <TextField field={field} label="Company (optional)" />}
			</form.Field>

			<form.Field name="address_1">
				{(field) => (
					<TextField
						field={field}
						label="Address"
						autoComplete="address-line1"
					/>
				)}
			</form.Field>

			<div className="grid grid-cols-2 gap-4">
				<form.Field name="postal_code">
					{(field) => (
						<TextField
							field={field}
							label="Postal code"
							autoComplete="postal-code"
						/>
					)}
				</form.Field>
				<form.Field name="city">
					{(field) => (
						<TextField
							field={field}
							label="City"
							autoComplete="address-level2"
						/>
					)}
				</form.Field>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<form.Field name="province">
					{(field) => (
						<TextField field={field} label="State / Province (optional)" />
					)}
				</form.Field>
				<form.Field name="country_code">
					{(field) => (
						<div className="flex flex-col gap-2">
							<Label htmlFor={field.name}>Country</Label>
							<Select
								value={field.state.value}
								onValueChange={(value) => field.handleChange(value)}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Select a country" />
								</SelectTrigger>
								<SelectContent>
									{(region.countries ?? []).map((country) => (
										<SelectItem key={country.iso_2} value={country.iso_2 ?? ""}>
											{country.display_name ?? country.iso_2}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					)}
				</form.Field>
			</div>

			<form.Field name="phone">
				{(field) => (
					<TextField
						field={field}
						label="Phone (optional)"
						autoComplete="tel"
					/>
				)}
			</form.Field>

			<Button type="submit" className="w-full" disabled={isSubmitting}>
				{isSubmitting ? "Saving…" : "Save and continue"}
			</Button>
		</form>
	);
}
