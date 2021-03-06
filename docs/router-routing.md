One way of changing the route is to explicitly tell the router what to change its state to. This is accomplished by calling one of the two [state changing methods](#state-change-methods) on a router instance.

## Route Types

When explicitly routing you can supply the route in two different forms:

* [url route](#url-route)

* [named route](#named-route)

### URL Route

A URL route is supplied as a *string* value:

```javascript
'/user/12345/profile'
```

### Named Route

A named route is supplied using an *object configuration*:

```javascript
{
  name: 'user-profile',
  params: {
    id: 12345
  }
}
```

Note the object configuration has two parameters, *name* which is required, and *params* which is optional. Any parameters you define in a named route will be passed along to the controller method when it is triggered.

## State Change Methods

Changing the route explicitly is facilitated by two methods:

* [pushState](#pushstate)

    Set the router state, pushing it onto the browser history.

* [replaceState](#replacestate)

    Set the router state, replacing the current browser history entry.

For both [pushState](#pushstate) and [replaceState](#replacestate) below, consider this example router:

```javascript
function Router () {
  var self = fw.router.boot(this, {
    namespace: 'Router',
    routes: [
      {
        name: 'user-profile',
        path: '/user/:id/profile',
        controller: function (params) { /* ... */ }
      }
    ]
  });
}
```

The following shows examples of how we could trigger the configured route using pushState/replaceState (assuming it is already [instantiated and activated](router-usage.md)):

### pushState

* Push using a url route:

    ```javascript
    router.pushState('/user/12345/profile');
    ```

* Push using a named route:

    ```javascript
    router.pushState({
      name: 'user-profile',
      params: {
        id: 12345
      }
    });
    ```

### replaceState

* Replace using a url route:

    ```javascript
    router.replaceState('/user/12345/profile');
    ```

* Replace using a named route:

    ```javascript
    router.replaceState({
      name: 'user-profile',
      params: {
        id: 12345
      }
    });
    ```

!!! Note
    Any parameters supplied (either embedded in and parsed by the route string, or explicitly with a named route object) will be passed to the [controller callback](router-route-config.md#controller-callback) when the route is triggered.
