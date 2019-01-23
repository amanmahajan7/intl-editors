/* eslint-disable react/style-prop-object */
import * as React from 'react';
import { FormattedNumber, injectIntl, InjectedIntlProps } from 'react-intl';

import {
  getDefaultFractionDigitsForLocale,
  intlStyle,
  defaultFractionDigits,
  extraFractionDigits
} from './IntlUtils';

type SupportedFormattedNumberProps = Pick<
  FormattedNumber.Props,
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat#Parameters
  'style' | 'currency' | 'minimumFractionDigits' | 'maximumFractionDigits' | 'children'
>;

type NumberFormatterProps = SupportedFormattedNumberProps & {
  value: number | undefined | null;
  defaultFractionDigits?: number;
};

function NumberFormatter({ value, minimumFractionDigits, maximumFractionDigits, defaultFractionDigits, ...props }: NumberFormatterProps) {
  if (value == null) {
    return null;
  }

  if (typeof minimumFractionDigits === 'undefined' && typeof maximumFractionDigits === 'undefined' && typeof defaultFractionDigits !== 'undefined') {
    minimumFractionDigits = defaultFractionDigits;
    maximumFractionDigits = defaultFractionDigits;
  }

  return (
    <FormattedNumber
      {...props}
      value={value}
      minimumFractionDigits={minimumFractionDigits}
      maximumFractionDigits={maximumFractionDigits} />
  );
}

export type DecimalFormatterProps = Pick<NumberFormatterProps, 'value' | 'minimumFractionDigits' | 'maximumFractionDigits' | 'children'>;
export function DecimalFormatter(props: DecimalFormatterProps) {
  return (
    <NumberFormatter
      {...props}
      style={intlStyle.DECIMAL}
      defaultFractionDigits={defaultFractionDigits.DECIMAL} />
  );
}

export type IntegerFormatterProps = Pick<NumberFormatterProps, 'value' | 'children'>;
export function IntegerFormatter(props: IntegerFormatterProps) {
  return (
    <DecimalFormatter
      {...props}
      minimumFractionDigits={0}
      maximumFractionDigits={0} />
  );
}

export type UnitsFormatterProps = IntegerFormatterProps;
export { IntegerFormatter as UnitsFormatter };

export type PercentFormatterProps = DecimalFormatterProps;
export function PercentFormatter(props: PercentFormatterProps) {
  return (
    <NumberFormatter
      {...props}
      style={intlStyle.PERCENT}
      defaultFractionDigits={defaultFractionDigits.PERCENT} />
  );
}

export type CurrencyFormatterProps = Pick<NumberFormatterProps, 'value' | 'currency' | 'minimumFractionDigits' | 'maximumFractionDigits' | 'children'>;
export function CurrencyFormatter(props: CurrencyFormatterProps) {
  return <NumberFormatter {...props} style={intlStyle.CURRENCY} />;
}

type DefaultCurrencyFormatterBaseProps = DefaultCurrencyFormatterProps & InjectedIntlProps & { extraFractionDigits: number };
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

type DefaultCurrencyFormatterProps = Pick<CurrencyFormatterProps, 'value' | 'currency' | 'children'>;
const DefaultCurrencyFormatter = injectIntl(DefaultCurrencyFormatterBase);

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
