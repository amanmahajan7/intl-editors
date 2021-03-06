/* eslint-disable react/style-prop-object */
import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Icon, Input, InputProps } from "semantic-ui-react";


import {
  getDecimalSeparator,
  getDefaultFractionDigitsForLocale,
  parseDecimal as parseNumber,
  intlStyle,
  defaultFractionDigits,
  extraFractionDigits
} from './IntlUtils';

export const replaceAll = (
  stringToWorkOn: string,
  stringToReplace: string,
  stringToReplaceWith: string,
  ignoreCase = false
): string => {
  const re = new RegExp(
    stringToReplace.replace(/([/,!\\^${}[\]().*+?|<>\-&])/g, "\\$&"),
    ignoreCase ? "gi" : "g"
  );
  stringToReplaceWith =
    typeof stringToReplaceWith === "string"
      ? stringToReplaceWith.replace(/\$/g, "$$$$")
      : stringToReplaceWith;
  return stringToWorkOn.replace(re, stringToReplaceWith);
};

const DECIMAL_REGEX = /[.,]/;
const NUMBER_REGEX = /^\d*[.,]?\d*$/;
const NBSP = '\u00A0';

export type NumberEditorChildrenProps = { isInvalid: boolean; getInputProps: () => InputProps; };
export type NumberEditorChildren = (props: NumberEditorChildrenProps) => React.ReactNode;
export type NumberEditorBaseProps = NumberEditorProps & InjectedIntlProps;

export type SupportedHtmlInputProps = Pick<
  React.HTMLProps<HTMLInputElement>,
  'autoFocus' | 'disabled' | 'readOnly' | 'name' | 'tabIndex' | 'title'
>;

type SupportedNumberFormatOptions = Pick<
  Intl.NumberFormatOptions,
  'style' | 'currency' | 'minimumFractionDigits' | 'maximumFractionDigits'
>;

export type NumberEditorProps = SupportedHtmlInputProps & SupportedNumberFormatOptions & {
  value?: number;
  defaultFractionDigits?: number;
  extraFractionDigits?: number;
  children: NumberEditorChildren;
  onChange: (value?: number) => void;
};

interface NumberEditorBaseState {
  displayValue: string;
  isInvalid: boolean;
  isFocused: boolean;
}

type InternalSetStateParams = NumberEditorBaseState & { value?: number; };

function replaceDecimalSeparator(value: string | number | undefined | null, separator: string) {
  return value != null
    ? value.toString().replace(DECIMAL_REGEX, separator)
    : '';
}

class NumberEditorBase extends React.Component<NumberEditorBaseProps, NumberEditorBaseState> {
  readonly decimalSeparator: string;
  readonly minimumFractionDigits: number;
  readonly maximumFractionDigits: number;
  readonly state: Readonly<NumberEditorBaseState>;

  input = React.createRef<Input>();

  constructor(props: NumberEditorBaseProps) {
    super(props);
    const { intl, currency, style, minimumFractionDigits, maximumFractionDigits, defaultFractionDigits, extraFractionDigits } = this.props;
    // The default value of minimumFractionDigits for currency formatting is the number of minor unit digits provided by the ISO 4217 currency code list
    // If the maximumFractionDigits value is less than the default minimumFractionDigits then Intl.NumberFormat throws an error.
    let minimumFractionDigitsForStyle = minimumFractionDigits;
    if (style === intlStyle.CURRENCY && typeof minimumFractionDigits === 'undefined' && typeof maximumFractionDigits !== 'undefined') {
      const { minimumFractionDigits: minimumFractionDigitsForCurrency } = getDefaultFractionDigitsForLocale(intl.locale, { currency, style });
      if (minimumFractionDigitsForCurrency > maximumFractionDigits) {
        minimumFractionDigitsForStyle = maximumFractionDigits;
      }
    }

    const {
      minimumFractionDigits: minimumFractionDigitsForLocale,
      maximumFractionDigits: maximumFractionDigitsForLocale
    } = getDefaultFractionDigitsForLocale(intl.locale, {
      currency,
      style,
      minimumFractionDigits: minimumFractionDigitsForStyle,
      maximumFractionDigits
    });

    this.decimalSeparator = getDecimalSeparator(intl);
    this.minimumFractionDigits = minimumFractionDigitsForLocale;
    this.maximumFractionDigits = maximumFractionDigitsForLocale;
    if (typeof minimumFractionDigits === 'undefined' && typeof maximumFractionDigits === 'undefined') {
      // Only set default values if none of the fraction digits are provided
      if (typeof defaultFractionDigits !== 'undefined') {
        this.minimumFractionDigits = defaultFractionDigits;
        this.maximumFractionDigits = defaultFractionDigits;
      } else if (typeof extraFractionDigits !== 'undefined') {
        this.minimumFractionDigits = minimumFractionDigitsForLocale + extraFractionDigits;
        this.maximumFractionDigits = minimumFractionDigitsForLocale + extraFractionDigits;
      }
    }

    this.state = this.getInitialState();
  }

