A `router` can be instantiated and bound to the DOM in 3 different ways:

### Explicitly

```HTML
<nav>
  <a href="/" data-bind="route"></a>
</nav>
<main>
  <outlet name="main"></outlet>
</main>
```

```javascript
function MyRouter () {
  var self = fw.router.boot(this, {
    namespace: 'MyRouter',
    routes: [ /* ... */ ]
  });
}

fw.applyBindings(new MyRouter());
```

### Using a Declarative Element

```HTML
<router module="MyRouter">
  <nav>
    <a href="/" data-bind="route"></a>
  </nav>
  <main>
    <outlet name="main"></outlet>
  </main>
</router>
```

```javascript
function MyRouter () {
  var self = fw.router.boot(this, {
    namespace: 'MyRouter',
    routes: [ /* ... */ ]
  });
}

fw.router.register('MyRouter', MyRouter);
fw.start();
```

!!! Note
    * There are a few ways to register your router so that you can use it declaratively, see: [Router Registration](router-registration.md).
    * You can alternatively use `data-module` if you want to stick with fully valid HTML.

        ```html
        <router data-module="MyRouter">
          <!-- ... -->
        </router>
        ```

### Using a Component

Since a router is actually a view model (but with extra features) you can use it as the `viewModel` in a [component](component-basics.md) configuration and then instantiate/bind it like any other component:

```HTML
<my-router></my-router>
```

!!! Note "Component Binding"
    You can of course also use the [component binding](component-binding.md) in addition to a custom element as shown.

```javascript
function MyRouter () {
  var self = fw.router.boot(this, {
    namespace: 'MyRouter',
    routes: [ /* ... */ ]
  });
}

fw.components.register('my-router', {
  router: MyRouter,
  template: '<nav>\
               <a href="/" data-bind="route"></a>\
             </nav>\
             <main>\
               <outlet name="main"></outlet>\
             </main>'
});
fw.start();
```

For more information, see [component basics](component-basics.md) and [component registration](component-registration.md).

!!! Note
    If using a `router` in a component then you do not need to register it separately as a `router`, it is loaded via its component configuration when used in this manner.

## Tools

### fw.router.get()

For debugging purposes you might need to get direct access to one or more of the `router` instances your application has created. If you use a declarative element or component to instantiate your `router` then you aren't explicitly creating them yourself...how do you get access to them?

Footwork provides an easy way to get access to any bootstrapped `router` via the `fw.router.get()` method. There are several ways to call it depending on what you need.

!!! Warning
    You should only use this method for debugging purposes, for anything else you should preferentially use [namespace](namespacing.md)-based communication or [broadcastables / receivables](broadcastable-receivable.md) to synchronize state/data.

    Using this outside of a debugging context risks creating unnecessary coupling and poor cohesion within your application.

For example, lets first instatiate some `routers`...these can be instantiated explicitly or declaratively, as long as they are bootstrapped as a `router` then this method can retrieve them. For purposes of this example, they are instantiated explicitly:

```javascript
function MyRouter () {
  fw.router.boot(this, { namespace: 'MyRouter' });
}
new MyRouter();
new MyRouter();

function MyOtherRouter () {
  fw.router.boot(this, { namespace: 'MyOtherRouter' });
}
new MyOtherRouter();
```

Next we can use `fw.router.get()` to retrieve them at any time later:

```javascript
// get all instantiated routers grouped by namespace
var allRouters = fw.router.get();

// get reference to all the instantiated MyRouter
var myRouters = fw.router.get('MyRouter');

// get reference to the one instantiated MyOtherRouter
var myOtherRouter = fw.router.get('MyOtherRouter');

// get reference to a list of routers grouped by namespace
var routers = fw.router.get(['MyRouter', 'MyOtherRouter']);
```
