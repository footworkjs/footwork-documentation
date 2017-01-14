## Defining and Accessing the Routes

The route configuration can be specified during the bootstrap process via the `routes` configuration option:

```javascript
function MyRouter () {
  var self = fw.router.boot({
    namespace: 'Router',
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
  });
}
```

The routes are also accessible at the [observable array](observableArrays.md) `router.routes` after being bootrapped as well:

```javascript
function MyRouter () {
  var self = fw.router.boot({
    namespace: 'Router'
  });

  self.routes([
    {
      route: '/',
      controller: function () { /* ... */ }
    },
    {
      route: '/dashboard',
      controller: function () { /* ... */ }
    }
  ]);
}
```

Since the routes property is an [observable array](observableArrays.md) you can do things like:

* Add a route by pushing it onto the array:

    ```javascript
    self.routes.push({
      route: '/news',
      controller: function () { /* ... */ }
    });
    ```

* Remove a route by removing it from the array:

    ```javascript
    var newsRoute = {
      route: '/news',
      controller: function () { /* ... */ }
    };

    self.routes.push(newsRoute);
    // ...
    self.routes.remove(newsRoute);
    ```

* Listen for and respond to changes to the routes:

    ```javascript
    self.routes.subscribe(function (routesList) {
      console.info('Routes changed, they are now:', routesList);
    });
    ```

See [observable arrays](observableArrays.md) for full information on all operations available.

## Configuration Options

When specifying an individual route, you can pass along several options:

```javascript
{
  route: /* see below */,
  name: /* see below */,
  title: /* see below */,
  controller: /* see below */,
  predicate: /* see below */
}
```

* [route](#route-string-array) (string | array)
* [name](#name-string) (string)
* [title](#title-string-callback) (string | callback)
* [controller](#controller-callback) (callback)
* [predicate](#predicate-callback) (callback)

!!! Note "Callback Context"
    All callback functions execute with the context of the `router` instance.

### route (string | array)

It is the string which is used to match against the url. Routes are matched according to the pattern you provide in the route string.

!!! Note
    You must provide a route string value. [Named routes](#name-string) are optional.

There are a few available patterns you can define in your route string:

#### Static Routes

This is an explicitly defined route:

```javascript
route: '/path/for/route'
```

This is a simple explicitly defined route that will match when the browser navigates to `/path/for/route`.

#### Required Parameter

This is a route with a required parameter:

```javascript
route: '/user/:id'
```

This route will match anything that starts with `/user/` followed by something after, such as '/user/123'.

#### Optional Parameter

This is a route with an optional parameter:

```javascript
route: '/books(/:isbn)'
```

This route will match anything that starts with `/books` and *optionally* followed by something after, such as '/books' and '/books/123'.

!!! Note "Route Array"
    Note that you can provide a list of routes for a controller by supplying them in an array:

    ```javascript
    route: ['/path/for/route', '/other/path/for/route']
    ```

    All supplied route strings will be matched against when determining if a route matches a url.

#### Route Splat

A *splat* is a pattern which will match anything:

```javascript
route: '/settings*details'
```

This route will match anything that starts with `/settings` and ends with `details`, such as '/settings/history/details' and '/settings/profile/details'.

### name (string)

Routes can also have a name attached to them. This name can be used as an alternative to url based routing.

```javascript
url: '/user/:id',
name: 'user-profile'
```

For information on how to trigger via a named route, see [Explicit Named Routing](router-routing.md#named-route) below.

### title (string | callback)

If provided, this will set the title on the document after the route has been triggered.

#### Title String

```javascript
title: 'Home Page'
```

#### Title Callback

If you provide a callback function, it will be evaluated each time the route is triggered:

```javascript
title: function () {
  if(this.currentState() === '/profile') {
    return 'My Profile Page';
  }
  return 'Acme Corp';
}
```

### controller (callback)

The callback evaluator which is run each time the route is triggered. It is passed an object containing any parameters defined by the route.

```javascript
route: '/user/:id',
controller: function (params) {
  console.info('user id', params.id);
}
```

The controller is where you will generally do any outlet changes:

```javascript
route: '/news',
controller: function (params) {
  this.outlet('main', 'news');
}
```

For more information on outlets, see the [outlet documentation](router-outlets.md).

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

!!! Note "Router Predicate"
    Remember that the [router configuration](router-creation.md#predicate-callback) also has an option for a `predicate` callback. If provided, either/both callbacks will be evaluated and both must return true for the route to change.
