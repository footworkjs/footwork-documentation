The `uniqueName` binding ensures that the associated DOM element has a nonempty `name` attribute. If the DOM element did not have a `name` attribute, this binding gives it one and sets it to some unique string value.

You won't need to use this often. It's only useful in a few rare cases, e.g.:

  * Other technologies may depend on the assumption that certain elements have names, even though names might be irrelevant when you're using Footwork. For example, [jQuery Validation](http://jqueryvalidation.org/) currently will only validate elements that have names. To use this with a Footwork UI, it's sometimes necessary to apply the `uniqueName` binding to avoid confusing jQuery Validation. See [an example of using jQuery Validation with Footwork](../examples/gridEditor).

### Example

```html
<input data-bind="value: someModelProperty, uniqueName: true" />
```

## Parameters

  * Main parameter: Pass `true` (or some value that evaluates as true) to enable the `uniqueName` binding, as in the preceding example.

  * Additional parameters

      * None