  isCopyPaste = false;

  componentDidMount() {
    const { autoFocus } = this.props;
    if (autoFocus) {
      const { current } = this.input;
      if (current != null) {
        current.focus();
      }
    }
  }

  componentDidUpdate(prevProps: NumberEditorBaseProps, prevState: NumberEditorBaseState) {
    const { isInvalid, isFocused } = this.state;
    // Select the text if the value is invalid or the control is focused
    if (isInvalid || (prevState.isFocused !== isFocused && isFocused)) {
      const { current } = this.input;
      if (current != null) {
        (current as any).select();
      }
    }
  }

  formatValue(value: number) {
    const { intl, style, currency } = this.props;
    const { minimumFractionDigits, maximumFractionDigits } = this;

    return intl.formatNumber(value, { style, currency, minimumFractionDigits, maximumFractionDigits });
  }

  testPastedValue(valueToTest: number, pastedValue: string, options: Intl.NumberFormatOptions) {
    const allowedValue = this.props.intl.formatNumber(valueToTest, options);
    return pastedValue === replaceAll(allowedValue, NBSP, ' ');
  }

  isPastedValueValid(pastedValue: string, parsedValue: number) {
    // If the formatted value is same as the pasted value then it is considered valid
    // All other values are invalid. This does not handle all the cases as it is difficult
    // to address all the valid cases. This algorithm will be modified as needed
    const { style, currency } = this.props;
    const { maximumFractionDigits } = this;

    for (let fractionDigits = 0; fractionDigits <= maximumFractionDigits; fractionDigits++) {
      const decimalOptions = {
        style: intlStyle.DECIMAL,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits
      };

      if (this.testPastedValue(parsedValue, pastedValue, decimalOptions)) {
        return true;
      }

      if (this.testPastedValue(parsedValue, pastedValue, { ...decimalOptions, useGrouping: false })) {
        return true;
      }

      if (style === intlStyle.CURRENCY) {
        const currencyOptions = {
          currency,
          style,
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits
        };

        if (this.testPastedValue(parsedValue, pastedValue, currencyOptions)) {
          return true;
        }

        if (this.testPastedValue(parsedValue, pastedValue, { ...currencyOptions, useGrouping: false })) {
          return true;
        }
      }

      if (style === intlStyle.PERCENT) {
        const percentOptions = {
          style,
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits
        };

        if (this.testPastedValue(parsedValue / 100, pastedValue, percentOptions)) {
          return true;
        }

        if (this.testPastedValue(parsedValue / 100, pastedValue, { ...percentOptions, useGrouping: false })) {
          return true;
        }
      }
    }

    return false;
  }

  isInteger() {
    const { minimumFractionDigits, maximumFractionDigits } = this;
    return minimumFractionDigits === 0 && maximumFractionDigits === 0;
  }

  getValue() {
    const { value, style } = this.props;
    if (value != null && style === intlStyle.PERCENT) {
      return value * 100;
    }
    return value;
  }

