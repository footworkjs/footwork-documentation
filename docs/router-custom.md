You may have routing requirements which are different than what Footwork provides, or you want to inject some behavior into the process. This page explains the routing process and how manipulate (or replace) it.

## Standard Routing Flow

Footwork provides routing logic which flows as follows:

1. A change is made on a routers [currentState](router-state.md#current-state) property. This can occur as a result of:
    
    * Direct manipulation
    
    * [router.pushState/router.replaceState](router-routing.md#state-change-methods)
    
        !!! Note
            When a [route binding](route-binding.md) is triggered it will use [router.pushState/router.replaceState](router-routing.md#state-change-methods) when manipulating the route.

1. The new route is looked up via [router.getRouteForState](#getrouteforstate).

    This method is expected to take the currentState and use that to lookup and write the new route details to the `router.currentRoute` observable property.

1. The `currentRoute` is executed.

    This is done via a subscription to the property, anytime it changes the new route will have its controller executed with the provided parameters.

## Modifying Route Lookup

`router.getRouteForState(currentState)`

When the [currentState](router-state.md#current-state) changes, `router.getRouteForState` is the method used to lookup the route. Its function is to lookup the route using the currentState and write the route as well as any parameters to the `router.currentRoute` observable (which is then used to trigger the route execution).

You can override this method and provide your own unique routing logic. For example if you wanted to route according to a numeric id, you might override the routing mechanism like this:

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

  // Override getRouteForState
  self.getRouteForState = function (currentState) {
    // Search for the route using the currentState.
    var foundRoute = self.routes().reduce(function (foundRoute, route) {
      if (route.id === currentState) {
        foundRoute = route;
      }
      return foundRoute;
    }, null);

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

A [route binding](route-binding.md) will work also (since it is simply writing the state that you provide):

```html
<a data-bind="route: {
  state: {
    id: 2,
    params: { some: 'value' }
  }
}">Go to Route 2</a>
```

!!! Note
    Normally you would use the route binding against an observable or other value on a view model (to keep the state object and other options separate from the view) rather than explicitly embedding the state as shown in the HTML.
    
    For example, you might have the state object stored on its parent view model using a property called `secondRoute`:

    ```html
    <a data-bind="route: { state: secondRoute }">Go to Route 2</a>
    ```

    For more info see [route binding](route-binding.md).

In the overridden getRouteForState callback above, the `foundRoute` object (written to `self.currentRoute`) is a [route config](router-route-config.md#configuration-options) object. A route config is the configuration you register as a route (typically in the boot config as seen above or afterwards, explicitly in the `router.routes` observable array, see: [defining and accessing the routes](router-route-config.md#defining-and-accessing-the-routes)).

[Route config](router-route-config.md#configuration-options) objects have only one required property, the `controller` method to be called when the route is executed. Every other property is used in the process of finding and determining whether the route is applicable.

For example, the default routing logic uses these route config objects to store the [route predicate](router-route-config.md#predicate-callback) as well as having options for naming a route/etc. You can use these route configuration objects to manage any attribute pertaining to a route...however there are two parameters that Footwork will always look for when executing a new route:

* [controller](router-route-config.md#controller-callback) (callback)
  
    As mentioned above, this is the callback triggered when the route is activated.

* [title](router-route-config.md#title-string-callback) (string / callback) *(optional)*

    When the route controller is executed the page title will be set to this value (if provided).


