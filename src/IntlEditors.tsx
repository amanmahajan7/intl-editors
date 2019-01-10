import * as React from "react";
import { injectIntl, InjectedIntlProps } from "react-intl";
import { Icon, Input } from "semantic-ui-react";

import {
  getDecimalSeparator,
  getDefaultFractionDigitsForLocale,
  parseDecimal,
  intlStyle
} from "./IntlUtils";

const NBSP = "\u00A0";
const DECIMAL_SEPARATORS = [".", ","];
const DECIMAL_REGEX = /[.,]/;
const NUMBER_REGEX = /^\d*[.,]?\d*$/;

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

interface NumberEditorProps extends Intl.NumberFormatOptions {
  value?: number;
  defaultValue?: number;
  autoFocus?: boolean;
  onChange?: (value?: number) => void;
  focus?: () => void;
  select?: () => void;
  children: (
    renderProps: {
      isInvalid: boolean;
      inputProps: Pick<
        React.InputHTMLAttributes<HTMLInputElement>,
        | "value"
        | "onChange"
        | "onFocus"
        | "onBlur"
        | "onKeyDown"
        | "onClick"
        | "onPaste"
      >;
    }
  ) => React.ReactNode;
}

interface NumberEditorState {
  value?: number;
  displayValue: string;
  isInvalid: boolean;
  isFocused: boolean;
}

function replaceDecimalSeparator(
  value: string | number | undefined | null,
  separator: string
) {
  return value != null
    ? value.toString().replace(DECIMAL_REGEX, separator)
    : "";
}

class NumberEditorBase extends React.Component<
  NumberEditorProps & InjectedIntlProps,
  NumberEditorState
> {
  readonly decimalSeparator = getDecimalSeparator(this.props.intl);
  readonly defaultMaximumFractionDigits = getDefaultFractionDigitsForLocale(
    this.props.intl.locale,
    this.props.currency
  ).maximumFractionDigits;
  readonly state: Readonly<NumberEditorState> = this.getInitialState();

  isCopyPaste = false;

  componentDidMount() {
    const { autoFocus, focus } = this.props;
    if (autoFocus && focus) {
      focus();
    }
  }

  componentDidUpdate() {
    if (this.state.isInvalid) {
      // Select the value if it is invalid
      const { select } = this.props;
      if (select) {
        select();
      }
    }
  }

  isControlled() {
    return typeof this.props.onChange !== "undefined";
  }

  formatValue(value: number) {
    const {
      intl,
      style,
      currency,
      minimumFractionDigits,
      maximumFractionDigits
    } = this.props;
    return intl.formatNumber(value, {
      style,
      currency,
      minimumFractionDigits,
      maximumFractionDigits
    });
  }

  isPastedValueValid(pastedValue: string, parsedValue: number) {
    const allowedFormatOptions: Intl.NumberFormatOptions[] = [];
    const { maximumFractionDigits = this.defaultMaximumFractionDigits } = this.props;

    for (let fractionDigits = 0; fractionDigits <= maximumFractionDigits; fractionDigits++) {
      allowedFormatOptions.push({
        style: intlStyle.DECIMAL,
        minimumFractionDigits: fractionDigits
      });

      if (this.props.style === intlStyle.CURRENCY) {
        allowedFormatOptions.push({
          style: intlStyle.CURRENCY,
          currency: this.props.currency,
          minimumFractionDigits: fractionDigits
        });
      }
    }


    // If the formatted value is same as the pasted value then it is considered valid
    // All other values are invalid. This does not handle all the cases as it is difficult
    // to address all the valid cases. This algorithm will be modified as needed
    return allowedFormatOptions.some(options => {
      const allowedValue = this.props.intl.formatNumber(parsedValue, options);
      return pastedValue === replaceAll(allowedValue, NBSP, ' ');
    });
  }

  getInitialValue() {
    return this.isControlled() ? this.props.value : this.props.defaultValue;
  }

  getInitialState() {
    const value = this.getInitialValue();
    // TODO: can we assume initial value is valid?
    return {
      value,
      displayValue: replaceDecimalSeparator(value, this.decimalSeparator),
      isInvalid: false,
      isFocused: false
    };
  }

  getValue() {
    return this.isControlled() ? this.props.value : this.state.value;
  }

  setValue = <K extends keyof NumberEditorState>(
    state: Pick<NumberEditorState, K>
  ) => {
    this.setState(state, () => {
      if (this.isControlled() && this.props.value !== this.state.value) {
        this.props.onChange!(this.state.value);
      }
    });
  };

  showLastValidValue = () => {
    if (this.state.isInvalid) {
      const value = this.getValue();
      this.setValue({
        displayValue: replaceDecimalSeparator(value, this.decimalSeparator),
        isInvalid: false
      });
    }
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

    if (value === "") {
      this.setValue({ value: undefined, displayValue: "" });
      return;
    }

    if (this.isCopyPaste) {
      this.handleCopyPaste(value);
      return;
    }

    // Check if value is a valid number
    if (NUMBER_REGEX.test(value)) {
      // Check if value has a decimal separator
      if (DECIMAL_SEPARATORS.some(s => value.includes(s))) {
        // Replace the decimal separator as per the current locale
        const displayValue = replaceDecimalSeparator(
          value,
          this.decimalSeparator
        );
        // Add "0" in front if the decimal separator is entered in empty field
        if (displayValue.length === 1) {
          this.setValue({ value: 0, displayValue: `0${displayValue}` });
          return;
        }

        // Check the precision setting and set the maximum fraction digits.
        const {
          maximumFractionDigits = this.defaultMaximumFractionDigits
        } = this.props;
        const [
          displayValueIntegerPart,
          displayValueDecimalPart
        ] = displayValue.split(this.decimalSeparator);

        if (displayValueDecimalPart.length > maximumFractionDigits) {
          const roundedDisplayValue = `${displayValueIntegerPart}${
            this.decimalSeparator
          }${displayValueDecimalPart.slice(0, maximumFractionDigits)}`;
          this.setValue({
            value: parseFloat(
              replaceDecimalSeparator(roundedDisplayValue, ".")
            ),
            displayValue: roundedDisplayValue
          });
          return;
        }

        this.setValue({
          value: parseFloat(replaceDecimalSeparator(value, ".")),
          displayValue
        });
        return;
      }

      // Value has no decimal separator. Convert value to number and convert
      // it back to string. This removes the leading 0 i.e 01 -> 1
      const parsedValue = parseFloat(value);
      this.setValue({
        value: parsedValue,
        displayValue: parsedValue.toString()
      });
    }

    // Value is not a valid number so it is rejected
  };

  handleFocus = () => {
    this.setState({ isFocused: true });
  };

  handleBlur = () => {
    this.setState({ isFocused: false });
    this.showLastValidValue();
  };

  handleClick = () => {
    this.showLastValidValue();
  };

  handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey && e.keyCode === 86) {
      this.isCopyPaste = true;
    }
  };

  handlePaste = () => {
    console.log('jjjj')
    this.isCopyPaste = true;
  };

  getRenderProps = () => {
    const { value, isInvalid, displayValue } = this.state;
    const formattedValue =
      !this.state.isFocused && value != null
        ? this.formatValue(value)
        : displayValue;

    return {
      isInvalid,
      inputProps: {
        value: formattedValue,
        onChange: this.handleChange,
        onFocus: this.handleFocus,
        onBlur: this.handleBlur,
        onKeyDown: this.handleKeyDown,
        onClick: this.handleClick,
        onPaste: this.handlePaste
      }
    };
  };

  render() {
    return this.props.children(this.getRenderProps());
  }
}

