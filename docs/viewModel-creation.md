# ViewModel Creation and Configuration

A `viewModel` (as it is referred to in this section) is a *bootstrapped* expression of a [normal view model](architecture.md#creating-view-models). It allows you to hook into the various lifecycle events Footwork provides as well as enabling other capabilities.

It can be thought of as a container that houses the logic and data your template/HTML/DOM binds to. They are used to 'wrap' your HTML/markup, having the bindings (behavior) you declare in the HTML applied to the logic you define in the `viewModel`.

## Creation

A `viewModel` is a view model object that has been bootstrapped with `fw.viewModel.boot()` by passing it the instance along with an optional configuration:

```javascript
function MyViewModel () {
  var self = fw.viewModel.boot(this, {
    // see Configuration below
  });

  self.someValue = fw.observable();
}
```

In the code above you see the instance bootstrapped as a `viewModel`, the boot method will return a reference to the instance.

## Configuration

When you call `fw.viewModel.boot()` you pass it two parameters, the view model instance/object and an optional configuration object. The configuration for a `viewModel` has the following options:

```javascript
function MyViewModel () {
  // For convenience the boot method returns a reference to the instance.
  var self = fw.viewModel.boot(this, {
    namespace: /* see below */,
    afterRender: /* see below */,
    afterResolve: /* see below */,
    onDispose: /* see below */,
    sequence: /* see below */
  });
}
```

All of these options, are optional...you only have to provide the values required for your applications needs.

* [namespace](#namespace-string) (string)
* [afterRender](#afterrender-callback) (callback)
* [afterResolve](#afterresolve-callback) (callback)
* [onDispose](#ondispose-callback) (callback)
* [sequence](#sequence-integer-callback) (integer | callback)

!!! Note "Callback Context"
    All callback functions execute with the context of the `viewModel` instance.

Each of these options and their use is described below:

### namespace (string)

Footwork provides an easy way to logically separate your modules using string-based identifiers. This configuration value is used to set the `viewModel` namespace:

```javascript
namespace: 'MyViewModel'
```

Once your `viewModel` is bootstrapped its namespace is made available as `$namespace` on the object instance:

```javascript
function MyViewModel () {
  fw.viewModel.boot(this, { namespace: 'MyViewModel' });
  this.$namespace.subscribe('someEvent', function () {
    // do something...
  });
}
```

Namespaces in Footwork are a mechanism used to help keep your application [loosely coupled yet highly cohesive](https://thebojan.ninja/2015/04/08/high-cohesion-loose-coupling/). Among other things, namespacing provides hooks for pub/sub communication, [viewModel animation](viewModel-animation.md), as well as [broadcastables / receivables](broadcastable-receivable.md). For more information see [namespacing](namespacing.md).

### afterRender (callback)

This callback is triggered after binding and rendering the `viewModel` with the DOM (but before `afterResolve()` and also before any nested elements are bound/resolved).

It is passed one parameter, the parent DOM element the `viewModel` is bound against.

```javascript
afterRender: function (element) {
  console.info('My element is', element);
}
```

Prospectively you might use this as a way to startup various 3rd party plugins such as those that work with jQuery.

### afterResolve (callback)

This callback is triggered after binding the `viewModel` with the DOM and all nested components/viewModels/etc have been fully resolved as well.

If you are animating a `viewModel` into place then that will only occur once the instance has been resolved. Note that the resolution of your `viewModel` only affects when it is animated into place, it does not affect when it is bound or rendered into the DOM (that occurs as soon as possible). If you are not animating your instances into place then you do not need to worry about when it is resolved. For information on how to use the animation features, see [animating viewModels](viewModel-animation.md).

The `afterResolve` callback is passed one parameter, a **resolve** function. Using the **resolve()** function you tell Footwork when your instance has been resolved. It can be called in three different ways to specify resolution, depending on your needs:

* You can call it nothing to mark the current instance as resolved immediately:

    ```javascript
    afterResolve: function (resolve) {
      resolve(); // now marked as resolved
    }
    ```

* You can pass it a promise which Footwork then waits to be fulfulled or rejected:

    ```javascript
    afterResolve: function (resolve) {
      var myRequest = fetch(/* ... */);
      resolve(myRequest); // marked resolved once myRequest resolves/rejects
    }
    ```

* You can pass it an array of promises which Footwork then waits to be fulfulled or rejected:

    ```javascript
    afterResolve: function (resolve) {
      var requests = [
        fetch(/* ... */),
        fetch(/* ... */)
      ];
      resolve(requests); // marked resolved once all of the requests resolve/reject
    }
    ```

* The resolve callback itself returns a promise which resolves once all promises you pass in have resolved:

    ```javascript
    afterResolve: function (resolve) {
      var requests = [
        fetch(/* ... */),
        fetch(/* ... */)
      ];
      resolve(requests).then(function () {
        console.info('all requests have completed');
      });
    }
    ```

Once your instance has been marked as *resolved* (along with any siblings that may exist), its parent is then informed (if there is one) by calling its `resolve` callback. This continues up the context chain until there are no more left.

!!! Note
    Each instance, once marked *resolved*, will be animated into place if configured to do so (see: [animating viewModels](viewModel-animation.md)).

### onDispose (callback)

This callback is triggered anytime the `viewModel` has its `dispose()` method called. It is passed one parameter, the parent DOM element the `viewModel` is bound against.

```javascript
onDispose: function (element) {
  // custom disposal logic
}
```

Just as with `afterRender` this might be used as an API hook for 3rd party plugins. You would do whatever custom disposal logic you might need here.

!!! Note
    Footwork will trigger `dispose()` automatically if:

    * The `viewModel` was bound with a component that was removed from the DOM
    * The element a `viewModel` was bound against was removed from the DOM

### sequence (integer | callback)

The value provided will cause Footwork to sequence the animations on all `viewModel` instantiated with the same namespace as this one. Essentially this means that if you instantiate a bunch of the same `viewModels` then their animations will all be sequenced with a delay between them being the value provided here. This enables you to easily animate in elements in a pleasing way.

#### Integer Value

```javascript
sequence: 100 // 100 msec between
```

#### Callback Function

This callback is triggered with each new instance:

```javascript
sequence: function () {
  return 100; // 100 msec between
}
```

For more information see [animating viewModels](viewModel-animation.md) and more specifically [sequencing animations](viewModel-animation.md#sequencing-animations).
