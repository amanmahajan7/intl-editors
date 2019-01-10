/* eslint-disable react/style-prop-object */
import * as React from "react";
import { FormattedNumber, injectIntl, InjectedIntlProps } from "react-intl";

import { getDefaultFractionDigitsForLocale, intlStyle } from "./IntlUtils";

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface IntegerFormatterProps {
  // TODO: should it be a string and parsed before formatting?
  value: number | undefined | null;
}

interface FormatterProps extends IntegerFormatterProps {
  /**
   * The minimum number of fraction digits to use. Possible values are from 0 to 20;
   * the default for plain number and percent formatting is 0; the default for currency
   * formatting is the number of minor unit digits provided by the ISO 4217 currency code list
   */
  minimumFractionDigits?: number;

  /**
   * The maximum number of fraction digits to use. Possible values are from 0 to 20;
   * the default for plain number formatting is the larger of minimumFractionDigits and 3;
   * the default for currency formatting is the larger of minimumFractionDigits and
   * the number of minor unit digits provided by the ISO 4217 currency code list
   */
  maximumFractionDigits?: number;
}

export interface CurrencyFormatterProps extends FormatterProps {
  /**
   * The currency to use in currency formatting. Possible values are the ISO 4217 currency codes,
   * such as "USD" for the US dollar, "EUR" for the euro, or "CNY" for the Chinese RMB
   */
  currency: string;
}

type NumberFormatterProps = Omit<FormattedNumber.Props, "value"> &
  IntegerFormatterProps;
export type DecimalFormatterProps = FormatterProps;
export type PercentFormatterProps = FormatterProps;
type RateFormatterBaseProps = CurrencyFormatterProps & InjectedIntlProps;

export function getDefaultFractionDigits(
  { minimumFractionDigits, maximumFractionDigits }: NumberFormatterProps,
  defaultFractionDigits: number | (() => number)
) {
  const extraProps: Partial<FormattedNumber.Props> = {};
  if (
    typeof minimumFractionDigits === "undefined" &&
    typeof maximumFractionDigits === "undefined"
  ) {
    // Currently the default value is only set when both minimum and maximum fraction digits are not specified.
    // Do we need to handle default values of individual fraction digits?
    const defaultDigits =
      typeof defaultFractionDigits === "function"
        ? defaultFractionDigits()
        : defaultFractionDigits;

    extraProps.minimumFractionDigits = defaultDigits;
    extraProps.maximumFractionDigits = defaultDigits;
  }

  return extraProps;
}

function NumberFormatter({ value, ...rest }: NumberFormatterProps) {
  return value != null ? <FormattedNumber value={value} {...rest} /> : null;
}

export function DecimalFormatter(props: DecimalFormatterProps) {
  const extraProps = getDefaultFractionDigits(props, 2);
  return (
    <NumberFormatter {...props} {...extraProps} style={intlStyle.DECIMAL} />
  );
}

export function IntegerFormatter(props: IntegerFormatterProps) {
  return <DecimalFormatter {...props} maximumFractionDigits={0} />;
}

export function CurrencyFormatter(props: CurrencyFormatterProps) {
  return <NumberFormatter {...props} style={intlStyle.CURRENCY} />;
}

export function PercentFormatter(props: PercentFormatterProps) {
  const extraProps = getDefaultFractionDigits(props, 2);
  return (
    <NumberFormatter {...props} {...extraProps} style={intlStyle.PERCENT} />
  );
}

function RateFormatterBase({ intl, ...props }: RateFormatterBaseProps) {
  // Rates are shown with 2 positions more than the default minimum fraction digits, e.g. 4 for pound, 2 for krona
  const extraProps = getDefaultFractionDigits(
    props,
    () =>
      getDefaultFractionDigitsForLocale(intl.locale, props.currency)
        .minimumFractionDigits + 2
  );
  return <CurrencyFormatter {...props} {...extraProps} />;
}

export const RateFormatter = injectIntl(RateFormatterBase);
