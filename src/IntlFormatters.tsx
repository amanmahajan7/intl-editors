type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
/* eslint-disable react/style-prop-object */
import * as React from 'react';
import { FormattedNumber, injectIntl, InjectedIntlProps } from 'react-intl';

import {
  getDefaultFractionDigitsForLocale,
  intlStyle,
  defaultFractionDigits,
  extraFractionDigits
} from './IntlUtils';

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

type NumberFormatterProps = Omit<FormattedNumber.Props, 'value'> & IntegerFormatterProps & { defaultFractionDigits?: number; };

function NumberFormatter({ value, defaultFractionDigits, ...props }: NumberFormatterProps) {
  if (value == null) {
    return null;
  }

  const { minimumFractionDigits, maximumFractionDigits } = props;
  const extraProps: Partial<FormattedNumber.Props> = {};
  if (typeof minimumFractionDigits === 'undefined' && typeof maximumFractionDigits === 'undefined' && typeof defaultFractionDigits !== 'undefined') {
    extraProps.minimumFractionDigits = defaultFractionDigits;
    extraProps.maximumFractionDigits = defaultFractionDigits;
  }

  return (
    <FormattedNumber value={value} {...props} {...extraProps}>
      {formattedNumber => formattedNumber}
    </FormattedNumber>
  );
}

export type DecimalFormatterProps = FormatterProps;

export function DecimalFormatter(props: DecimalFormatterProps) {
  return (
    <NumberFormatter
      {...props}
      style={intlStyle.DECIMAL}
      defaultFractionDigits={defaultFractionDigits.DECIMAL} />
  );
}

export function IntegerFormatter(props: IntegerFormatterProps) {
  return (
    <DecimalFormatter
      {...props}
      maximumFractionDigits={0} />
  );
}

export type UnitsFormatterProps = IntegerFormatterProps;

export { IntegerFormatter as UnitsFormatter };

export type PercentFormatterProps = FormatterProps;

export function PercentFormatter(props: PercentFormatterProps) {
  return (
    <NumberFormatter
      {...props}
      style={intlStyle.PERCENT}
      defaultFractionDigits={defaultFractionDigits.PERCENT} />
  );
}

export interface CurrencyFormatterProps extends FormatterProps {
  /**
   * The currency to use in currency formatting. Possible values are the ISO 4217 currency codes,
   * such as "USD" for the US dollar, "EUR" for the euro, or "CNY" for the Chinese RMB
   */
  currency: string;
}

export function CurrencyFormatter(props: CurrencyFormatterProps) {
  return <NumberFormatter {...props} style={intlStyle.CURRENCY} />;
}

export type DefaultCurrencyFormatterProps = Pick<CurrencyFormatterProps, 'value' | 'currency'>;
type DefaultCurrencyFormatterBaseProps = RateFormatterProps & InjectedIntlProps & { extraFractionDigits: number };

function DefaultCurrencyFormatterBase({ intl, extraFractionDigits, ...props }: DefaultCurrencyFormatterBaseProps) {
  // Add extra fraction digits to the default minimum fraction digits for the current locale and currency
  const defaultFractionDigits = getDefaultFractionDigitsForLocale(
    intl.locale, {
      style: intlStyle.CURRENCY,
      currency: props.currency
    }
  ).minimumFractionDigits + extraFractionDigits;

  return (
    <CurrencyFormatter
      {...props}
      minimumFractionDigits={defaultFractionDigits}
      maximumFractionDigits={defaultFractionDigits} />
  );
}

export const DefaultCurrencyFormatter = injectIntl(DefaultCurrencyFormatterBase);

export type RateFormatterProps = DefaultCurrencyFormatterProps;

export function RateFormatter(props: RateFormatterProps) {
  return (
    <DefaultCurrencyFormatter
      {...props}
      extraFractionDigits={extraFractionDigits.RATE} />
  );
}

export type TechRateFormatterProps = DefaultCurrencyFormatterProps;

export function TechRateFormatter(props: TechRateFormatterProps) {
  return (
    <DefaultCurrencyFormatter
      {...props}
      extraFractionDigits={extraFractionDigits.TECH_RATE} />
  );
}
