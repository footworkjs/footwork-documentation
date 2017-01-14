Occasionally, you may find opportunities to streamline your code by attaching new functionality to Footwork's core value types. You can define custom functions on any of the following types:

![](/images/fn/type-hierarchy.png)

Because of inheritance, if you attach a function to `fw.subscribable`, it will be available on all the others too. If you attach a function to `fw.observable`, it will be inherited by `fw.observableArray` but not by `fw.computed`.

To attach a custom function, add it to one of the following extensibility points:

 * `fw.subscribable.fn`
 * `fw.observable.fn`
 * `fw.observableArray.fn`
 * `fw.computed.fn`

Then, your custom function will become available on all values of that type created from that point onwards.

!!! Tip
    It's best to use this extensibility point only for custom functions that are truly applicable in a wide range of scenarios. You don't need to add a custom function to these namespaces if you're only planning to use it once.

### Example

**A filtered view of an observable array**

Here's a way to define a `filterByProperty` function that will become available on all subsequently-created `fw.observableArray` instances:

```javascript
fw.observableArray.fn.filterByProperty = function (propName, matchValue) {
  return fw.pureComputed(function() {
    var allItems = this(), matchingItems = [];
    for (var i = 0; i < allItems.length; i++) {
      var current = allItems[i];
      if (fw.unwrap(current[propName]) === matchValue) {
        matchingItems.push(current);
      }
    }
    return matchingItems;
  }, this);
}
```

This returns a new computed value that provides a filtered view of the array, while leaving the original array unchanged. Because the filtered array is a computed observable, it will be re-evaluated whenever the underlying array changes.
