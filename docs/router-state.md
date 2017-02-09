A routers purpose is to help you manage the state of your application. It actions are based on the state of various properties on the instance itself. This page describes those properties and their function.

## Router Activation

By default a router is configured to immediately activate once it has been bound to the DOM. Sometimes you may wish to more closely or explicitly manage the activation of your router. You can disable the automatic activation via setting the `activate` option to *false* on a router config (see: [Router Configuration](router-creation.md#configuration)).

A router will not trigger a route controller unless it is activated. You can enable/disable the activation of a router at any point using the `activated` observable on the instance:

```javascript
router.activated(false); // router will no longer trigger routes

// ...

router.activated(true); // router will now trigger routes again
```

Since the `activated` property is an [observable](observables.md), you can also subscribe and listen for changes to it as well:

```javascript
router.activated.subscribe(function (activated) {
  if(activated) {
    console.log('Router was activated!');
  }
});
```

## Current State

The `currentState` of your router is an [observable property](observables.md) used to track the browser state. When this value changes a route lookup is triggered, and the first matching route controller is called. The currentState property:

* Can be altered explicitly (it is a normal [observable property](observables.md)).

* Is manipulated by the HTML History API ([popstate events](https://developer.mozilla.org/en-US/docs/Web/Events/popstate) propogate to it).

Using this property you can track/manage the router state, for example you can subscribe to it to track any changes:

```javascript
router.currentState.subscribe(function (currentState) {
  console.info('The route just changed to:', currentState);
});
```

When the `currentState` is altered it triggers a route lookup and triggering of its controller (if found). While it is recommended to use the [router.pushState/router.replaceState](router-routing.md#state-change-methods) methods when changing the route explicitly, it **is possible** to change the route by directly manipilating the `currentState` observable on the router instance:

```javascript
router.currentState('/news');
```

Doing so has some side-effects however. Changing the route/state in this way means:

* You bypass any route predicate callbacks.

    The route triggered by the state you set will **always trigger** even if the [route predicate](router-route-config.md#predicate-callback) would fail (because it never gets called).

* Browser history will not be affected.

!!! Note
    If you use the [router.pushState/router.replaceState](router-routing.md#state-change-methods) methods when changing the route explicitly then the previously mentioned side effects of direct `currentState` manipulation are not of concern because:
    
    * The predicates queried before the route is allowed to execute

    * The browser history is correctly pushed/replaced

    See [Explicit Routing](router-routing.md) for more details.

## Current Route

The route expressed by your router is triggered by a subscription to the [`currentState`](#current-state) value and evaluating that against the `routes` you have defined. This evaluation happens any time the `currentState` changes. That can occur as a result of:

1. A change is made on the routers `currentState` explicitly/directly.

1. A change is made on the routers `currentState` via [router.pushState/router.replaceState](router-routing.md#state-change-methods)

1. A browser history state is popped (ie: user hit back or forward)

Once the route is found, it along with any parameters are stored in the `currentRoute` observable property. A subscription to the `currentRoute` then executes its controller, passing in any parameters defined.

For more information on the routing process or how to implement custom routing logic, see [Custom Routing](router-custom.md).
