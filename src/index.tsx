import './index.css';
import * as React from "react";
import { render } from "react-dom";
import { IntlProvider, addLocaleData } from "react-intl";

import {
  GridDecimalEditor,
  GridCurrencyEditor,
  GridPercentEditor
} from "./IntlEditors";

import {
  DecimalFormatter,
  CurrencyFormatter,
  PercentFormatter,
  RateFormatter
} from "./IntlFormatters";

const en = require("react-intl/locale-data/en");
const fr = require("react-intl/locale-data/fr");
const is = require("react-intl/locale-data/is");

addLocaleData([...en, ...fr, ...is]);

class Editors extends React.Component {
  state = {
    locale: "en-US",
    minimumFractionDigits: 3,
    maximumFractionDigits: 4,
    currencyCode: "USD"
  };
  handleChange = e => {
    const value = e.target.value === "" ? undefined : e.target.value;
    this.setState({ [e.target.name]: value });
  };

  public render() {
    return (
      <IntlProvider locale={this.state.locale} key={this.state.locale}>
        <div>
          <fieldset>
            <legend>Editors</legend>
            <div style={{ margin: 20 }}>
              <div style={{ marginTop: 20 }}>
                <label>
                  Locale:
                  <select
                    name="locale"
                    value={this.state.locale}
                    onChange={this.handleChange}
                  >
                    <option value="fr-FR">fr-FR</option>
                    <option value="en-US">en-US</option>
                    <option value="en-GB">en-GB</option>
                    <option value="is-IS">is-IS</option>
                  </select>
                </label>
              </div>
              <div style={{ marginTop: 20 }}>
                <label>
                  minimumFractionDigits:
                  <input
                    type="number"
                    name="minimumFractionDigits"
                    value={this.state.minimumFractionDigits}
                    onChange={this.handleChange}
                  />
                </label>
              </div>
              <div style={{ marginTop: 20 }}>
                <label>
                  maximumFractionDigits:
                  <input
                    type="number"
                    name="maximumFractionDigits"
                    value={this.state.maximumFractionDigits}
                    onChange={this.handleChange}
                  />
                </label>
              </div>
              <div style={{ marginTop: 20 }}>
                <label>
                  currency code:
                  <input
                    type="text"
                    name="currencyCode"
                    value={this.state.currencyCode}
                    onChange={this.handleChange}
                  />
                </label>
              </div>
              <div style={{ marginTop: 20 }}>
                <label>
                  Grid Decimal Editor:
                  <GridDecimalEditor
                    defaultValue={2}
                    minimumFractionDigits={this.state.minimumFractionDigits}
                    maximumFractionDigits={this.state.maximumFractionDigits}
                  />
                </label>
              </div>
              <div style={{ marginTop: 20 }}>
                <label>
                  Grid Currency Editor:
                  <GridCurrencyEditor
                    defaultValue={2}
                    currency={this.state.currencyCode}
                    minimumFractionDigits={this.state.minimumFractionDigits}
                    maximumFractionDigits={this.state.maximumFractionDigits}
                  />
                </label>
              </div>
              <div style={{ marginTop: 20 }}>
                <label>
                  Grid Percent Editor:
                  <GridPercentEditor
                    defaultValue={2}
                    minimumFractionDigits={this.state.minimumFractionDigits}
                    maximumFractionDigits={this.state.maximumFractionDigits}
                  />
                </label>
              </div>
            </div>
          </fieldset>
        </div>
      </IntlProvider>
    );
  }
}

class Formatters extends React.Component {
  state = {
    locale: "en-US",
    minimumFractionDigits: 3,
    maximumFractionDigits: 4,
    currencyCode: "USD",
    currencyFormatterValue: 2,
    decimalFormatterValue: 1.2,
    percentFormatterValue: 0.2,
    rateFormatterValue: 3.4
  };
  handleChange = e => {
    const value = e.target.value === "" ? undefined : e.target.value;
    this.setState({ [e.target.name]: value });
  };

  public render() {
    return (
      <IntlProvider locale={this.state.locale} key={this.state.locale}>
        <div>
          <fieldset>
            <legend>Formatters</legend>
            <div style={{ margin: 20 }}>
              <div style={{ marginTop: 20 }}>
                <label>
                  Locale:
                  <select
                    name="locale"
                    value={this.state.locale}
                    onChange={this.handleChange}
                  >
                    <option value="fr-FR">fr-FR</option>
                    <option value="en-US">en-US</option>
                    <option value="en-GB">en-GB</option>
                    <option value="is-IS">is-IS</option>
                  </select>
                </label>
              </div>
              <div style={{ marginTop: 20 }}>
                <label>
                  minimumFractionDigits:
                  <input
                    type="number"
                    name="minimumFractionDigits"
                    value={this.state.minimumFractionDigits}
                    onChange={this.handleChange}
                  />
                </label>
              </div>
              <div style={{ marginTop: 20 }}>
                <label>
                  maximumFractionDigits:
                  <input
                    type="number"
                    name="maximumFractionDigits"
                    value={this.state.maximumFractionDigits}
                    onChange={this.handleChange}
                  />
                </label>
              </div>
              <div style={{ marginTop: 20 }}>
                <label>
                  currency code:
                  <input
                    type="text"
                    name="currencyCode"
                    value={this.state.currencyCode}
                    onChange={this.handleChange}
                  />
                </label>
              </div>

              <div style={{ marginTop: 20 }}>
                <label>
                  Decimal Formatter:
                  <input
                    type="number"
                    name="decimalFormatterValue"
                    value={this.state.decimalFormatterValue}
                    onChange={this.handleChange}
                  />
                  <DecimalFormatter
                    value={this.state.decimalFormatterValue}
                    minimumFractionDigits={this.state.minimumFractionDigits}
                    maximumFractionDigits={this.state.maximumFractionDigits}
                  />
                </label>
              </div>

              <div style={{ marginTop: 20 }}>
                <label>
                  CurrencyFormatter:
                  <input
                    type="number"
                    name="currencyFormatterValue"
                    value={this.state.currencyFormatterValue}
                    onChange={this.handleChange}
                  />
                  <CurrencyFormatter
                    value={this.state.currencyFormatterValue}
                    currency={this.state.currencyCode}
                    minimumFractionDigits={this.state.minimumFractionDigits}
                    maximumFractionDigits={this.state.maximumFractionDigits}
                  />
                </label>
              </div>

              <div style={{ marginTop: 20 }}>
                <label>
                  PercentFormatter:
                  <input
                    type="number"
                    name="percentFormatterValue"
                    value={this.state.percentFormatterValue}
                    onChange={this.handleChange}
                  />
                  <PercentFormatter
                    value={this.state.percentFormatterValue}
                    minimumFractionDigits={this.state.minimumFractionDigits}
                    maximumFractionDigits={this.state.maximumFractionDigits}
                  />
                </label>
              </div>

              <div style={{ marginTop: 20 }}>
                <label>
                  Rate Formatter:
                  <input
                    type="number"
                    name="rateFormatterValue"
                    value={this.state.rateFormatterValue}
                    onChange={this.handleChange}
                  />
                  <RateFormatter
                    value={this.state.rateFormatterValue}
                    currency={this.state.currencyCode}
                    minimumFractionDigits={this.state.minimumFractionDigits}
                    maximumFractionDigits={this.state.maximumFractionDigits}
                  />
                </label>
              </div>
            </div>
          </fieldset>
        </div>
      </IntlProvider>
    );
  }
}

render(
  <div>
    <Editors />
    <Formatters />
  </div>,
  document.getElementById("root")
);