You're not limited to using the built-in bindings like `click`, `value`, and so on --- you can create your own ones. This is how to control how observables interact with DOM elements, and gives you a lot of flexibility to encapsulate sophisticated behaviors in an easy-to-reuse way.

For example, you can create interactive components like grids, tabsets, and so on, in the form of custom bindings.

## Registering A Binding

To register a binding, add it as a subproperty of `fw.bindingHandlers`:

```javascript
fw.bindingHandlers.yourBindingName = {
  init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    // This will be called when the binding is first applied to an element
    // Set up any initial state, event handlers, etc. here
  },
  update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    // This will be called once when the binding is first applied to an element,
    // and again whenever any observables/computeds that are accessed change
    // Update the DOM element based on the supplied values here.
  }
};
```

... and then you can use it on any number of DOM elements:

```html
<div data-bind="yourBindingName: someValue"> </div>
```

!!! Tip
    You don't actually have to provide both `init` *and* `update` callbacks --- you can just provide one or the other if that's all you need.

## The "update" callback

Footwork will call the `update` callback initially when the binding is applied to an element and track any dependencies (observables/computeds) that you access. When any of these dependencies change, the `update` callback will be called once again. The following parameters are passed to it:

* `element`

    The DOM element involved in this binding

* `valueAccessor`

    A JavaScript function that you can call to get the current model property that is involved in this binding. Call this without passing any parameters (i.e., call `valueAccessor()`) to get the current model property value. To easily accept both observable and plain values, call `fw.unwrap` on the returned value.

* `allBindings`

    A JavaScript object that you can use to access all the model values bound to this DOM element. Call `allBindings.get('name')` to retrieve the value of the `name` binding (returns `undefined` if the binding doesn't exist); or `allBindings.has('name')` to determine if the `name` binding is present for the current element.

* `viewModel`

    This parameter is deprecated. Use `bindingContext.$data` or `bindingContext.$rawData` to access the view model instead.

* `bindingContext`

    An object that holds the [binding context](binding-context.md) available to this element's bindings. This object includes special properties including `$parent`, `$parents`, and `$root` that can be used to access data that is bound against ancestors of this context.

For example, you might have been controlling an element's visibility using the `visible` binding, but now you want to go a step further and animate the transition. You want elements to slide into and out of existence according to the value of an observable. You can do this by writing a custom binding that calls jQuery's `slideUp`/`slideDown` functions:

```javascript
fw.bindingHandlers.slideVisible = {
  update: function(element, valueAccessor, allBindings) {
    // First get the latest data that we're bound to
    var value = valueAccessor();

    // Next, whether or not the supplied model property is observable, get its current value
    var valueUnwrapped = fw.unwrap(value);

    // Grab some more data from another binding property
    var duration = allBindings.get('slideDuration') || 400; // 400ms is default duration unless otherwise specified

    // Now manipulate the DOM element
    if (valueUnwrapped == true) {
      $(element).slideDown(duration); // Make the element visible
    } else {
      $(element).slideUp(duration);   // Make the element invisible
    }
  }
};
```

Now you can use this binding as follows:

```html
<div data-bind="slideVisible: giftWrap, slideDuration:600">You have selected the option</div>
<label><input type="checkbox" data-bind="checked: giftWrap" /> Gift wrap</label>
```

```javascript
  var viewModel = {
    giftWrap: fw.observable(true)
  };

  fw.applyBindings(viewModel);
```

Of course, this is a lot of code at first glance, but once you've created your custom bindings they can very easily be reused in many places.

## The "init" callback

Footwork will call your `init` function once for each DOM element that you use the binding on. There are two main uses for `init`:

* To set any initial state for the DOM element

* To register any event handlers so that, for example, when the user clicks on or modifies the DOM element, you can change the state of the associated observable

Footwork will pass exactly the same set of parameters that it passes to [the update callback](#the-update-callback).

Continuing the previous example, you might want `slideVisible` to set the element to be instantly visible or invisible when the page first appears (without any animated slide), so that the animation only runs when the user changes the model state. You could do that as follows:

```javascript
fw.bindingHandlers.slideVisible = {
  init: function(element, valueAccessor) {
    var value = fw.unwrap(valueAccessor()); // Get the current value of the current property we're bound to
    $(element).toggle(value); // jQuery will hide/show the element depending on whether "value" or true or false
  },
  update: function(element, valueAccessor, allBindings) {
    // Leave as before
  }
};
```

This means that if `giftWrap` was defined with the initial state `false` (i.e., `giftWrap: fw.observable(false)`) then the associated DIV would initially be hidden, and then would slide into view when the user later checks the box.

## Modifying observables after DOM events

You've already seen how to use `update` so that, when an observable changes, you can update an associated DOM element. But what about events in the other direction? When the user performs some action on a DOM element, you might want to updated an associated observable.

You can use the `init` callback as a place to register an event handler that will cause changes to the associated observable. For example,

```javascript
fw.bindingHandlers.hasFocus = {
  init: function(element, valueAccessor) {
    $(element).focus(function() {
      var value = valueAccessor();
      value(true);
    });
    $(element).blur(function() {
      var value = valueAccessor();
      value(false);
    });
  },
  update: function(element, valueAccessor) {
    var value = valueAccessor();
    if (fw.unwrap(value)) {
      element.focus();
    }
    else {
      element.blur();
    }
  }
};
```

Now you can both read and write the "focusedness" of an element by binding it to an observable:

```html
<p>Name: <input data-bind="hasFocus: editingName" /></p>

<!-- Showing that we can both read and write the focus state -->
<div data-bind="visible: editingName">You're editing the name</div>
<button data-bind="enable: !editingName(), click:function() { editingName(true) }">Edit name</button>
```

```javascript
var viewModel = {
  editingName: fw.observable()
};

fw.applyBindings(viewModel);
```

## Supporting virtual elements

If you want a custom binding to be usable with Footwork's *virtual elements* syntax, e.g.:

```html
<!-- ko mybinding: somedata --> ... <!-- /ko -->
```

... then see [the documentation for virtual elements](custom-bindings-for-virtual-elements.md).
