import { useState } from "react";
import { toast } from "sonner";
import { useLogin, useSignup } from "@/application/customer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function errorMessage(error: unknown) {
	return error instanceof Error ? error.message : "Something went wrong";
}

export function AuthPanel() {
	const login = useLogin();
	const signup = useSignup();
	const [tab, setTab] = useState("login");

	return (
		<div className="mx-auto max-w-md px-4 py-16">
			<Tabs value={tab} onValueChange={setTab}>
				<TabsList className="mb-6 w-full">
					<TabsTrigger value="login" className="flex-1">
						Sign in
					</TabsTrigger>
					<TabsTrigger value="register" className="flex-1">
						Register
					</TabsTrigger>
				</TabsList>

				<TabsContent value="login">
					<Card className="p-6">
						<form
							className="flex flex-col gap-4"
							onSubmit={(e) => {
								e.preventDefault();
								const data = new FormData(e.currentTarget);
								login.mutate(
									{
										email: String(data.get("email")),
										password: String(data.get("password")),
									},
									{ onError: (err) => toast.error(errorMessage(err)) },
								);
							}}
						>
							<div className="flex flex-col gap-2">
								<Label htmlFor="login-email">Email</Label>
								<Input id="login-email" name="email" type="email" required />
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="login-password">Password</Label>
								<Input
									id="login-password"
									name="password"
									type="password"
									required
								/>
							</div>
							<Button type="submit" disabled={login.isPending}>
								{login.isPending ? "Signing in…" : "Sign in"}
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
								const data = new FormData(e.currentTarget);
								signup.mutate(
									{
										email: String(data.get("email")),
										password: String(data.get("password")),
										first_name: String(data.get("first_name")),
										last_name: String(data.get("last_name")),
										phone: String(data.get("phone") || ""),
									},
									{ onError: (err) => toast.error(errorMessage(err)) },
								);
							}}
						>
							<div className="grid grid-cols-2 gap-4">
								<div className="flex flex-col gap-2">
									<Label htmlFor="reg-first">First name</Label>
									<Input id="reg-first" name="first_name" required />
								</div>
								<div className="flex flex-col gap-2">
									<Label htmlFor="reg-last">Last name</Label>
									<Input id="reg-last" name="last_name" required />
								</div>
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="reg-email">Email</Label>
								<Input id="reg-email" name="email" type="email" required />
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="reg-phone">Phone (optional)</Label>
								<Input id="reg-phone" name="phone" type="tel" />
							</div>
							<div className="flex flex-col gap-2">
								<Label htmlFor="reg-password">Password</Label>
								<Input
									id="reg-password"
									name="password"
									type="password"
									required
								/>
							</div>
							<Button type="submit" disabled={signup.isPending}>
								{signup.isPending ? "Creating account…" : "Create account"}
							</Button>
						</form>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
