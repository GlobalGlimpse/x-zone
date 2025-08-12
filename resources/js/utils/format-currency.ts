// resources/js/utils/format-currency.ts
export function formatCurrency(
    value: number | null | undefined,
    currencyCode = "MAD",
    locale = "fr-MA"
): string {
    if (value === null || value === undefined) return "";
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}
