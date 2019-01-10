import { InjectedIntl } from "react-intl";
import memoizeIntlConstructor from "intl-format-cache";

// Use a memoized formatter as creating instances of Intl formats is an expensive operation
const getNumberFormat = memoizeIntlConstructor(Intl.NumberFormat);

export const intlStyle = {
  DECIMAL: "decimal",
  PERCENT: "percent",
  CURRENCY: "currency"
};

// Find the default minimum fraction digits for a locale and currency code
export function getDefaultFractionDigitsForLocale(
  locale: string,
  currency?: string
) {
  const style = typeof currency === "string" ? "currency" : "decimal";
  const numberFormat = getNumberFormat(locale, { currency, style });
  const {
    minimumFractionDigits,
    maximumFractionDigits
  } = numberFormat.resolvedOptions();
  return { minimumFractionDigits, maximumFractionDigits };
}

export function getDecimalSeparator({ formatNumber }: InjectedIntl) {
  const testValue = formatNumber(1.1);
  return testValue[1];
}

export function parseDecimal(value: unknown, decimalSeparator: string) {
  // Return the value as-is if it's already a number
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    if (value.trim() === "") {
      return undefined;
    }

    // Build regex to strip out everything except digits and decimal point
    const regex = new RegExp(`[^0-9${decimalSeparator}]`, "g");
    const parsedValue = parseFloat(
      value
        .replace(regex, "") // strip out any cruft
        .replace(decimalSeparator, ".") // make sure decimal point is standard
    );

    return !Number.isNaN(parsedValue) ? parsedValue : undefined;
  }

  // TODO: What should be the default value?
  return undefined;
}
