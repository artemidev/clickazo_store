/** Locale repository contract (port). */
export interface LocaleRepository {
	update(localeCode: string): Promise<string>;
}
