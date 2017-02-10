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

`router.currentState`

The `currentState` of your router is an [observable property](observables.md) used to track the browser state. When this value changes a route lookup is triggered, and the first matching route has its controller called.

!!! Note
    This value is initially set to the browsers current location when the router is activated (if it does not yet have a value).

The `currentState` can be altered:

* Explicitly (it is a normal [observable property](observables.md)).
* Via [router.pushState/router.replaceState](router-routing.md#state-change-methods).
* Via [route binding](route-binding.md)
* Browser history [popstate events](https://developer.mozilla.org/en-US/docs/Web/Events/popstate) are written to it.

Using this property you can track/manage the router state, for example you can subscribe to it to track any changes:

```javascript
router.currentState.subscribe(function (currentState) {
  console.info('The route just changed to:', currentState);
});
```

Examples of direct manipulation:

```javascript
router.currentState('/url/for/route');
```

```javascript
router.currentState({
  name: 'my-route',
  params: {
    thing: 'value'
  }
});
```

When the `currentState` is altered it triggers a route lookup, the resulting route returned is written to the [currentRoute](#current-route).

!!! Note
    For more information on the routing process or how to implement custom routing logic, see [Custom Routing](router-custom.md).

## Current Route

`router.currentRoute`

The `currentRoute` of your router is an [observable property](observables.md) which stores the currently active route.

It is updated via a subscription to the [`currentState`](#current-state) value. Any change to the currentState will be evaluated against the [router configurations](router-creation.md#configuration) you have defined. Once the matching route config is found, the route is generated and stored in the `currentRoute` observable property. A subscription to the `currentRoute` then executes its controller, passing in any parameters defined.

!!! Note
    For more information on the routing process or how to implement custom routing logic, see [Custom Routing](router-custom.md).
