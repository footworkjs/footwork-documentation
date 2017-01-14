# Router Animation

## Animating Outlet Transitions

Outlets are often the basis for various *pages* a user will (for example) navigate to when writing a single-page Footwork application. Animating these transitions from one state (component) to another is an often necessary requirement to avoid UI thrashing.

There is an option for outlet changes that allows you to specify a *loading* component to display during the time that this transition occurs. Using this option combined with the built in [component animation capabilities](component-animation.md) it is possible to create a transition between outlet changes.

An example of how you might accomplish this:

1. Make sure to have the animation css loaded in the head:

    ```html
    <link rel="stylesheet" href="/bower_components/footwork/dist/footwork.css">
    ```

1. Register the component that we want to use as the *loading* display.

    To do this, we call `fw.components.register` and specify it as *synchronous*:

    ```javascript
    fw.components.register('loading-display', {
      template: '<div class="fadeIn">Loading, please wait...</div>',
      synchronous: true
    });
    ```

    There are a few things to notice here:

    * We have the `fadeIn` css animation specified on our loading display, this will cause it to fade in anytime it is rendered to the screen.

        You can use any of the [available component animations](component-animation.md#available-animations).

    * We specifically use `fw.component.register` rather than `fw.components.registerLocation`

        We don't want Footwork to have to download the *loading display* before it can display it for the main display component it presumably loading as well...that doesn't make much sense. The *loading display* needs to be ready at the moment it is needed, so we register it directly.

        You **can** register a location for it...but just be aware that the initial display will have to wait for it to download first (it will have to be downloaded like any other component with its location registered). See: [Registering Components](component-registration.md).

    * The component was registered as synchronous, this ensures Footwork knows it does not need to delay when rendering the loading display.

    * There is no viewModel specified...a viewModel is optional and we only need the display content shown so we leave it out here (although, you can specify one if you wish).

1. Specify the `loading` configuration for an outlet.

    Once the component we want to use as the *loading display* has been registered, we need to somehow instruct the outlet to use it. There are two ways of doing this.

    * Router Outlet Configuration

        The most common and easiest method is to pre-configure the outlet in the [router outlet configuration](router-creation.md#outlet-object) by specifying something like so:

        ```javascript
        fw.router.boot(this, {
          routes: [ /* ... */ ],
          outlet: {
            loading: 'loading-display',
            transition: 400
          }
        });
        ```

        The good thing about this is that the outlet options only need to be specified once. Each outlet change will then inherit these default options.

    * Explicit Outlet Change

        The other option is to specify what loading component to display at the time of the outlet change. This is specified within the [outlet change options](router-outlets.md#outlet-options)

        ```javascript
        router.outlet('main-display', {
          display: 'home-page',
          loading: 'loading-display',
          transition: 400
        });
        ```

        !!! Note
            Options provided explicitly to the outlet will override ones specified in the router configuration.

    The `transition` option tells Footwork to ensure that there is (at least) a minimum of 400msec during the outlet transition. This helps prevent UI thrashing and presents the user with a much more pleasant experience.

## Animating Routers

Simply shoving elements onto the page can create somewhat of a jerky/stuttery experience for the end user. It is often necessary to smoothly transition/animate elements into place.

To use the native animation capabilities built into Footwork you need to first ensure that you are including the animation CSS. For example, if you installed Footwork using [bower](http://bower.io) then you might include it like so:

```html
<head>
  <link href="/bower_components/footwork/dist/footwork.css" rel="stylesheet">
</head>
```

After that, you need to add the animation class to any element you wish to transition into place:

```html
<router module="MyRouter">
  <div class="fadeIn">This will fade in.</div>
  <div class="flipInX">This will flip in.</div>
</router>
```

You can also animate elements nested within a `router` that was manually bound:

```html
<div class="my-router">
  <div class="fadeIn">This will fade in.</div>
  <div class="flipInX">This will flip in.</div>
</div>
```

```javascript
// after applyBindings is called, the contents are animated into place
fw.applyBindings(new MyRouter(), document.querySelector('.my-router'));
```

!!! Note
    * Your `router` will not be animated into place until all nested dependencies have resolved. This means it will wait for nested components/routers/dataModels/routers to be resolved and bound to the DOM prior to the parent instance being resolved and animated into place.

    * The element you animate **must** be a direct child of the element the parent `router` is bound against.

    * To disable the animations entirely, set `fw.animationClass.animateIn` to `false`

### Available Animations

Animations available in the included `footwork.css`:

<animation-demo></animation-demo>

  * fadeIn
  * fadeInDown
  * fadeInDownBig
  * fadeInLeft
  * fadeInLeftBig
  * fadeInRight
  * fadeInRightBig
  * fadeInUp
  * fadeInUpBig
  * flipInX
  * flipInY
  * lightSpeedIn
  * rotateIn
  * rotateInDownLeft
  * rotateInDownRight
  * rotateInUpLeft
  * rotateInUpRight
  * rollIn
  * zoomIn
  * zoomInDown
  * zoomInLeft
  * zoomInRight
  * zoomInUp
  * slideInDown
  * slideInLeft
  * slideInRight
  * slideInUp

!!! Note
    For detailed information on how the animation works, or if you want to make a custom animation or build of animations - see the [footwork-animate project](https://github.com/footworkjs/footwork-animate).