const NumberEditor = injectIntl(NumberEditorBase, { withRef: true });

const errorMessage =
  "Invalid format. Only numbers and single decimal separator are allowed.";
const errorIcon = <Icon name="exclamation circle" link />;

type GridEditorProps = Pick<
  NumberEditorProps,
  | "defaultValue"
  | "minimumFractionDigits"
  | "maximumFractionDigits"
  | "autoFocus"
>;
type GridCurrencyEditorProps = GridEditorProps & { currency: string };

function gridNumberEditorFactory<T extends {}>(
  intlProps: Intl.NumberFormatOptions
): React.ComponentClass<T & GridEditorProps> {
  return class GridNumberEditor extends React.Component<T & GridEditorProps> {
    decimalEditor = React.createRef<any>();
    input = React.createRef<Input>();

    focus = () => {
      const { current } = this.input;
      if (current != null) {
        current.focus();
      }
    };

    select = () => {
      const { current } = this.input;
      if (current != null) {
        (current as any).select();
      }
    };

    getValue() {
      const ref = this.decimalEditor.current;
      if (ref != null) {
        const innerRef = ref.getWrappedInstance() as NumberEditorBase;
        if (innerRef != null) {
          return innerRef.getValue();
        }
      }

      return undefined;
    }

    render() {
      return (
        <NumberEditor
          ref={this.decimalEditor}
          focus={this.focus}
          select={this.select}
          {...intlProps}
          {...this.props}
        >
          {({ inputProps, isInvalid }) => (
            <Input
              {...inputProps}
              ref={this.input}
              icon={isInvalid && errorIcon}
              iconPosition="left"
            />
          )}
        </NumberEditor>
      );
    }
  };
}

export const GridDecimalEditor = gridNumberEditorFactory({
  style: intlStyle.DECIMAL
});
export const GridPercentEditor = gridNumberEditorFactory({
  style: intlStyle.PERCENT
});
export const GridCurrencyEditor = gridNumberEditorFactory<
  GridCurrencyEditorProps
>({ style: intlStyle.CURRENCY });
