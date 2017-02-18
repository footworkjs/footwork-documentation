Outlets are areas of your application where you can control what is displayed.

You can use these outlets to display different things, such as entire pages (containing their own sub-elements such as viewModels and other components), or just singular displays like a user profile. What you display and how you use them is up to you.

!!! Note "Views / Pages"
    A component *can be* created/registered with just a HTML view/template, it does not need to have a viewModel configured for it.

    ```javascript
    fw.components.register('home-page', {
      template: '<em>This is my home page template.</em>'
    });
    ```

    Using this property of components its possible to create a bare view, such as a *page* (which can then contain its own components/viewModels/outlets/etc). For more information see [registering components](component-registration.md).

## Properties of Outlets

There are several important aspects/properties of outlets that you should be aware of:

* Outlets can load/display any component.

    !!! Tip
        The display component specified here is simply a normal component, so you can [register and load them](component-registration.md) just like any other component.

* An outlet is manipulated/controlled by its parent router, and is addressed via its string name.

* Outlets can be changed at any time, but are often altered from within a route controller (ex: a page change).

* Outlets can be nested deeply inside of components/viewModels/etc.

* You can have as many outlets as you want.

    * Its *name* attribute must be unique.

* Outlets retain their previous view state.

    This means that if you remove an outlet from the DOM and then re-add it (with the same name) it will immediately re-instantiate and display its previous state/component.

    An example of how this might occur would be if you have an outlet nested within an `if` binding:

    ```html
    <div data-bind="if: isLoggedIn">
      <outlet name="user-profile"></outlet>
    </div>
    ```

* You can set the value of an outlet without it being present in the DOM.

    Setting an outlet value before it is rendered in the DOM means that when the outlet is added it will instantiate with the state you have it set to.

    ```javascript
    function AppRouter () {
      var self = fw.router.boot(this, { /* ... */ });

      /**
       * Note that at this point the router is still initializing.
       * Any outlets (and other inner contents) have not been rendered yet.
       */
      self.outlet('main-display', 'default-page');
    }
    ```

    At some point after this router is bound to the DOM, the outlets contained within will be bound and then will ask their router for their state (if one exists). The router will then set their current state (component) to the value you had previously set them to.

