# Component Custom Elements

## Overview

Custom elements provide a convenient way of injecting [components](component-basics.md) into your views.

They are a syntactical alternative to the [component binding](component-binding.md) (and in fact, custom elements make use of a component binding behind the scenes).

For example, instead of writing this:

```html
<div data-bind='component: { name: "flight-deals", params: { from: "lhr", to: "sfo" } }'></div>
```

... you can write:

```html
<flight-deals params='from: "lhr", to: "sfo"'></flight-deals>
```

This allows for a very modern, [WebComponents](http://www.w3.org/TR/components-intro/)-like way to organize your code.

!!! note
    Custom elements cannot be self-closing.

    You must write `<my-custom-element></my-custom-element>`, and **not** `<my-custom-element />`. Otherwise, your custom element is not closed and subsequent elements will be parsed as child elements.

    This is a limitation of the HTML specification and is outside the scope of what Footwork can control. HTML parsers, following the HTML specification, [ignore any self-closing slashes](http://dev.w3.org/html5/spec-author-view/syntax.html#syntax-start-tag) (except on a small number of special "foreign elements", which are hardcoded into the parser). HTML is not the same as XML.


## Passing Parameters Into Components

As you have seen in the examples above, you can use a `params` attribute to supply parameters to the component viewmodel. The contents of the `params` attribute are interpreted like a JavaScript object literal (just like a `data-bind` attribute), so you can pass arbitrary values of any type. Example:

```html
<unrealistic-component
    params='stringValue: "hello",
            numericValue: 123,
            boolValue: true,
            objectValue: { a: 1, b: 2 },
            dateValue: new Date(),
            someModelProperty: myModelValue,
            observableSubproperty: someObservable().subprop'>
</unrealistic-component>
```

#### Communication between parent and child components

If you refer to model properties in a ```params``` attribute, then you are of course referring to the properties on the viewmodel outside the component (the 'parent' or 'host' viewmodel), since the component itself is not instantiated yet. In the above example, ```myModelValue``` would be a property on the parent viewmodel, and would be received by the child component viewmodel's constructor as ```params.someModelProperty```.

This is how you can pass properties from a parent viewmodel to a child component. If the properties themselves are observable, then the parent viewmodel will be able to observe and react to any new values inserted into them by the child component.

#### Passing observable expressions

In the following example,

```html
<some-component
    params='simpleExpression: 1 + 1,
            simpleObservable: myObservable,
            observableExpression: myObservable() + 1'>
</some-component>
```

... the component viewmodel's ```params``` parameter will contain three values:

  * `simpleExpression`: This will be the numeric value `2`. It will not be an observable or computed value, since there are no observables involved.

      * In general, if a parameter's evaluation does not involve evaluating an observable (in this case, the value did not involve observables at all), then the value is passed literally. If the value was an object, then the child component could mutate it, but since it's not observable the parent would not know the child had done so.

  * `simpleObservable`: This will be the [`fw.observable`](observables.md) instance declared on the parent viewmodel as `myObservable`. It is not a wrapper --- it's the actual same instance as referenced by the parent. So if the child viewmodel writes to this observable, the parent viewmodel will receive that change.

      * In general, if a parameter's evaluation does not involve evaluating an observable (in this case, the observable was simply passed without evaluating it), then the value is passed literally.

  * `observableExpression`: This one is trickier. The expression itself, when evaluated, reads an observable. That observable's value could change over time, so the expression result could change over time.

      * To ensure that the child component can react to changes in the expression value, Footwork **automatically upgrades this parameter to a computed property**. So, the child component will be able to read `params.observableExpression()` to get the current value, or use `params.observableExpression.subscribe(...)`, etc.

      * In general, with custom elements, if a parameter's evaluation involves evaluating an observable, then Footwork automatically constructs a `fw.computed` value to give the expression's result, and supplies that to the component.

In summary, the general rule is:

 1. If a parameter's evaluation **does not** involve evaluating an observable/computed, it is passed literally.

 1. If a parameter's evaluation **does** involve evaluating one or more observables/computeds, it is passed as a computed property so that you can react to changes in the parameter value.

## Passing Markup Into Components

Sometimes you may want to create a component that receives markup and uses it as part of its output. For example, you may want to build a "container" UI element such as a grid, list, dialog, or tab set that can receive and bind arbitrary markup inside itself.

Consider a special list component that can be invoked as follows:

```html
<my-special-list params="items: someArrayOfPeople">
  <!-- Look, I'm putting markup inside a custom element -->
  The person <em data-bind="text: name"></em>
  is <em data-bind="text: age"></em> years old.
</my-special-list>
```

By default, the DOM nodes inside ```<my-special-list>``` will be stripped out (without being bound to any viewmodel) and replaced by the component's output. However, those DOM nodes aren't lost: they are remembered, and are supplied to the component in two ways:

 * As an array, ```$componentTemplateNodes```, available to any binding expression in the component's template (i.e., as a [binding context](binding-context.md) property). Usually this is the most convenient way to use the supplied markup. See the example below.
 * As an array, ```componentInfo.templateNodes```, passed to its [createViewModel function](component-registration.md#a-createviewmodel-factory-function)

The component can then choose to use the supplied DOM nodes as part of its output however it wishes, such as by using ```template: { nodes: $componentTemplateNodes }``` on any element in the component's template.

For example, the ```my-special-list``` component's template can reference ```$componentTemplateNodes``` so that its output includes the supplied markup.

This technique is also possible when using components *without* custom elements, i.e., [passing markup when using the `component` binding directly](component-binding.md#note-passing-markup-to-components).

## Controlling Tag Names

By default, Footwork assumes that your custom element tag names correspond to the names of components registered using `fw.components.register` or `fw.components.registerLocation`. This convention-over-configuration/auto-mapped strategy is ideal for most applications.

If you want to have different custom element tag names or tag names that correspond to components different to their names, you can override `getComponentNameForNode` to control this. For example,

```javascript
// save footworks getComponentNameForNode function for use later
var getComponentNameForNode = fw.components.getComponentNameForNode;

// override the getComponentNameForNode function so we can insert our own logic
fw.components.getComponentNameForNode = function(node) {
  var tagNameLower = node.tagName && node.tagName.toLowerCase();

  if (tagNameLower === "special-element") {
    /**
     * For the element <special-element>, use the component
     * "MySpecialComponent" (whether or not it was preregistered)
     */
    return "MySpecialComponent";
  } else {
    /**
     * For everything else, pass it back to Footwork so it can try to
     * look for any components that are registered or have a location registered.
     * Footwork will use the tagName to map to the equivalently registered component name.
     */
    return getComponentNameForNode(node);
  }
}
```

You can use this technique if, for example, you want to control which subset of registered components may be used as custom elements.

## Registering Custom Elements

If you are using the default component loader, and hence are registering your components using `fw.components.register` or `fw.components.registerLocation`, then there is nothing extra you need to do. Components registered this way are immediately available for use as custom elements.

If you have implemented a [custom component loader](component-loaders.md), and are not using `fw.components.register`, then you need to tell Footwork about any element names you wish to use as custom elements. To do this, simply call `fw.components.register` - you don't need to specify any configuration, since your custom component loader won't be using the configuration anyway. For example,

```javascript
fw.components.register('my-custom-element', { /* No config needed */ });
```

Alternatively, you can [override `getComponentNameForNode`](#controlling-tag-names) to control dynamically which elements map to which component names, independently of preregistration.

### Advanced: Accessing `$raw` parameters

Consider the following unusual case, in which `useObservable1`, `observable1`, and `observable2` are all observables:

```html
<some-component
  params='myExpr: useObservable1() ? observable1 : observable2'>
</some-component>
```

Since evaluating `myExpr` involves reading an observable (`useObservable1`), Footwork will supply the parameter to the component as a computed property.

However, the value of the computed property is itself an observable. This would seem to lead to an awkward scenario, where reading its current value would involve double-unwrapping (i.e., `params.myExpr()()`, where the first parentheses give the value of the expression, and the second give the value of the resulting observable instance).

This double-unwrapping would be ugly, inconvenient, and unexpected, so Footwork automatically sets up the generated computed property (`params.myExpr`) to unwrap its value for you. That is, the component can read `params.myExpr()` to get the value of whichever observable has been selected (`observable1` or `observable2`), without the need for double-unwrapping.

In the unlikely event that you *don't* want the automatic unwrapping, because you want to access the `observable1`/`observable2` instances directly, you can read values from `params.$raw`. For example,

```javascript
function MyComponentViewModel(params) {
    var currentObservableInstance = params.$raw.myExpr();

    // Now currentObservableInstance is either observable1 or observable2
    // and you would read its value with "currentObservableInstance()"
}
```

This should be a very unusual scenario, so normally you will not need to work with `$raw`.