  getDisplayValue() {
    const value = this.getValue();
    const { minimumFractionDigits, maximumFractionDigits } = this;

    return value != null
      ? this.props.intl.formatNumber(value, {
        style: intlStyle.DECIMAL,
        minimumFractionDigits,
        maximumFractionDigits,
        useGrouping: false
      })
      : '';
  }

  getInitialState() {
    return {
      displayValue: this.getDisplayValue(),
      isInvalid: false,
      isFocused: false
    };
  }

  internalSetState = <K extends keyof InternalSetStateParams>(stateToSet: Pick<InternalSetStateParams, K>) => {
    const { style } = this.props;
    const isValueChanged = stateToSet.hasOwnProperty('value');
    const { value, ...state } = stateToSet as { value?: number; };
    this.setState(state, () => {
      let valueToSave = value;
      if (valueToSave != null && style === intlStyle.PERCENT) {
        valueToSave /= 100;
      }
      if (isValueChanged && this.props.value !== valueToSave) {
        this.props.onChange(valueToSave);
      }
    });
  };

  handleCopyPaste = (pastedValue: string) => {
    this.isCopyPaste = false;
    const parsedValue = parseNumber(pastedValue, this.decimalSeparator);
    const isInvalid = parsedValue == null || !this.isPastedValueValid(pastedValue, parsedValue);

    if (isInvalid) {
      // Show the invalid displayValue, we do not change the underlying value
      // displayValue will be reverted to the last valid value on the next action (blur, click)
      this.internalSetState({
        displayValue: pastedValue,
        isInvalid: true
      });
      return;
    }

    // Value is valid, show the value without any formating elements (percentage, currency symbols etc.)
    this.internalSetState({
      value: parsedValue,
      displayValue: replaceDecimalSeparator(parsedValue, this.decimalSeparator),
      isInvalid: false
    });
  };

  handleChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = target;

    if (value === '') {
      this.internalSetState({
        value: undefined,
        displayValue: '',
        isInvalid: false
      });
      return;
    }

    if (this.isCopyPaste) {
      this.handleCopyPaste(value);
      return;
    }

    // Check if value is a valid number
    if (NUMBER_REGEX.test(value)) {
      // Check if value has a decimal separator
      if (DECIMAL_REGEX.test(value)) {
        if (this.isInteger()) {
          return;
        }

        // Replace the decimal separator as per the current locale
        const displayValue = replaceDecimalSeparator(value, this.decimalSeparator);
        // Add "0" in front if the decimal separator is entered in empty field
        if (displayValue.length === 1) {
          this.internalSetState({
            value: 0,
            displayValue: `0${displayValue}`,
            isInvalid: false
          });
          return;
        }

        // Check the precision setting and set the maximum fraction digits.
        const { maximumFractionDigits } = this;
        const [displayValueIntegerPart, displayValueDecimalPart] = displayValue.split(this.decimalSeparator);

        if (displayValueDecimalPart.length > maximumFractionDigits) {
          const roundedDisplayValue = `${displayValueIntegerPart}${this.decimalSeparator}${displayValueDecimalPart.slice(0, maximumFractionDigits)}`;
          this.internalSetState({
            value: parseFloat(replaceDecimalSeparator(roundedDisplayValue, '.')),
            displayValue: roundedDisplayValue,
            isInvalid: false
          });
          return;
        }

        this.internalSetState({
          value: parseFloat(replaceDecimalSeparator(value, '.')),
          displayValue,
          isInvalid: false
        });
        return;
      }

      // Value has no decimal separator. Convert value to number and convert
      // it back to string. This removes the leading 0 i.e 01 -> 1
      const parsedValue = parseFloat(value);
      this.internalSetState({
        value: parsedValue,
        displayValue: parsedValue.toString(),
        isInvalid: false
      });
      return;
    }

