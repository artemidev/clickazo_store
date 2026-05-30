import { ThemeProvider as NextThemesProvider } from "next-themes";
import type * as React from "react";

/**
 * App theme provider. Toggles the `.dark` class on <html> (matching the
 * `@custom-variant dark` selector in styles.css). Light is the default.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
	return (
		<NextThemesProvider
			attribute="class"
			defaultTheme="light"
			enableSystem={false}
			disableTransitionOnChange
		>
			{children}
		</NextThemesProvider>
	);
}
