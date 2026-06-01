import { Link } from "@tanstack/react-router";

export function NotFound({ children }: { children?: React.ReactNode }) {
	return (
		<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
			<h1 className="text-2xl font-semibold">Page not found</h1>
			<div className="text-muted-foreground">
				{children ?? "The page you were looking for doesn't exist."}
			</div>
			<Link
				to="/"
				className="text-sm font-medium text-primary underline-offset-4 hover:underline"
			>
				Go home
			</Link>
		</div>
	);
}
