import { Trash2 } from "lucide-react";
import { useParams } from "@tanstack/react-router";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAddressesViewModel } from "./account-addresses-view-model";

export function AddressesPage() {
	const { countryCode } = useParams({ from: "/$countryCode/_storefront/account/addresses" });
	const { state, actions } = useAddressesViewModel(countryCode);
	const { region, form } = state;

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="text-h3 font-bold tracking-tight text-foreground">
					Addresses
				</h1>
				<Button variant="outline" onClick={actions.toggleForm}>
					{state.showForm ? "Cancel" : "Add address"}
				</Button>
			</div>

			{state.showForm && (
				<Card className="p-6">
					<form
						className="flex flex-col gap-4"
						onSubmit={(e) => {
							e.preventDefault();
							form.handleSubmit();
						}}
					>
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
							<form.Field name="country_code">
								{(field) => (
									<div className="flex flex-col gap-2">
										<Label htmlFor={field.name}>Country</Label>
										<Select
											value={field.state.value}
											onValueChange={(value) => field.handleChange(value)}
										>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="Country" />
											</SelectTrigger>
											<SelectContent>
												{(region?.countries ?? []).map((country) => (
													<SelectItem
														key={country.iso_2}
														value={country.iso_2 ?? ""}
													>
														{country.display_name ?? country.iso_2}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								)}
							</form.Field>
							<form.Field name="phone">
								{(field) => (
									<TextField field={field} label="Phone" autoComplete="tel" />
								)}
							</form.Field>
						</div>
						<Button type="submit" className="w-full" disabled={state.isAdding}>
							{state.isAdding ? "Saving…" : "Save address"}
						</Button>
					</form>
				</Card>
			)}

			{state.addresses.length ? (
				<div className="grid gap-4 sm:grid-cols-2">
					{state.addresses.map((address) => (
						<Card key={address.id} className="flex justify-between gap-4 p-4">
							<div className="text-sm">
								<p className="font-medium">
									{address.first_name} {address.last_name}
								</p>
								<p className="text-muted-foreground">
									{address.address_1}
									<br />
									{address.postal_code} {address.city}
									<br />
									{address.country_code?.toUpperCase()}
								</p>
							</div>
							<Button
								variant="ghost"
								size="icon-sm"
								aria-label="Delete address"
								onClick={() => actions.deleteAddress(address.id)}
							>
								<Trash2 className="size-4" />
							</Button>
						</Card>
					))}
				</div>
			) : (
				<p className="text-muted-foreground">No saved addresses.</p>
			)}
		</div>
	);
}
