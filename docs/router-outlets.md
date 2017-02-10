Outlets are areas of your application where you can control what is displayed from its parent router by instructing it to display a component.

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
        The display component specified here is simply a normal component, and so you can [register and load them](component-registration.md) just like any other component.

* An outlet is manipulated/controlled by its parent router.

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
router.outlet('main-view', 'home-page');
```

The above statement will remove the contents of the `main-view` outlet and swap it to display the `home-page` component.

!!! Note "Animations"
    Keep in mind that all of the animation capabilities are usable...so for instance if the `home-page` component is defined with a *fadeIn* animation, then it will fade into place.

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
    Remember that the display specified here is a normal component, and so you can [register and load them](component-registration.md) just like any other component.

    You probably should not register them with their HTML inline as shown here.

#### loading (string)

This option tells Footwork to display an alternate component while/if the `display` component is being loaded.

```javascript
router.outlet('main-view', {
  display: 'home-page',
  loading: 'loading-throbber'
});
```

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
