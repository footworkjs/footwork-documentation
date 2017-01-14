One of the most common needs in a modern single page application is to facilitate a route/state change when clicking an element. An example of this would be a user clicking their profile page link in the header.

The easiest way of accomplishing this is via the `route` binding.

## Basic Route Binding

```html
<router module="Router">
  <a href="/profile" data-bind="route">Profile</a>
</router>
```

When a `route` binding is triggered it will traverse the DOM tree upwards until it finds its nearest parent router. It will then initiate the state change to the newly addressed route/state.

!!! Note
    * By default the `route` binding will retrieve its destination url from the `href` property of the element it is attached to and triggers off of the *click* event.

        You can alter these defaults (and more) by providing a [binding options](#binding-options) configuration.

    * Any element can be bound to a route...it does not have to be an anchor tag.

## Binding Lifecycle

When Footwork encounters a `route` binding:

1. The binding is initialized.

    If no [binding options](#binding-options) object is provided then:

    * The element is inspected and its `href` property is used as the `url` value

    * Its handler is bound against the *click* event on the element.

1. If the element is an *anchor* tag, then its `href` attribute is set to the `url` value.

1. The binding is now active until the element is removed from the DOM. It will respond to the configured event on the element.

    When that event is triggered, its nearest parent router state is changed per the route binding configuration.

1. The element is removed from the DOM, its handler is unsubscribed from the event and the binding is disposed of.

## Binding Options

There are several options available when binding a route with an options object:

* [url](#url-string) (string)
* [on](#on-string) (string)
* [activeClass](#activeclass-string-callback) (string | callback)
* [history](#history-string-callback) (string | callback)
* [handler](#handler-callback) (callback)

!!! Note "Callback Binding and Context"
    Binding a callback operates on the local context.

    This means that when you bind a callback/handler in your DOM it will be binding against the local view model the element is bound against, which is *not necessarily* the parent router (the router is likely/usually higher in the DOM tree).

### url (string)

The url route string used when the user triggers the binding.

```html
<a data-bind="route: { url: '/profile' }">Profile</a>
```

!!! Note

    * This will override the element `href` if present.

    * If the bound element is an anchor tag, then this value will be used to set the `href` attribute on it.

    Search engines can use this when indexing the document. This also means users will be able to hover their mouse over to inspect or copy/paste any `route` bound link (just as they would any other link).

### on (string)

You can provide a different event upon which the binding is triggered:

```html
<a data-bind="route: { on: 'dblclick' }" href="/profile">Profile</a>
```

### activeClass (string | callback)

Any element bound to the *currently active route* will have this class applied to it. The default being: `active`

#### String Value

```html
<a data-bind="route: { activeClass: 'active' }" href="/profile">Profile</a>
```

#### Callback Function

You can also provide a callback function which returns the class to use:

```html
<a data-bind="route: { activeClass: active }" href="/profile">Profile</a>
```

```javascript
viewModel.active = function () {
  return 'is-active';
}
```

This callback is triggered anytime the *active route* changes and matches the bound url (or when the element is initially bound, if the route already matches upon initialization).

### history (string | callback)

By default a `pushState` call is made when the binding is triggered. You can alter this by providing either `push` or `replace` with this value.

#### String Value

```html
<a data-bind="route: { history: 'replace' }" href="/profile">Profile</a>
```

#### Callback Function

If you provide a callback function, its return value will be used to tell Footwork which history method to use:

```html
<a data-bind="route: { history: whichHistory }" href="/profile">Profile</a>
```

The callback is provided the browser event used to trigger the binding along with the destination url:

```javascript
self.whichHistory = function (event, url) {
  return 'replace';
}
```

This callback is evaluated whenever the binding is triggered.

### handler (callback)

The handler called whenever the **on** event is triggered:

```html
<a data-bind="route: { handler: goToProfile }" href="/profile">Profile</a>
```

This handler should return true or false, indicating whether or not the click is *valid* and should be routed to. Think of the callback as a predicate function for the route.

The callback is provided the browser event used to trigger the binding along with the destination url:

```javascript
self.goToProfile = function (event, url) {
  // preventDefault prevents the browser from loading the new url
  event.preventDefault();

  if (url === '/profile' && isLoggedIn) {
    return true; // route controller will be executed
  } else {
    return false; // nothing will happen
  }
};
```
