import { TextField } from "@/design-system/form/text-field";
import { Button } from "@/design-system/ui/button";
import { Card } from "@/design-system/ui/card";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/design-system/ui/tabs";
import { m } from "@/paraglide/messages";
import { useAuthViewModel } from "@/presentation/shared-view-models/auth-view-model";

export function AuthPanel() {
	const { state, actions } = useAuthViewModel();
	const { loginForm, signupForm } = state;

	return (
		<div className="mx-auto max-w-md px-4 py-16">
			<Tabs value={state.tab} onValueChange={actions.setTab}>
				<TabsList className="mb-6 w-full">
					<TabsTrigger value="login" className="flex-1">
						{m.auth_sign_in()}
					</TabsTrigger>
					<TabsTrigger value="register" className="flex-1">
						{m.auth_register()}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="login">
					<Card className="p-6">
						<form
							className="flex flex-col gap-4"
							onSubmit={(e) => {
								e.preventDefault();
								loginForm.handleSubmit();
							}}
						>
							<loginForm.Field name="email">
								{(field) => (
									<TextField
										field={field}
										label={m.auth_email()}
										type="email"
										autoComplete="email"
									/>
								)}
							</loginForm.Field>
							<loginForm.Field name="password">
								{(field) => (
									<TextField
										field={field}
										label={m.auth_password()}
										type="password"
										autoComplete="current-password"
									/>
								)}
							</loginForm.Field>
							<Button
								type="submit"
								className="w-full"
								disabled={state.isLoggingIn}
							>
								{state.isLoggingIn ? m.auth_signing_in() : m.auth_sign_in()}
							</Button>
						</form>
					</Card>
				</TabsContent>

				<TabsContent value="register">
					<Card className="p-6">
						<form
							className="flex flex-col gap-4"
							onSubmit={(e) => {
								e.preventDefault();
								signupForm.handleSubmit();
							}}
						>
							<div className="grid grid-cols-2 gap-4">
								<signupForm.Field name="first_name">
									{(field) => (
										<TextField
											field={field}
											label={m.auth_first_name()}
											autoComplete="given-name"
										/>
									)}
								</signupForm.Field>
								<signupForm.Field name="last_name">
									{(field) => (
										<TextField
											field={field}
											label={m.auth_last_name()}
											autoComplete="family-name"
										/>
									)}
								</signupForm.Field>
							</div>
							<signupForm.Field name="email">
								{(field) => (
									<TextField
										field={field}
										label={m.auth_email()}
										type="email"
										autoComplete="email"
									/>
								)}
							</signupForm.Field>
							<signupForm.Field name="phone">
								{(field) => (
									<TextField
										field={field}
										label={m.auth_phone_optional()}
										type="tel"
										autoComplete="tel"
									/>
								)}
							</signupForm.Field>
							<signupForm.Field name="password">
								{(field) => (
									<TextField
										field={field}
										label={m.auth_password()}
										type="password"
										autoComplete="new-password"
									/>
								)}
							</signupForm.Field>
							<Button
								type="submit"
								className="w-full"
								disabled={state.isSigningUp}
							>
								{state.isSigningUp
									? m.auth_creating_account()
									: m.auth_create_account()}
							</Button>
						</form>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
