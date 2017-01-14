# Router Lifecycle

## Full Lifecycle

When a `router` is injected into your application:

1. **Loaders are asked to supply the router**

    routers are loaded by the component loaders.

    * The default loader is located (and can be overridden) at `fw.components.entityLoader`.

    * The default loader supplies the router based on [what you have registered](router-registration.md). If applicable, this is the phase where it requests any specified AMD modules from your AMD loader.

1. **The router is instantiated**

1. **The router is bound to the view**

    * Its `afterRender` callback will be triggered.

1. **The router is active**

    * Now the router is operating, and can remain on-screen for as long as needed.

    * After all nested elements (components/routers/etc) are resolved then it has its `afterResolve` callback triggered.

1. **The router is torn down and is disposed of**

    * Its `onDispose` callback will be triggered.

    * All computeds and subscriptions (anything with a `dispose()` method) attached to the router will be disposed.

## Disposal

A `router` will be disposed of (and thus freed from memory) in two different cases:

* **Explicitly** when you issue a `router.dispose()` call directly.
* **Automatically** when the element your `router` was bound to is removed from the DOM.

Memory management can become an issue in any long-running or persistent javascript application. This is most usually because javascript developers need to be more keenly aware of the lifecycle of their variables and when they need to be disposed of. The proper disposal of any handlers/etc ensures that the browsers garbage collection can free up its memory.

Certain properties such as any [broadcastables / receivables](broadcastable-receivable.md), [computed values](computedObservables.md), or any manual subscriptions you might have created need to be disposed of.

There are three primary ways of acheiving this:

* [Explicit Disposal](#explicit-disposal) by calling `dispose` on individual properties.
* [Automatic Disposal](#automatic-disposal) by defining them on the root of your instance
* [Explicit Automatic Disposal](#explicit-automatic-disposal) by providing them to Footwork via disposeWithInstance

### **Explicit disposal**

Explicit disposal is done by calling `dispose` on the property/subscription you want disposed of and freed:

```javascript
var observable = fw.observable();
var mySubscription = observable.subscribe(function () { /* ... */ });
// ...
mySubscription.dispose(); // garbage collection can now clean this up
```

### **Automatic Disposal**

Disposal is most easily achieved by ensuring these values are attached directly to the root of the instance. When the parent instance is disposed of Footwork will iterate over your `router` and dispose of any properties attached to it:

```javascript
function Router () {
  var self = fw.router.boot(this);

  self.firstName = fw.observable();
  self.lastName = fw.observable();

  self.fullName = fw.computed(function () {
    return self.firstName() + ' ' + self.lastName();
  }).broadcast('fullName', self);
}
```

In the above example the `fullName` (property needing disposal) will be disposed of automatically when the `router` instance is removed from the DOM (or disposed of explicitly, if not bound against the DOM).

### **Explicit Automatic Disposal**

The easiest way to ensure disposal of properties is to simply attach them to the root of the instance. But what if you have some properties not attached to the instance?

You could track and dispose of them yourself when the parent router is disposed of, but that would be a lot of work. Instead we can tell Footwork to clean then up when the instance is disposed of by passing them to `router.disposeWithInstance`:

```javascript
function Router () {
  var self = fw.router.boot(this);

  self.firstName = fw.observable();

  var randomSubscription = self.firstName.subscribe(function (firstName) {
    console.log('first name is now', firstName);
  });

  self.disposeWithInstance(randomSubscription);
}
```

By using `disposeWithInstance` you can pass your instance a subscription which it will then dispose of when the `router` is disposed. Note that you can also pass an *array* of subscriptions to `disposeWithInstance` as well:

```javascript
var arrayOfSubscriptions = [
  propertyA.subscribe(function () { /* ... */ }),
  propertyB.subscribe(function () { /* ... */ }),
  propertyC.subscribe(function () { /* ... */ })
];
self.disposeWithInstance(arrayOfSubscriptions);
```