* An outlet will display its original content while loading a new component to display.

    You can manipulate/alter this with the [loading option](#loading-string). Absent of that (or if a *falsey* value is provided) an outlet will revert to its original contents when loading a new component.

    ```html
    <outlet name="display">
      <div class="loading">Please wait, content is loading...</div>
    </outlet>
    ```

    !!! Note
        During startup/binding an outlet will *only* display its original contents. The `loading` display option is only inspected when an outlet *change* is made.

## Creating An Outlet

An outlet is created with a declarative `<outlet name=""></outlet>` element placed in your HTML. The *name=""* attribute is used by the router to target that specific outlet, this value must be unique.

```html
<router module="AppRouter">
  <header>
    <nav>
      <a data-bind="route" href="/">Home</a>
      <a data-bind="route" href="/about">About</a>

      <outlet name="user-display"></outlet>
    </nav>
  </header>

  <main>
    <outlet name="main-view"></outlet>
  </main>
</router>
```

!!! Note "Keep it Validated"
    You can alternatively use `data-name` if you want to stick with fully valid HTML.

    ```html
    <outlet data-name="main-view"></outlet>
    ```

## Changing An Outlet

Outlets are *attached* to their parent router. The router instance has an `outlet` method which you can use to alter outlets with at any time later.

If you simply want to change the outlet to a new display then all you need to pass along is the outlet name as well as the name of the component (that it was registered as):

```javascript
var promise = router.outlet('main-view', 'home-page');

promise.then(function (outletElement) {
  console.info('outlet change has completed!');
});
```

The above statement will remove the contents of the `main-view` outlet and swap it to display the `home-page` component.

Also notice that the outlet method returns an [ES6 Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). This promise resolves once:

1. The outlet itself has finished loading.
2. All nested children of the outlet have been resolved and bound.
3. A [minimum transition](#transition-integer) time has transpired (if specified).

The outlet will not resolve the promise or fire its [onComplete](#oncomplete-callback) callback until all of those conditions have been satisfied.

!!! Note "Animations"
    Keep in mind that all of the animation capabilities are usable...so for instance if the `home-page` component is defined with a *fadeIn* animation, then it will fade into place.

    For more info see [component animation](component-animation.md).

### Outlet Options

If you require more than a simple display change then there are several additional options available:

* [display](#display-string) (string)
* [loading](#loading-string) (string)
* [transition](#transition-integer) (integer)
* [params](#params-object) (object)
* [onComplete](#oncomplete-callback) (callback)

You can supply these options using a configuration object as the second parameter:

```javascript
router.outlet('outletName', {
  display: /* see below */,
  loading: /* see below */,
  transition: /* see below */,
  params: /* see below */,
  onComplete: /* see below */
});
```

#### display (string)

When specifying an outlet change with a configuration object this is how you specify what component to display.

For example, take the following outlet change:

```javascript
router.outlet('main-view', {
  display: 'home-page'
});
```

...and then you might have a corresponding component viewModel registered for `home-page` like so:

```javascript
fw.components.register('home-page', {
  template: 'This is my home page!'
});
```

!!! Tip
    Remember that the display specified here is a normal component, so you can [register and load them](component-registration.md) just like any other component.

    You probably should not register them with their HTML inline as shown here.

#### loading (string)

This option tells Footwork to display an alternate component while/if the `display` component is being loaded.

```javascript
router.outlet('main-view', {
  display: 'home-page',
  loading: 'loading-throbber'
});
```

!!! Note
    If you provide a *falsey* value for `loading` (or omit it completely), then the outlet will display its original contents while loading its new component to display. 

#### transition (integer)

Used in conjunction with the `loading` option, this will tell Footwork the minimum amount of time for the outlet transition. This helps prevent UI thrashing and presents an overall smoother experience to the user.

```javascript
router.outlet('main-view', {
  display: 'home-page',
  loading: 'loading-throbber',
  transition: 300 // specified in milliseconds
});
```

#### params (object)

The params value supplied here will be passed to factory method of the view model instantiated for the outlet display.

For example, take the following outlet change which specifies a params value:

```javascript
router.outlet('user-display', {
  display: 'user-profile',
  params: {
    userId: 12345
  }
});
```

...and then you might have a corresponding component viewModel registered for `user-profile` like so:

```javascript
fw.components.register('user-profile', {
  viewModel: function UserProfile (params) {
    var self = fw.viewModel.boot(this, {
      namespace: 'UserProfile'
    });

    /**
    * Note that we are using the supplied params.userId
    * passed in from the call to router.outlet from above.
    */
    self.id = fw.observable(params.userId);
  },
  template: 'User ID <span data-bind="text: id"></span>'
});
```

#### onComplete (callback)

This function will be triggered once the outlet *and all of its children* have been resolved and rendered to screen.

It is passed the containing outlet element as its parameter, and has the router instance given as its context:

```javascript
router.outlet('main-view', {
  display: 'home-page',
  onComplete: function (outletElement) {
    console.info('Home page is done loading!');
  }
});
```

The `onComplete` callback will trigger once all of the following have been satisfied:

1. The outlet itself has finished loading.
2. All nested children of the outlet have been resolved and bound.
3. A [minimum transition](#transition-integer) time has transpired (if specified).

!!! Note "onComplete router outlet config"
    If you also provide an `onComplete` callback as a *global outlet option* on a router config, then it is called *in addition to* any `onComplete` callback you may provide on the outlet itself:

    ```javascript
    function AppRouter () {
      var self = fw.router.boot(this, {
        outlet: {
          onComplete: function (outletElement) {
            console.info('this is called after the outlet finishes');
          }
        }
      });

      self.routes([
        {
          route: '/',
          controller: function () {
            this.outlet('main-view', {
              display: 'home-page',
              onComplete: function (outletElement) {
                console.info('this is ALSO called after the outlet changes');
              }
            });
          }
        }
      ]);
    }
    ```

    For more information see the [router outlet config](router-creation.md#outlet-object) option.

## Common Use

Outlets are generally changed as the result of a route being triggered:

```javascript
function AppRouter () {
  var self = fw.router.boot(this, {
    routes: [
      {
        route: '/',
        controller: function () {
          this.outlet('main-view', 'home-page');
        }
      },
      {
        route: '/news',
        controller: function () {
          this.outlet('main-view', 'news-page');
        }
      }
    ]
  });
}
```

You can change an outlet display at any time but this tends to be a very common use.

## Debugging Outlets

Sometimes you may need to manipulate an outlet more directly. An example of this is if you need to adjust the styling of the `loading` display. In that scenario you will want to *hold open/visible* the loading display component while you debug and manipulate its styles.

At its core, an outlet is a fancy component for switching its display content as specified. It has its own viewModel upon which is stores the component/display info. Footwork provides a way of accessing an outlets viewModel directly from its parent router, and thus control the display explicitly. For example purposes, lets assume we have the following view defined which declares a router with a named outlet called `main-view`:

```html
<router module="AppRouter">
  <outlet name="main-view">
    <span>Loading content...please wait.</span>
  </outlet>
</router>
```

... and the corresponding `AppRouter` we will use with the view above:

```javascript
fw.router.register('AppRouter', function AppRouter () {
  var self = fw.router.boot(this, {
    namespace: 'AppRouter', // we will use this to get its reference later
    routes: [ /* ... */ ]
  });
});
```

We can see that the loading display here will show the user an informative message telling them to wait for it to finish loading. Once the app is loaded, the `loading` display will quickly disappear however. Using the [fw.router.get](router-usage.md#fwrouterget) utility, we can request a reference to the instantiated `router` via its `namespace`:

```javascript
// get reference to AppRouter via its namespace property
var appRouter = fw.router.get('AppRouter');
```

Once we have access to the router instance, we can manipulate the outlet directly. Each outlets viewModel is registered via its name as a key on the `router.outlets` property. So in the example above, we would access the outlet viewModel like so:

```javascript
var mainView = appRouter.outlets['main-view'];
```

Now that we have a reference to the outlet itself, we can manipulate it. So to switch the outlet to its loading display, we simply call the method `mainView.showLoading()`:

```javascript
mainView.showLoading();
```

When this call is made the outlet will switch to whatever the most recent `loading` display was and hold it until the outlet is manipulated again. There are a couple of important methods on an outlet viewModel which you might want to be aware of:

### showLoading

This method will cause the outlet to show its previous/current loading display.

```javascript
outletViewModel.showLoading();
```

### showDisplay

This method will cause the outlet to show its current display.

```javascript
outletViewModel.showDisplay();
```
