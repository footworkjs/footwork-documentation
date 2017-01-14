The `component` binding injects a specified [component](component-basics.md) into an element using the `data-bind` syntax. This is an alternative to using a `<custom-element></custom-element>`.

## Example

```html
<h4>First instance, without parameters</h4>
<div data-bind='component: "message-editor"'></div>

<h4>Second instance, passing parameters</h4>
<div data-bind='component: {
  name: "message-editor",
  params: { initialText: "Hello, world!" }
}'></div>
```

```javascript
fw.components.register('message-editor', {
  viewModel: function(params) {
    this.text = fw.observable(params && params.initialText || '');
  },
  template: 'Message: <input data-bind="value: text" /> '
          + '(length: <span data-bind="text: text().length"></span>)'
});

fw.applyBindings();
```

!!! note
    In more realistic cases, you would typically load component viewmodels and templates from external files, instead of hardcoding them into the registration. See [an example](component-basics.md#example-loading-the-likedislike-widget-from-external-files-on-demand) and [registration documentation](component-registration.md).

## Usage

There are two ways to use the `component` binding:

* **Shorthand syntax**

    If you pass just a string, it is interpreted as a component name. The named component is then injected without supplying any parameters to it. Example:

    ```html
    <div data-bind='component: "my-component"'></div>
    ```

    The shorthand value can also be observable. In this case, if it changes, the `component` binding will [dispose](#disposal-and-memory-management) the old component instance, and inject the newly-referenced component. Example:

    ```html
    <div data-bind='component: observableWhoseValueIsAComponentName'></div>
    ```

* **Full syntax**

    To supply parameters to the component, pass an object with the following properties:

    * `name`

        The name of the component to inject. Again, this can be observable.

    * `params`

        An object that will be passed on to the component. Typically this is a key-value object containing multiple parameters, and is typically received by the component's viewmodel constructor.

    ```html
    <div data-bind='component: {
      name: "shopping-cart",
      params: { mode: "detailed-list", items: productsList }
    }'></div>
    ```

    !!! note
        Whenever a component is removed (either because the `name` observable changed, or because an enclosing control-flow binding removed the entire element), the removed component is [disposed](#disposal-and-memory-management).

### Template-only components

Components usually have viewmodels, but they don't necessarily have to. A component can specify just a template.

In this case, the object to which the component's view is bound is the `params` object that you passed to the `component` binding. Example:

```javascript
fw.components.register('special-offer', {
  template: '<div class="offer-box" data-bind="text: productName"></div>'
});
```

... can be injected with:

```html
<div data-bind='component: {
  name: "special-offer-callout",
  params: { productName: someProduct.name }
}'></div>
```

... or, more conveniently, as a [custom element](component-custom-elements.md):

```html
<special-offer params='productName: someProduct.name'></special-offer>
```

### Containerless Usage

Sometimes you may want to inject a component into a view without using an extra container element. You can do this using *containerless control flow syntax*, which is based on comment tags. For example,

```html
<!-- ko component: "message-editor" -->
<!-- /ko -->
```

... or passing parameters:

```html
<!-- ko component: {
  name: "message-editor",
  params: { initialText: "Hello, world!", otherParam: 123 }
} -->
<!-- /ko -->
```

The `<!-- ko -->` and `<!-- /ko -->` comments act as start/end markers, defining a "virtual element" that contains the markup inside. Footwork understands this virtual element syntax and binds as if you had a real container element.

### Passing Markup To Components

The element you attach a `component` binding to may contain further markup. For example,

```html
<div data-bind="component: { name: 'my-special-list', params: { items: someArrayOfPeople } }">
  <!-- Look, here's some arbitrary markup. By default it gets stripped out
       and is replaced by the component output. -->
  The person <em data-bind="text: name"></em> is <em data-bind="text: age"></em> years old.
</div>
```

Although the DOM nodes in this element will be stripped out and not bound by default, they are not lost. Instead, they are supplied to the component (in this case, `my-special-list`), which can include them in its output however it wishes.

This is useful if you want to build components that represent "container" UI elements, such as grids, lists, dialogs, or tab sets, which need to inject and bind arbitrary markup into a common structure. See [a complete example for custom elements](component-custom-elements.md#passing-markup-into-components), which also works without custom elements using the syntax shown above.
