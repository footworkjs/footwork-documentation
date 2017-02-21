You may have routing requirements which are different than what Footwork provides, or you want to inject some behavior into the process. This page explains the routing process and how manipulate (or replace) it.

## Routing Lifecycle

Footwork provides routing logic which flows as follows:

1. A change is made on a routers [currentState](router-state.md#current-state) property. This can occur as a result of:
    
    * Direct manipulation
    * [router.pushState/router.replaceState](router-routing.md#state-change-methods)
    * [route binding](route-binding.md)
    * Browser history [popstate events](https://developer.mozilla.org/en-US/docs/Web/Events/popstate) are written to it.

1. The new route is looked up via [router.getRouteForState](#getrouteforstate).

    This method is expected to take the currentState and use that to lookup and *return* the new route details. See [route resolution and execution](#route-resolution-and-execution).

    This is what you will want to override if implementing custom routing logic.

1. The `currentRoute` returned from [router.getRouteForState](#getrouteforstate) is executed.

    A deep object comparison is done on the old route and new currentRoute, *if* they are different then the route is executed.

    *Execution* of a route means:

    * Its `controller` callback is executed
    * If the route has a `title` it is used to set the browser title
    * If the route has a `url` property it is used to set the browser url

## Route Resolution and Execution

`router.getRouteForState(currentState)`

When the [currentState](router-state.md#current-state) changes, `router.getRouteForState` is the method used to lookup the route. Its function is to lookup the route using the currentState and return the route details (if a matching route was located).

The value returned is what is written to `router.currentRoute` (which is then executed), you can store any details about the current route by returning them in the route details from getRouteForState.

If the route returned is different from the previous route then it will be executed. There are several parameters Footwork will look for when executing it (although you can store whatever you like in this object):

```javascript
// route details object returned from getRouteForState(currentState)
{
  controller: /* see below */,
  title: /* see below */,
  params: /* see below */,
  url: /* see below */
}
```

* [controller](#controller-callback) (callback) *(required)*
* [title](#title-string) (string) *(optional)*
* [params](#params-any) (any) *(optional)*
* [url](#url-string) (string) *(optional)*

### controller (callback)

This is the callback executed for the route. It is passed any params defined by the route details.

```javascript
{
  controller: function (routeParams) {
    this.outlet('display-area', 'some-component');
  }
}
```

### title (string)

If provided, this value will be used to set the browser title.

```javascript
{
  title: 'My Cool Page'
}
```

### params (any)

This value will be provided to the controller callback.

```javascript
{
  controller: function (params) {
    // params.value === 1
  },
  params: {
    value: 1
  }
}
```

### url (string)

If provided, this value will be used to set the browser url.

```javascript
{
  url: '/path/to/route'
}
```

## Example Custom Routing

You can override the getRouteForState method and provide your own unique routing logic. For example if you wanted to route according to a numeric id, you might override the routing mechanism like this:

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
        title: 'Page 1',
        controller: function () { /* ... */ }
      },
      {
        id: 2,
        title: 'Page 2',
        controller: function () { /* ... */ }
      }
    ]
  });

  // Override getRouteForState
  self.getRouteForState = function (currentState) {
    // Search for the route using the currentState.
    return self.routes().reduce(function (foundRoute, route) {
      if (route.id === currentState.id) {
        /**
         * We return the route and any params that were passed along.
         * The params will be provided to the controller callback on
         * the route when it is triggered.
         */
        return {
          controller: route.controller,
          title: route.title,
          params: currentState.params
        }
      }
      return foundRoute;
    }, null);
  };
}
```

!!! Tip
    It doesn't matter where or how your routes are stored. The example above shows custom routing using the standard `routes` observable on the router. Keep in mind you could store your routes anywhere or even generate them on the fly if you wanted to.

### Triggering a Custom Route

Triggering one of these custom routes would be done like any other route. The state you set `currentState` to is what is passed to the `getRouteForState` callback. This means that you can continue to use the standard [router.pushState/router.replaceState](router-routing.md#state-change-methods) and route bindings like you normally would.

Example [router.pushState](router-routing.md#state-change-methods):

```javascript
router.pushState({
  id: 2,
  params: {
    thing: 'value'
  }
});
```

Example [route binding](route-binding.md):

```html
<a data-bind="route: {
  state: {
    id: 2,
    params: { thing: 'value' }
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
