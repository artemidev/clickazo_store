import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import {
	customerQueryOptions,
	useUpdateCustomer,
} from "@/application/customer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute(
	"/$countryCode/_storefront/account/profile",
)({
	component: ProfilePage,
});

function ProfilePage() {
	const { data: customer } = useSuspenseQuery(customerQueryOptions());
	const updateCustomer = useUpdateCustomer();

	return (
		<div className="max-w-lg">
			<h1 className="mb-4 text-2xl font-semibold">Profile</h1>
			<Card className="p-6">
				<form
					className="flex flex-col gap-4"
					onSubmit={(e) => {
						e.preventDefault();
						const data = new FormData(e.currentTarget);
						updateCustomer.mutate(
							{
								first_name: String(data.get("first_name")),
								last_name: String(data.get("last_name")),
								phone: String(data.get("phone") || ""),
							},
							{
								onSuccess: () => toast.success("Profile updated"),
								onError: (err) =>
									toast.error(err instanceof Error ? err.message : "Failed"),
							},
						);
					}}
				>
					<div className="grid grid-cols-2 gap-4">
						<div className="flex flex-col gap-2">
							<Label htmlFor="first_name">First name</Label>
							<Input
								id="first_name"
								name="first_name"
								defaultValue={customer?.first_name ?? ""}
							/>
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor="last_name">Last name</Label>
							<Input
								id="last_name"
								name="last_name"
								defaultValue={customer?.last_name ?? ""}
							/>
						</div>
					</div>
					<div className="flex flex-col gap-2">
						<Label htmlFor="phone">Phone</Label>
						<Input
							id="phone"
							name="phone"
							defaultValue={customer?.phone ?? ""}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Label>Email</Label>
						<Input value={customer?.email ?? ""} disabled />
					</div>
					<Button type="submit" disabled={updateCustomer.isPending}>
						{updateCustomer.isPending ? "Saving…" : "Save changes"}
					</Button>
				</form>
			</Card>
		</div>
	);
}
