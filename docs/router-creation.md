# Router Creation and Configuration

A `router` (as it is referred to in this sub-section) is a more formal expression of a standard view model. It allows you to hook into the various lifecycle events Footwork provides as well as enabling other capabilities.

In its essense a `router` can be thought of as a container that houses the logic and data your template/HTML/DOM binds to. They are used to 'wrap' your HTML/markup, having the bindings (behavior) you declare in the HTML applied to the logic you define in the `router`.

## Creation

A `router` is a view model object that has been bootstrapped with `fw.router.boot()` by passing it the instance along with an optional configuration:

```javascript
function MyRouter () {
  var self = fw.router.boot(this, {
    // see Configuration below
  });

  self.someValue = fw.observable();
}
```

In the code above you see the instance bootstrapped as a `router`, the boot method will return a reference to the instance.

## Configuration

When you call `fw.router.boot()` you pass it two parameters, the view model instance/object and an optional configuration object. The configuration for a `router` has the following options:

```javascript
function MyRouter () {
  // For convenience the boot method returns a reference to the instance.
  var self = fw.router.boot(this, {
    namespace: /* see below */,
    afterRender: /* see below */,
    afterResolve: /* see below */,
    onDispose: /* see below */,
    sequence: /* see below */,
    baseRoute: /* see below */,
    activate: /* see below */,
    predicate: /* see below */,
    outlet: /* see below */
  });
}
```

All of these options, are optional...you only have to provide the values required for your applications needs.

* [namespace](#namespace) (string)
* [afterRender](#afterrender-callback) (callback)
* [afterResolve](#afterresolve-callback) (callback)
* [onDispose](#ondispose-callback) (callback)
* [sequence](#sequence-integer-callback) (integer | callback)
* [routes](#routes-array) (array)
* [baseRoute](#baseroute-string) (string)
* [activate](#activate-boolean) (boolean)
* [predicate](#predicate-callback) (callback)
* [outlet](#outlet-object) (object)

!!! Note "Callback Context"
    All callback functions execute with the context of the `router` instance.

Each of these options and their use is described below:

### namespace (string)

Footwork provides an easy way to logically separate your modules using string-based identifiers. This configuration value is used to set the `router` namespace:

```javascript
namespace: 'MyRouter'
```

Once your `router` is bootstrapped its namespace is made available as `$namespace` on the object instance:

```javascript
function MyRouter () {
  fw.router.boot(this, { namespace: 'MyRouter' });
  this.$namespace.subscribe('someEvent', function () {
    // do something...
  });
}
```

Namespaces in Footwork are a mechanism used to help keep your application [loosely coupled yet highly cohesive](https://thebojan.ninja/2015/04/08/high-cohesion-loose-coupling/). Among other things, namespacing provides hooks for pub/sub communication, as well as [broadcastables / receivables](broadcastable-receivable.md). For more information see [namespaces](namespacing.md).

### afterRender (callback)

This callback is triggered after binding and rendering the `router` with the DOM (but before `afterResolve()` and also before any nested elements are bound/resolved).

It is passed one parameter, the parent DOM element the `router` is bound against.

```javascript
afterRender: function (element) {
  console.info('My element is', element);
}
```

Prospectively you might use this as a way to startup various 3rd party plugins such as those that work with jQuery.

### afterResolve (callback)

This callback is triggered after binding the `router` with the DOM and all nested components/etc have been fully resolved as well.

If you are animating a `router` into place then that will only occur once the instance has been resolved. Note that the resolution of your `router` only affects when it is animated into place, it does not affect when it is bound or rendered into the DOM (that occurs as soon as possible). If you are not animating your instances into place then you do not need to worry about when it is resolved. For information on how to use the animation features, see [animating routers](router-animation.md).

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
    Each instance, once marked *resolved*, will be animated into place if configured to do so (see: [animating routers](router-animation.md)).

### onDispose (callback)

This callback is triggered anytime the `router` has its `dispose()` method called. It is passed one parameter, the parent DOM element the `router` is bound against.

```javascript
onDispose: function (element) {
  // custom disposal logic
}
```

Just as with `afterRender` this might be used as an API hook for 3rd party plugins. You would do whatever custom disposal logic you might need here.

!!! Note
    Footwork will trigger `dispose()` automatically if:

    * The `router` was bound with a component that was removed from the DOM
    * The element a `router` was bound against was removed from the DOM

### sequence (integer | callback)

The value provided will cause Footwork to sequence the animations on all `router` instantiated with the same namespace as this one. Essentially this means that if you instantiate a bunch of the same `routers` then their animations will all be sequenced with a delay between them being the value provided here. This enables you to easily animate in elements in a pleasing way.

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

For more information see [animating routers](router-animation.md) and more specifically [sequencing animations](router-animation.md#sequencing-animations).

### baseRoute (string)

Beginning portion of a url which is excluded when searching for a matching [route configuration](#routes-array). This is for use in cases where your application lives at a url which is not at the root of the domain (ie: `www.domain.com/sub/folder` vs `www.domain.com`).

If you do not specify a `baseRoute` when your application is not at the root of its domain, then you would have to prepend that path to each route as well.

```javascript
baseRoute: '/sub/folder'
```

### routes (array)

The routes your application has defined.

```javascript
routes: [
  {
    route: '/',
    controller: function () { /* ... */ }
  },
  {
    route: '/dashboard',
    controller: function () { /* ... */ }
  }
]
```

See the [route configuration documentation](router-route-config.md) for full information on how to configure and use routes.

### activate (boolean)

This flag indicates whether or not the router instance should be activated automatically once it is bound against the DOM. By default this value is `true`.

```javascript
activate: true
```

If you specify `false` then you will have to activate the router explicitly yourself by setting the activated observable property to `true`:

```javascript
router.activated(true);
```

!!! Note "Router Deactivation"
    You can disable/deactivate a router at anytime by setting the `activated` observable to false:

    ```javascript
    router.activated(false);
    ```

### predicate (callback)

If provided this callback will evaluated prior to a route change, its result (true/false) will determine whether or not the routing is allowed to take place.

```javascript
predicate: function (url) {
  if (url.match(/^\/profile/) && !loggedIn) {
    return false;
  }
  return true;
}
```

!!! Note "Individual Route Predicate"
    The predicate shown above is called for *all routes*. Each individual [route configuration](router-route-config.md#predicate-callback) also has an option for a `predicate` callback. If provided, either/both callbacks will be evaluated and both must return true for the route to change.

### outlet (object)

When performing an outlet change you can pass it several options. This object provides defaults used for those outlet changes at a router level (all outlet changes on that router are supplied them):

```javascript
outlet: {
  loading: 'loading-display',
  transition: 300,
  onComplete: function (outletElement) {
    // do something
  }
}
```

The options you provide here are the same as you would provide directly to an outlet when manipulating it (see: [outlet options documentation](router-outlets.md#outlet-options)), however there are two differences to take into consideration when supplying outlet options on the router itself:

1. You can provide a callback function for the `loading` option.

    This is to facilitate being able to programmatically provide different loading displays from the router itself. The callback you provide is given the name of the outlet being changed (and its context is the router). The callback should return the name of the component to use as the loading display for the outlet.
    
    An example usage of this callback:

    ```javascript
    outlet: {
      loading: function (outletName) {
        return 'loading-display';
      }
    }
    ```


1. All of these outlet options are overridden by local options provided on an explicit outlet change.

    The one exception is the `onComplete` callback, which will be called *in addition* to an `onComplete` callback provided explicitly for any outlet change.