    // Value is not a valid number so it is rejected
    if (this.state.isInvalid) {
      // Clear the value if the control is in invalid state
      this.internalSetState({
        value: undefined,
        displayValue: '',
        isInvalid: false
      });
    }
  };

  handleFocus = () => {
    this.setState({ isFocused: true });
  };

  handleBlur = () => {
    this.internalSetState({
      isFocused: false,
      isInvalid: false,
      displayValue: this.getDisplayValue()
    });
  };

  handleClick = () => {
    if (this.state.isInvalid) {
      this.internalSetState({
        displayValue: this.getDisplayValue(),
        isInvalid: false
      });
    }
  };

  handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.ctrlKey || e.metaKey) && !e.altKey && e.keyCode === 86) {
      this.isCopyPaste = true;
    }
  };

  handlePaste = () => {
    this.isCopyPaste = true;
  };

  getInputProps = () => {
    const { value, name, title, tabIndex, disabled, readOnly } = this.props;
    const { displayValue, isFocused } = this.state;
    const inputValue = !isFocused && value != null ? this.formatValue(value) : displayValue;

    return {
      name,
      title,
      tabIndex,
      disabled,
      readOnly,
      ref: this.input,
      value: inputValue,
      onChange: this.handleChange,
      onFocus: this.handleFocus,
      onBlur: this.handleBlur,
      onKeyDown: this.handleKeyDown,
      onClick: this.handleClick,
      onPaste: this.handlePaste
    };
  };

  getRenderProps() {
    const { isInvalid } = this.state;

    return {
      isInvalid,
      getInputProps: this.getInputProps
    };
  }

  render() {
    return this.props.children(this.getRenderProps());
  }
}

export const NumberEditor = injectIntl(NumberEditorBase);

const errorMessage =
  "Invalid format. Only numbers and single decimal separator are allowed.";
const errorIcon = <Icon name="exclamation circle" link />;

interface GridNumberEditorProps {
  defaultValue?: number;
  autoFocus?: boolean;
  children?: NumberEditorChildren;
}

interface GridNumberEditorState {
  value?: number;
}

type NumberEditorFactoryProps = Pick<NumberEditorProps, 'style' | 'defaultFractionDigits' | 'extraFractionDigits'>;

function DefaultGridNumberInput({ getInputProps, isInvalid }: NumberEditorChildrenProps) {
  return (
    <Input
      {...getInputProps()}
      className={isInvalid ? 'invalidGridInput' : undefined}
      icon={isInvalid && errorIcon}
      iconPosition="left" />
  );
}

function gridNumberEditorFactory<P extends GridNumberEditorProps>(intlProps: NumberEditorFactoryProps): React.ComponentClass<P, GridNumberEditorState> {
  return class GridNumberEditor extends React.Component<P, GridNumberEditorState> {
    readonly state: Readonly<GridNumberEditorState> = { value: this.props.defaultValue };

    handleChange = (value?: number) => {
      this.setState({ value });
    };

    getValue() {
      return this.state.value;
    }

    render() {
      const { defaultValue, autoFocus, children, ...rest } = this.props;
      return (
        <NumberEditor
          {...intlProps}
          {...rest}
          value={this.state.value}
          onChange={this.handleChange}>
          {p =>
            children
              ? (children as NumberEditorChildren)(p)
              : <DefaultGridNumberInput {...p} />
          }
        </NumberEditor>
      );
    }
  };
}

export type GridIntegerEditorProps = GridNumberEditorProps;
export const GridIntegerEditor = gridNumberEditorFactory<GridIntegerEditorProps>({
  style: intlStyle.DECIMAL,
  defaultFractionDigits: 0
});

export type GridUnitsEditorProps = GridIntegerEditorProps;
export { GridIntegerEditor as GridUnitsEditor };

export type GridDecimalEditorProps = GridNumberEditorProps & Pick<NumberEditorBaseProps, 'minimumFractionDigits' | 'maximumFractionDigits'>;
export const GridDecimalEditor = gridNumberEditorFactory<GridDecimalEditorProps>({
  style: intlStyle.DECIMAL,
  defaultFractionDigits: defaultFractionDigits.DECIMAL
});

