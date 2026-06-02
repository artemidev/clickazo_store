import { TextField } from "@/design-system/form/text-field";
import { Button } from "@/design-system/ui/button";
import { Card } from "@/design-system/ui/card";
import { Input } from "@/design-system/ui/input";
import { Label } from "@/design-system/ui/label";
import { m } from "@/paraglide/messages";
import { useProfileViewModel } from "./account-profile-view-model";

export function ProfilePage() {
	const { state } = useProfileViewModel();
	const { customer, form } = state;

	return (
		<div className="max-w-lg">
			<h1 className="mb-5 text-h3 font-bold tracking-tight text-foreground">
				{m.profile_title()}
			</h1>
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
									label={m.address_first_name()}
									autoComplete="given-name"
								/>
							)}
						</form.Field>
						<form.Field name="last_name">
							{(field) => (
								<TextField
									field={field}
									label={m.address_last_name()}
									autoComplete="family-name"
								/>
							)}
						</form.Field>
					</div>
					<form.Field name="phone">
						{(field) => (
							<TextField
								field={field}
								label={m.address_phone()}
								autoComplete="tel"
							/>
						)}
					</form.Field>
					<div className="flex flex-col gap-2">
						<Label>{m.profile_email()}</Label>
						<Input value={customer?.email ?? ""} disabled />
					</div>
					<Button type="submit" className="w-full" disabled={state.isSaving}>
						{state.isSaving ? m.common_saving() : m.profile_save()}
					</Button>
				</form>
			</Card>
		</div>
	);
}
