/* eslint-disable react/style-prop-object */
import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Icon, Input, InputProps } from "semantic-ui-react";


import {
  getDecimalSeparator,
  getDefaultFractionDigitsForLocale,
  parseDecimal,
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

export type NumberEditorProps = Pick<Intl.NumberFormatOptions, 'style' | 'currency' | 'minimumFractionDigits' | 'maximumFractionDigits'> & {
  value?: number;
  defaultFractionDigits?: number;
  extraFractionDigits?: number;
  autoFocus?: boolean;
  children: NumberEditorChildren;
  onChange: (value?: number) => void;
};

interface NumberEditorBaseState {
  displayValue: string;
  isInvalid: boolean;
  isFocused: boolean;
}

function replaceDecimalSeparator(value: string | number | undefined | null, separator: string) {
  return value != null
    ? value.toString().replace(DECIMAL_REGEX, separator)
    : '';
}

class NumberEditorBase extends React.Component<NumberEditorBaseProps, NumberEditorBaseState> {
  readonly decimalSeparator: string;
  readonly defaultMinimumFractionDigits: number;
  readonly defaultMaximumFractionDigits: number;
  readonly state: Readonly<NumberEditorBaseState>;

  input = React.createRef<Input>();

  constructor(props: NumberEditorBaseProps, context?: any) {
    super(props, context);
    const { intl, currency, style, minimumFractionDigits, maximumFractionDigits, defaultFractionDigits, extraFractionDigits } = this.props;
    const {
      minimumFractionDigits: minimumFractionDigitsForLocale,
      maximumFractionDigits: maximumFractionDigitsForLocale
    } = getDefaultFractionDigitsForLocale(intl.locale, { currency, style, minimumFractionDigits, maximumFractionDigits });

    this.decimalSeparator = getDecimalSeparator(intl);
    this.defaultMinimumFractionDigits = minimumFractionDigitsForLocale
    this.defaultMaximumFractionDigits = maximumFractionDigitsForLocale;
    if (typeof minimumFractionDigits === 'undefined' && typeof maximumFractionDigits === 'undefined') {
      // Only set default values if none of the fraction digits are provided
      if (typeof defaultFractionDigits !== 'undefined') {
        this.defaultMinimumFractionDigits = defaultFractionDigits;
        this.defaultMaximumFractionDigits = defaultFractionDigits;
      } else if (typeof extraFractionDigits !== 'undefined') {
        this.defaultMinimumFractionDigits = minimumFractionDigitsForLocale + extraFractionDigits;
        this.defaultMaximumFractionDigits = minimumFractionDigitsForLocale + extraFractionDigits;
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
    const {
      intl,
      style,
      currency,
      minimumFractionDigits = this.defaultMinimumFractionDigits,
      maximumFractionDigits = this.defaultMaximumFractionDigits
    } = this.props;
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
    const { maximumFractionDigits = this.defaultMaximumFractionDigits, style, currency } = this.props;

    for (let fractionDigits = 0; fractionDigits <= maximumFractionDigits; fractionDigits++) {
      if (this.testPastedValue(parsedValue, pastedValue, {
        style: intlStyle.DECIMAL,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits
      })) {
        return true;
      }

      if (style === intlStyle.CURRENCY) {
        if (this.testPastedValue(parsedValue, pastedValue, {
          currency,
          style,
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits
        })) {
          return true;
        }
      }

      if (style === intlStyle.PERCENT) {
        if (this.testPastedValue(parsedValue / 100, pastedValue, {
          style,
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits
        })) {
          return true;
        }
      }
    }

    return false;
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
    const {
      intl,
      minimumFractionDigits = this.defaultMinimumFractionDigits,
      maximumFractionDigits = this.defaultMaximumFractionDigits
    } = this.props;
    return value != null
      ? intl.formatNumber(value, { style: intlStyle.DECIMAL, minimumFractionDigits, maximumFractionDigits, useGrouping: false })
      : '';
  }

  getInitialState() {
    return {
      displayValue: this.getDisplayValue(),
      isInvalid: false,
      isFocused: false
    };
  }

  // TODO: looking for a better type
  setValue = (stateToSet: any) => {
    const { style } = this.props;
    const isValueChanged = stateToSet.hasOwnProperty('value');
    const { value, ...state } = stateToSet;
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
    const parsedValue = parseDecimal(pastedValue, this.decimalSeparator);
    const isInvalid = parsedValue == null || !this.isPastedValueValid(pastedValue, parsedValue);

    if (isInvalid) {
      // Show the invalid displayValue, we do not change the underlying value
      // displayValue will be reverted to the last valid value on the next action (blur, click)
      this.setValue({
        isInvalid: true,
        displayValue: pastedValue
      });
      return;
    }

    // Value is valid, show the value without any formating elements (percentage, currency symbols etc.)
    this.setValue({
      isInvalid: false,
      value: parsedValue,
      displayValue: replaceDecimalSeparator(parsedValue, this.decimalSeparator)
    });
  };

  handleChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = target;

    if (value === '') {
      this.setValue({ value: undefined, displayValue: '' });
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
        // Replace the decimal separator as per the current locale
        const displayValue = replaceDecimalSeparator(value, this.decimalSeparator);
        // Add "0" in front if the decimal separator is entered in empty field
        if (displayValue.length === 1) {
          this.setValue({ value: 0, displayValue: `0${displayValue}` });
          return;
        }

        // Check the precision setting and set the maximum fraction digits.
        const { maximumFractionDigits = this.defaultMaximumFractionDigits } = this.props;
        const [displayValueIntegerPart, displayValueDecimalPart] = displayValue.split(this.decimalSeparator);

        if (displayValueDecimalPart.length > maximumFractionDigits) {
          const roundedDisplayValue = `${displayValueIntegerPart}${this.decimalSeparator}${displayValueDecimalPart.slice(0, maximumFractionDigits)}`;
          this.setValue({
            value: parseFloat(replaceDecimalSeparator(roundedDisplayValue, '.')),
            displayValue: roundedDisplayValue
          });
          return;
        }

        this.setValue({
          value: parseFloat(replaceDecimalSeparator(value, '.')),
          displayValue
        });
        return;
      }

      // Value has no decimal separator. Convert value to number and convert
      // it back to string. This removes the leading 0 i.e 01 -> 1
      const parsedValue = parseFloat(value);
      this.setValue({ value: parsedValue, displayValue: parsedValue.toString() });
    }

    // Value is not a valid number so it is rejected
  };

  handleFocus = () => {
    this.setState({ isFocused: true });
  };

  handleBlur = () => {
    this.setState({
      isFocused: false,
      isInvalid: false,
      displayValue: this.getDisplayValue()
    });
  };

  handleClick = () => {
    if (this.state.isInvalid) {
      this.setValue({
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
    const { value } = this.props;
    const { displayValue, isFocused } = this.state;
    const formattedValue = !isFocused && value != null ? this.formatValue(value) : displayValue;

    return {
      ref: this.input,
      value: formattedValue,
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

const NumberEditor = injectIntl(NumberEditorBase);

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

export type GridCurrencyEditorProps = GridNumberEditorProps & Pick<NumberEditorBaseProps, 'minimumFractionDigits' | 'maximumFractionDigits'> & { currency: string; };
export const GridCurrencyEditor = gridNumberEditorFactory<GridCurrencyEditorProps>({
  style: intlStyle.CURRENCY
});

export type GridRateEditorProps = GridNumberEditorProps & { currency: string };
export const GridRateEditor = gridNumberEditorFactory<GridRateEditorProps>({
  style: intlStyle.CURRENCY,
  extraFractionDigits: extraFractionDigits.RATE
});

export type GridTechRateEditorProps = GridNumberEditorProps & { currency: string };
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