export type GridPercentEditorProps = GridNumberEditorProps & Pick<NumberEditorBaseProps, 'minimumFractionDigits' | 'maximumFractionDigits'>;
export const GridPercentEditor = gridNumberEditorFactory<GridPercentEditorProps>({
  style: intlStyle.PERCENT,
  defaultFractionDigits: defaultFractionDigits.PERCENT
});

export type GridCurrencyEditorProps = GridNumberEditorProps & Pick<NumberEditorBaseProps, 'minimumFractionDigits' | 'maximumFractionDigits' | 'currency'>;
export const GridCurrencyEditor = gridNumberEditorFactory<GridCurrencyEditorProps>({
  style: intlStyle.CURRENCY
});

export type GridRateEditorProps = GridNumberEditorProps & Pick<NumberEditorBaseProps, 'currency'>;
export const GridRateEditor = gridNumberEditorFactory<GridRateEditorProps>({
  style: intlStyle.CURRENCY,
  extraFractionDigits: extraFractionDigits.RATE
});

export type GridTechRateEditorProps = GridNumberEditorProps & Pick<NumberEditorBaseProps, 'currency'>;
export const GridTechRateEditor = gridNumberEditorFactory<GridTechRateEditorProps>({
  style: intlStyle.CURRENCY,
  extraFractionDigits: extraFractionDigits.TECH_RATE
});

type FormNumberEditorProps = Pick<NumberEditorProps, 'value' | 'onChange'> & {
  children?: NumberEditorChildren;
};

function DefaultFormNumberInput({ getInputProps, isInvalid }: NumberEditorChildrenProps) {
  return (
    <div style={{ display: 'inline-block' }}>
      <Input
        {...getInputProps()}
        error={isInvalid} />
      {isInvalid && <div>{errorMessage}</div>}
    </div>
  );
}

function formNumberEditorFactory<P extends FormNumberEditorProps>(intlProps: NumberEditorFactoryProps): React.FunctionComponent<P> {
  return function FormNumberEditor({ value, onChange, children }: P) {
    return (
      <NumberEditor
        {...intlProps}
        value={value}
        onChange={onChange}>
        {children || DefaultFormNumberInput}
      </NumberEditor>
    );
  };
}

export type FormDecimalEditorProps = FormNumberEditorProps & Pick<NumberEditorBaseProps, 'minimumFractionDigits' | 'maximumFractionDigits'>;
export const FormDecimalEditor = formNumberEditorFactory<FormDecimalEditorProps>({
  style: intlStyle.DECIMAL,
  defaultFractionDigits: defaultFractionDigits.DECIMAL
});

export type FormPercentEditorProps = FormNumberEditorProps & Pick<NumberEditorBaseProps, 'minimumFractionDigits' | 'maximumFractionDigits'>;
export const FormPercentEditor = formNumberEditorFactory<FormPercentEditorProps>({
  style: intlStyle.PERCENT,
  defaultFractionDigits: defaultFractionDigits.PERCENT
});

export type FormCurrencyEditorProps = FormNumberEditorProps & Pick<NumberEditorBaseProps, 'minimumFractionDigits' | 'maximumFractionDigits'> & { currency: string; };
export const FormCurrencyEditor = formNumberEditorFactory<FormCurrencyEditorProps>({
  style: intlStyle.CURRENCY
});

export type FormRateEditorProps = FormNumberEditorProps & { currency: string };
export const FormRateEditor = formNumberEditorFactory<FormRateEditorProps>({
  style: intlStyle.CURRENCY,
  extraFractionDigits: extraFractionDigits.RATE
});

export type FormTechRateEditorProps = FormNumberEditorProps & { currency: string };
export const FormTechRateEditor = formNumberEditorFactory<FormTechRateEditorProps>({
  style: intlStyle.CURRENCY,
  extraFractionDigits: extraFractionDigits.TECH_RATE
});
