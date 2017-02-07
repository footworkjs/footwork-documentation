A routers purpose is to help you manage the state of your application. As such, it itself has a few properties attached to it that you may need to access or manipulate.

## Router Activation

Sometimes you may wish to more closely or explicitly manage the activation of your router. By default a router is configured to immediately activate once it has been bound to the DOM. You can disable this via setting the `activate` option to *false* on a router config (see: [Router Configuration](router-creation.md#configuration)).

You can enable/disable the activation of a router at any point using the `activated` observable on the instance:

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

The `currentState` of your router is the state it is presently addressed to - this matches up with and is manipulated by the HTML History API state. You can track/manage the router state at this property on the instance:

```javascript
router.currentState.subscribe(function (currentState) {
  console.info('The route just changed to:', currentState);
});
```

!!! Tip
    Note that it **is possible** to change the route by directly manipilating the `currentState` observable on the router instance:

    ```javascript
    router.currentState('/news');
    ```

    Doing so has some side-effects however. Changing the route/state in this way means:

    * You bypass any route predicate callbacks.

        The route triggered by the state you set will **always trigger** even if the [route predicate](router-route-config.md#predicate-callback) would fail (because it never gets called).

    * Browser history will not be affected.

    For more information on implementing custom routing logic, see [Custom Routing](router-custom.md).

## Current Route

The route expressed by your router is done by subscribing to the [`currentState`](#current-state) value and evaluating that against the `routes` you have defined on the router. This evaluation happens any time the `currentState` changes. That can occur as a result of:

1. A change is made on the routers `currentState` (manually or via [router.pushState/router.replaceState](router-routing.md#state-change-methods))

1. A browser history state is popped (ie: user hit back or forward)

If you want to know what route is being filtered out of your routes and expressed at any given time then that is done by observing the `currentRoute` value:

```javascript
router.currentRoute.subscribe(function (currentRoute) {
  console.info('The current route is:', currentRoute);
});
```

!!! Tip
    Note that it **is possible** to change the route by directly manipilating the `currentRoute` observable on the router instance.

    ```javascript
    router.currentRoute({
      route: {
        controller: function () { /* ... */ }
      }
    });
    ```

    Doing this has similar side effects to directly manipulating the `currentState`, in that:

    * You bypass any route predicate callbacks.

        The route triggered by the state you set will **always trigger** even if the [route predicate](router-route-config.md#predicate-callback) would fail (because it never gets called).

    * Browser history will not be affected.

    For more information on implementing custom routing logic, see [Custom Routing](router-custom.md).
