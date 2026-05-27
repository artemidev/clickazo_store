import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	customerQueryOptions,
	useAddCustomerAddress,
	useDeleteCustomerAddress,
} from "@/application/customer";
import { regionQueryOptions } from "@/application/regions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute(
	"/$countryCode/_storefront/account/addresses",
)({
	component: AddressesPage,
});

function AddressesPage() {
	const { countryCode } = Route.useParams();
	const { data: customer } = useSuspenseQuery(customerQueryOptions());
	const { data: region } = useSuspenseQuery(regionQueryOptions(countryCode));
	const addAddress = useAddCustomerAddress();
	const deleteAddress = useDeleteCustomerAddress();
	const [country, setCountry] = useState(region?.countries?.[0]?.iso_2 ?? "");
	const [showForm, setShowForm] = useState(false);

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Addresses</h1>
				<Button variant="outline" onClick={() => setShowForm((v) => !v)}>
					{showForm ? "Cancel" : "Add address"}
				</Button>
			</div>

			{showForm && (
				<Card className="p-6">
					<form
						className="flex flex-col gap-4"
						onSubmit={(e) => {
							e.preventDefault();
							const data = new FormData(e.currentTarget);
							addAddress.mutate(
								{
									first_name: String(data.get("first_name")),
									last_name: String(data.get("last_name")),
									address_1: String(data.get("address_1")),
									city: String(data.get("city")),
									postal_code: String(data.get("postal_code")),
									country_code: country,
									phone: String(data.get("phone") || ""),
								},
								{
									onSuccess: () => {
										toast.success("Address added");
										setShowForm(false);
									},
									onError: (err) =>
										toast.error(err instanceof Error ? err.message : "Failed"),
								},
							);
						}}
					>
						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col gap-2">
								<Label htmlFor="first_name">First name</Label>
								<Input id="first_name" name="first_name" required />
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="last_name">Last name</Label>
								<Input id="last_name" name="last_name" required />
							</div>
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="address_1">Address</Label>
							<Input id="address_1" name="address_1" required />
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col gap-2">
								<Label htmlFor="postal_code">Postal code</Label>
								<Input id="postal_code" name="postal_code" required />
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="city">City</Label>
								<Input id="city" name="city" required />
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col gap-2">
								<Label>Country</Label>
								<Select value={country} onValueChange={setCountry}>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Country" />
									</SelectTrigger>
									<SelectContent>
										{(region?.countries ?? []).map((c) => (
											<SelectItem key={c.iso_2} value={c.iso_2 ?? ""}>
												{c.display_name ?? c.iso_2}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="phone">Phone</Label>
								<Input id="phone" name="phone" />
							</div>
						</div>
						<Button type="submit" disabled={addAddress.isPending}>
							{addAddress.isPending ? "Saving…" : "Save address"}
						</Button>
					</form>
				</Card>
			)}

			{customer?.addresses?.length ? (
				<div className="grid gap-4 sm:grid-cols-2">
					{customer.addresses.map((address) => (
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
								onClick={() => deleteAddress.mutate(address.id)}
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
