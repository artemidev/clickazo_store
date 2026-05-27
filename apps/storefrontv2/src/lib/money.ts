export const isEmpty = (input: unknown): boolean => {
	return (
		input === null ||
		input === undefined ||
		(input instanceof Object &&
			Object.keys(input as Record<string, unknown>).length === 0) ||
		(Array.isArray(input) && input.length === 0) ||
		(typeof input === "string" && input.trim().length === 0)
	);
};

type ConvertToLocaleParams = {
	amount: number;
	currency_code: string;
	minimumFractionDigits?: number;
	maximumFractionDigits?: number;
	locale?: string;
};

export const convertToLocale = ({
	amount,
	currency_code,
	minimumFractionDigits,
	maximumFractionDigits,
	locale = "en-US",
}: ConvertToLocaleParams): string => {
	return currency_code && !isEmpty(currency_code)
		? new Intl.NumberFormat(locale, {
				style: "currency",
				currency: currency_code,
				minimumFractionDigits,
				maximumFractionDigits,
			}).format(amount)
		: amount.toString();
};
