import './index.css';
import * as React from "react";
import { render } from "react-dom";
import { IntlProvider, addLocaleData } from "react-intl";

import { currencyCode } from './currenyCode';

import {
  GridDecimalEditor,
  GridCurrencyEditor,
  GridPercentEditor,
  GridRateEditor
} from "./IntlEditors";

import {
  DecimalFormatter,
  CurrencyFormatter,
  PercentFormatter,
  RateFormatter,
  TechRateFormatter
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
    console.log({ [e.target.name]: e.target.value })
    this.setState({ [e.target.name]: e.target.value });
  };

  public render() {
    const key = `${this.state.locale}-${this.state.currencyCode}-${this.state.minimumFractionDigits}-${this.state.maximumFractionDigits}`;
    return (
      <IntlProvider locale={this.state.locale} key={key}>
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
                  <select
                    name="currencyCode"
                    value={this.state.currencyCode}
                    onChange={this.handleChange}
                  >
                    {currencyCode.sort().map(c => <option value={c}>{c}</option>)}
                  </select>
                </label>
              </div>
              <div style={{ marginTop: 20 }}>
                <label>
                  Grid Decimal Editor:
                  <GridDecimalEditor
                    defaultValue={2}
                    minimumFractionDigits={this.state.minimumFractionDigits || undefined}
                    maximumFractionDigits={this.state.maximumFractionDigits || undefined}
                  />
                </label>
              </div>
              <div style={{ marginTop: 20 }}>
                <label>
                  Grid Currency Editor:
                  <GridCurrencyEditor
                    defaultValue={2}
                    currency={this.state.currencyCode}
                    minimumFractionDigits={this.state.minimumFractionDigits || undefined}
                    maximumFractionDigits={this.state.maximumFractionDigits || undefined}
                  />
                </label>
              </div>
              <div style={{ marginTop: 20 }}>
                <label>
                  Grid Percent Editor:
                  <GridPercentEditor
                    defaultValue={0.2}
                    minimumFractionDigits={this.state.minimumFractionDigits || undefined}
                    maximumFractionDigits={this.state.maximumFractionDigits || undefined}
                  />
                </label>
              </div>
              <div style={{ marginTop: 20 }}>
                <label>
                  Grid Rate Editor:
                  <GridRateEditor
                    defaultValue={20}
                    currency={this.state.currencyCode}
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
    rateFormatterValue: 3.4,
    techRateFormatterValue: 1.2
  };
  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  public render() {
    const key = `${this.state.locale}-${this.state.currencyCode}-${this.state.minimumFractionDigits}-${this.state.maximumFractionDigits}`;
    return (
      <IntlProvider locale={this.state.locale} key={key}>
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
                  <select
                    name="currencyCode"
                    value={this.state.currencyCode}
                    onChange={this.handleChange}
                  >
                    {currencyCode.sort().map(c => <option value={c}>{c}</option>)}
                  </select>
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
                    minimumFractionDigits={this.state.minimumFractionDigits || undefined}
                    maximumFractionDigits={this.state.maximumFractionDigits || undefined}
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
                    minimumFractionDigits={this.state.minimumFractionDigits || undefined}
                    maximumFractionDigits={this.state.maximumFractionDigits || undefined}
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
                    minimumFractionDigits={this.state.minimumFractionDigits || undefined}
                    maximumFractionDigits={this.state.maximumFractionDigits || undefined}
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
                  />
                </label>
              </div>

              <div style={{ marginTop: 20 }}>
                <label>
                  Tech Rate Formatter:
                  <input
                    type="number"
                    name="techRateFormatterValue"
                    value={this.state.techRateFormatterValue}
                    onChange={this.handleChange}
                  />
                  <TechRateFormatter
                    value={this.state.techRateFormatterValue}
                    currency={this.state.currencyCode}
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

class App extends React.Component {
  componentDidCatch() {
    console.log('An error occurred');
  }

  render() {
    return (
      <div>
        <Editors />
        <Formatters />
      </div>
    );
  }
}

render(
  <App />,
  document.getElementById("root")
);