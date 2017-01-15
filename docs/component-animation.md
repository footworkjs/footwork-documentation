Components have exactly the same animation capabilities as do [viewModels](viewModel-animation.md), [dataModels](dataModel-animation.md), and [routers](router-animation.md#animating-routers). You animate their contents by placing animation classes on their direct-descendent children.

## The Basics

To use the native animation capabilities built into Footwork you need to first ensure that you are including the animation CSS. For example, if you installed Footwork using [bower](http://bower.io) then you might include it like so:

```html
<head>
  <link href="/bower_components/footwork/dist/footwork.css" rel="stylesheet">
</head>
```

After that, you need to add the animation class to any (direct-child) element you wish to transition into place within the components template:

```javascript
fw.components.register('animated-component', {
  template: '<div class="fadeIn">This will fade in.</div>'
});
```

Then you can declaratively insert it into your view and when it is rendered it will be animated into place:

```html
<animated-component></animated-component>
```

Thats it. Anytime an instance of the component is rendered to the screen and its contents have resolved it will have the animations activated (if any are specified).

!!! Note
    * Your component will not be animated into place until all nested dependencies have resolved. This means it will wait for nested components/viewModels/dataModels/routers to be resolved and bound to the DOM prior to the parent instance being resolved and animated into place.

    * The element you animate **must** be a direct child of the parent component.

    * To disable the animations entirely, set `fw.animationClass.animateIn` to `false`

## Available Animations

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
