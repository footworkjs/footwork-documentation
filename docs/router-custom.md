You may have routing requirements which are different than what Footwork provides, or you want to inject some behavior into the process. This page explains the routing process and how manipulate (or replace) it.

## Standard Routing Flow

Footwork provides routing logic which flows as follows:

1. A change is made on a routers [currentState](router-state.md#current-state) property. This can occur as a result of:
    
    * Direct manipulation
    
    * [router.pushState/router.replaceState](router-routing.md#state-change-methods)
    
        !!! Note
            When a [route binding](route-binding.md) is triggered it will use [router.pushState/router.replaceState](router-routing.md#state-change-methods) when manipulating the route.

1. The new route is looked up via [router.getRouteForState](#getrouteforstate)

    This method is expected to take the currentState and use that to lookup and write the new route details to the observable router.currentRoute.

## Routing Hooks

### getRouteForState

This is the method used to lookup the route using a routers [currentState](router-state.md#current-state) property. Its function is to lookup the route using the currentState and write the route as well as any parameters to the `router.currentRoute` observable (which is then used to trigger the route).

You can override this method and provide your own unique routing logic. For example if you wanted to route according to a numeric id, you would override the routing mechanism like this:

```javascript
function MyRouter () {
  /**
   * Bootstrap the router like normal, but provide route config objects
   * which include a unique id we will use to look them up later.
   */
  var self = fw.router.boot(this, {
    routes: [
      {
        id: 1,
        controller: function () { /* ... */ }
      },
      {
        id: 2,
        controller: function () { /* ... */ }
      }
    ]
  });
  
  self.getRouteForState = function (currentState) {
    var foundRoute;

    // Search for the route using the currentState.
    self.routes().forEach(function (route) {
      if (route.id === currentState.id) {
        foundRoute = route;
      }
    });

    if (foundRoute) {
      /**
       * After finding the route we then write it and any params
       * that were passed along. The params will be provided to the
       * controller callback on the route when it is triggered.
       */
      self.currentRoute({
        route: foundRoute,
        params: currentState.params
      });
    }
  };
}
```

You could then route to one of those on an instance of the router like this:

```javascript
router.pushState({
  id: 2,
  params: {
    thing: 'value'
  }
});
```

...or, a route binding will work also (since it is simply writing the state that you provide):

```html
<a data-bind="route: {
  state: {
    id: 2,
    params: { some: 'value' }
  }
}">Go to Route 2</a>
```

!!! Note
    Normally you would use the route binding against an observable or other value on a view model (to keep the state object separate from the view) rather than explicitly embedding the state as shown in the HTML.

    ```html
    <a data-bind="route: { state: secondRoute }">Go to Route 2</a>
    ```

    For more info see [route binding](route-binding.md).

The `foundRoute` object in the example above (written to `self.currentRoute`) is a [route config](router-route-config.md#configuration-options) object. A route config is the configuration you register as a route (typically in the boot config as seen above or afterwards, explicitly in the `router.routes` observable array, see: [defining and accessing the routes](router-route-config.md#defining-and-accessing-the-routes)).

The default routing logic uses these route config objects to store the [route predicate](router-route-config.md#predicate-callback) as well as having options for naming a route/etc. You can use these route configuration objects to manage any attribute pertaining to a route...however there are two parameters that Footwork will always look for when executing a new route:

* [controller](router-route-config.md#controller-callback) (callback)
  
    This is the callback triggered when the route is activated.

* [title](router-route-config.md#title-string-callback) (string / callback) *(optional)*

    When the routing takes place the page title will be set to this value (if provided).


