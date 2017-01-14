The `value` binding links the associated DOM element's value with a property on your view model. This is typically useful with form elements such as `<input>`, `<select>` and `<textarea>`.

When the user edits the value in the associated form control, it updates the value on your view model. Likewise, when you update the value in your view model, this updates the value of the form control on screen.

!!! Tip
    If you're working with checkboxes or radio buttons, use [the `checked` binding](checked-binding.md) to read and write your element's checked state, not the `value` binding.

## Example

```html
<p>Login name: <input data-bind="value: userName" /></p>
<p>Password: <input type="password" data-bind="value: userPassword" /></p>
```

```javascript
var viewModel = {
  userName: fw.observable(""),        // Initially blank
  userPassword: fw.observable("abc"), // Prepopulate
};
```

## Parameters

  * Main parameter: Footwork sets the element's `value` property to your parameter value. Any previous value will be overwritten.

      * If this parameter is an observable value, the binding will update the element's value whenever the value changes. If the parameter isn't observable, it will only set the element's value once and will not update it again later.

      * If you supply something other than a number or a string (e.g., you pass an object or an array), the displayed text will be equivalent to `yourParameter.toString()` (that's usually not very useful, so it's best to supply string or numeric values).

      * Whenever the user edits the value in the associated form control, Footwork will update the property on your view model. Footwork will always attempt to update your view model when the value has been modified and a user transfers focus to another DOM node (i.e., on the `change` event), but you can also trigger updates based on other events by using the `valueUpdate` parameter described below.

  * Additional parameters

      * `valueUpdate`: If your binding also includes a parameter called `valueUpdate`, this defines additional browser events Footwork should use to detect changes besides the `change` event. The following string values are the most commonly useful choices:

        * `"input"` - updates your view model when the value of an `<input>` or `<textarea>` element changes. Note that this event is only raised by reasonably modern browsers (e.g., IE 9+).
        * `"keyup"` - updates your view model when the user releases a key
        * `"keypress"` - updates your view model when the user has typed a key. Unlike `keyup`, this updates repeatedly while the user holds a key down
        * `"afterkeydown"` - updates your view model as soon as the user begins typing a character. This works by catching the browser's `keydown` event and handling the event asynchronously. This does not work in some mobile browsers.

      * `valueAllowUnset`: [See this note](#using-valueallowunset-with-select-elements) below. Note that `valueAllowUnset` is only applicable when using `value` to control selection on a `<select>` element. On other elements it has no effect.

## Notes

### Getting value updates instantly from inputs

If you are trying to bind an `<input type="text" />` or `<textarea>` to get instant updates to your viewmodel, use the [the `textInput` binding](textinput-binding.md). It has better support for browser edge cases than any combination of `valueUpdate` options.

### Working with drop-down lists (i.e., `<select>` elements)

Footwork has special support for drop-down lists (i.e., `<select>` elements). The `value` binding works in conjunction with the `options` binding to let you read and write values that are arbitrary JavaScript objects, not just string values. This is very useful if you want to let the user select from a set of model objects. For examples of this, see [the `options` binding](options-binding.md) or for handling multi-select lists, see the documentation for [the `selectedOptions` binding](selectedOptions-binding.md).

You can also use the `value` binding with a `<select>` element that does not use the `options` binding. In this case, you can choose to specify your `<option>` elements in markup or build them using the `foreach` or `template` bindings. You can even nest options within `<optgroup>` elements and Footwork will set the selected value appropriately.

### Using `valueAllowUnset` with `<select>` elements

Normally, when you use the `value` binding on a `<select>` element, it means that you want the associated model value to describe which item in the `<select>` is selected. But what happens if you set the model value to something that has no corresponding entry in the list? The default behavior is for Footwork to overwrite your model value to reset it to whatever is already selected in the dropdown, thereby preventing the model and UI from getting out of sync.

However, sometimes you might not want that behavior. If instead you want Footwork to allow your model observable to take values that have no corresponding entry in the `<select>`, then specify `valueAllowUnset: true`. In this case, whenever your model value cannot be represented in the `<select>`, then the `<select>` simply has no selected value at that time, which is visually represented by it being blank. When the user later selects an entry from the dropdown, this will be written to your model as usual. For example:

```html
<p>
  Select a country:
  <select data-bind="options: countries,
                      optionsCaption: 'Choose one...',
                      value: selectedCountry,
                      valueAllowUnset: true"></select>
</p>
```

```javascript
var viewModel = {
  countries: ['Japan', 'Bolivia', 'New Zealand'],
  selectedCountry: fw.observable('Latvia')
};
```

In the above example, `selectedCountry` will retain the value `'Latvia'`, and the dropdown will be blank, because there is no corresponding option.

If `valueAllowUnset` had not been enabled, then Footwork would have overwritten `selectedCountry` with `undefined`, so that it would match the value of the `'Choose one...'` caption entry.

### Updating observable and non-observable property values

If you use `value` to link a form element to an observable property, Footwork is able to set up a 2-way binding so that changes to either affect the other.

However, if you use `value` to link a form element to a *non*-observable property (e.g., a plain old string, or an arbitrary JavaScript expression), Footwork will do the following:

  * If you reference a *simple property*, i.e., it is just a regular property on your view model, Footwork will set the form element's initial state to the property value, and when the form element is edited, Footwork will write the changes back to your property. It cannot detect when the property changes (because it isn't observable), so this is only a 1-way binding.

  * If you reference something that is *not* a simple property, e.g., the result of a function call or comparison operation, Footwork will set the form element's initial state to that value, but it will not be able to write any changes back when the user edits the form element. In this case it's a one-time-only value setter, not an ongoing binding that reacts to changes.

Example:

```html
<!-- Two-way binding. Populates textbox; syncs both ways. -->
<p>First value: <input data-bind="value: firstValue" /></p>

<!-- One-way binding. Populates textbox; syncs only from textbox to model. -->
<p>Second value: <input data-bind="value: secondValue" /></p>

<!-- No binding. Populates textbox, but doesn't react to any changes. -->
<p>Third value: <input data-bind="value: secondValue.length > 8" /></p>
```

```javascript
var viewModel = {
  firstValue: fw.observable("hello"), // Observable
  secondValue: "hello, again"         // Not observable
};
```

### Using the `value` binding with the `checked` binding

The [`checked`](checked-binding.md) binding should be used to bind a view model property against the value of a checkbox (`<input type='checkbox'>`) or radio button (`<input type='radio'>`). If you do include the `value` binding with the `checked` binding on one of these elements, then the `value` binding will simply act like the [`checkedValue`](checked-binding.md#checkedValue) option that can be used with the `checked` binding and will control the value that is used for updating your view model.

### Interaction with jQuery

Footwork will use jQuery, if it is present, for handling UI events such as `change`. To disable this behavior and instruct Footwork to always use native event handling, you can set the following option in your code before calling `fw.applyBindings`:

```javascript
  fw.options.useOnlyNativeEvents = true;
```
