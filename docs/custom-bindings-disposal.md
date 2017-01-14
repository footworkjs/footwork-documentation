In a typical Footwork application, DOM elements are dynamically added and removed, for example using the [`template`](template-binding.md) binding or via control-flow bindings ([`if`](if-binding.md), [`ifnot`](ifnot-binding.md), [`with`](with-binding.md), and [`foreach`](foreach-binding.md)). When creating a custom binding, it is often desirable to add clean-up logic that runs when an element associated with your custom binding is removed by Footwork.

## Registering a callback

To register a function to run when a node is removed, you can call `fw.utils.domNodeDisposal.addDisposeCallback(node, callback)`. As an example, suppose you create a custom binding to instantiate a widget. When the element with the binding is removed, you may want to call the `destroy` method of the widget:

```javascript
fw.bindingHandlers.myWidget = {
  init: function(element, valueAccessor) {
    var options = fw.unwrap(valueAccessor()),
        $el = $(element);

    $el.myWidget(options);

    fw.utils.domNodeDisposal.addDisposeCallback(element, function() {
      // This will be called when the element is removed by Footwork or
      // if some other part of your code calls fw.removeNode(element)
      $el.myWidget("destroy");
    });
  }
};
```

## Overriding the clean-up

When removing an element, Footwork runs logic to clean up any data associated with the element. As part of this logic, Footwork calls jQuery's `cleanData` method if jQuery is loaded in your page. In advanced scenarios, you may want to prevent or customize how this data is removed in your application. Footwork exposes a function, `fw.utils.domNodeDisposal.cleanExternalData(node)`, that can be overridden to support custom logic. For example, to prevent `cleanData` from being called, an empty function could be used to replace the standard `cleanExternalData` implementation:

```javascript
fw.utils.domNodeDisposal.cleanExternalData = function () {
  // Do nothing. Now any jQuery data associated with elements will
  // not be cleaned up when the elements are removed from the DOM.
};
```
