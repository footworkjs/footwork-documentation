For reference, here's an example of binding view model properties to a range of HTML control types. There's nothing interesting about the view model here - this is just to make clear how bindings work with select elements, radio buttons, etc.

```html
<div class="readout">
  <h3>What's in the model?</h3>
  <table>
    <tr>
      <td class="label">Text value:</td>
      <td data-bind="text: stringValue"></td>
    </tr>
    <tr>
      <td class="label">Password:</td>
      <td data-bind="text: passwordValue"></td>
    </tr>
    <tr>
      <td class="label">Bool value:</td>
      <td data-bind='text: booleanValue() ? "True" : "False"'></td>
    </tr>
    <tr>
      <td class="label">Selected option:</td>
      <td data-bind="text: selectedOptionValue"></td>
    </tr>
    <tr>
      <td class="label">Multi-selected options:</td>
      <td data-bind="text: multipleSelectedOptionValues"></td>
    </tr>
    <tr>
      <td class="label">Radio button selection:</td>
      <td data-bind="text: radioSelectedOptionValue"></td>
    </tr>
  </table>
</div>

<h3>HTML controls</h3>
<table>
  <tr>
    <td class="label">Text value (updates on change):</td>
    <td><input data-bind="value: stringValue" /></td>
  </tr>
  <tr>
    <td class="label">Text value (updates on keystroke):</td>
    <td><input data-bind='value: stringValue, valueUpdate: "afterkeydown"' /></td>
  </tr>
  <tr>
    <td class="label">Text value (multi-line):</td>
    <td><textarea data-bind="value: stringValue"> </textarea></td>
  </tr>
  <tr>
    <td class="label">Password:</td>
    <td><input type="password" data-bind="value: passwordValue" /></td>
  </tr>
  <tr>
    <td class="label">Checkbox:</td>
    <td><input type="checkbox" data-bind="checked: booleanValue" /></td>
  </tr>
  <tr>
    <td class="label">Drop-down list:</td>
    <td><select data-bind="options: optionValues, value: selectedOptionValue"></select></td>
  </tr>
  <tr>
    <td class="label">Multi-select drop-down list:</td>
    <td><select multiple="multiple" data-bind="options: optionValues, selectedOptions: multipleSelectedOptionValues"></select></td>
  </tr>
  <tr>
    <td class="label">Radio buttons:</td>
    <td>
      <label><input type="radio" value="Alpha" data-bind="checked: radioSelectedOptionValue" />Alpha</label>
      <label><input type="radio" value="Beta" data-bind="checked: radioSelectedOptionValue" />Beta</label>
      <label><input type="radio" value="Gamma" data-bind="checked: radioSelectedOptionValue" />Gamma</label>
    </td>
  </tr>
</table>
```

```javascript
var viewModel = {
    stringValue : fw.observable("Hello"),
    passwordValue : fw.observable("mypass"),
    booleanValue : fw.observable(true),
    optionValues : ["Alpha", "Beta", "Gamma"],
    selectedOptionValue : fw.observable("Gamma"),
    multipleSelectedOptionValues : fw.observable(["Alpha"]),
    radioSelectedOptionValue : fw.observable("Beta")
};
fw.applyBindings(viewModel);
```