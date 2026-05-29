import { createContext, type ReactNode, useContext, useMemo } from "react";
import { type AppContainer, buildContainer } from "./container";

const DependencyContext = createContext<AppContainer | null>(null);

/**
 * Provides the dependency container (repositories + use cases) to the tree.
 * Pass `value` in tests to inject a fake container; in production it builds the
 * default server-backed container once. The container is stateless, so the
 * QueryClient (router context) remains the single source of cache/state.
 */
export function DependencyProvider({
	children,
	value,
}: {
	children: ReactNode;
	value?: AppContainer;
}) {
	const container = useMemo(() => value ?? buildContainer(), [value]);
	return (
		<DependencyContext.Provider value={container}>
			{children}
		</DependencyContext.Provider>
	);
}

export function useDependencies(): AppContainer {
	const ctx = useContext(DependencyContext);
	if (!ctx) {
		throw new Error("useDependencies must be used within <DependencyProvider>");
	}
	return ctx;
}

/** Ergonomic selector: the use cases consumed by view models. */
export function useUseCases() {
	return useDependencies().useCases;
}
