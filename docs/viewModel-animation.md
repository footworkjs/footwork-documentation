# ViewModel Animation

Simply shoving elements onto the page can create somewhat of a jerky/stuttery experience for the end user. It is often necessary to smoothly transition/animate elements into place.

To use the native animation capabilities built into Footwork you need to first ensure that you are including the animation CSS. For example, if you installed Footwork using [bower](http://bower.io) then you might include it like so:

```html
<head>
  <link href="/bower_components/footwork/dist/footwork.css" rel="stylesheet">
</head>
```

After that, you need to add the animation class to any element you wish to transition into place:

```html
<viewModel module="MyViewModel">
  <div class="fadeIn">This will fade in.</div>
  <div class="flipInX">This will flip in.</div>
</viewModel>
```

You can also animate elements nested within a `viewModel` that was manually bound:

```html
<div class="my-view-model">
  <div class="fadeIn">This will fade in.</div>
  <div class="flipInX">This will flip in.</div>
</div>
```

```javascript
// after applyBindings is called, the contents are animated into place
fw.applyBindings(new MyViewModel(), document.querySelector('.my-view-model'));
```

Thats it. Anytime an instance of the viewModel is rendered to the screen and its contents have resolved it will have the animations activated (if any are specified).

!!! Note
    * Your `viewModel` will not be animated into place until all nested dependencies have resolved. This means it will wait for nested components/viewModels/dataModels/routers to be resolved and bound to the DOM prior to the parent instance being resolved and animated into place.

    * The element you animate **must** be a direct child of the element the parent `viewModel` is bound against.

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

### Sequencing Animations

In some situations you might be rendering many of the same `viewModel` in rapid succession (or all at once). An example of this would be populating a `collection` or `observableArray` which then triggers the instantiation of several `viewModels`.

Consider the following HTML:

```html
<button data-bind="click: showList">Show List</button>

<div class="people" data-bind="foreach: peopleList">
  <viewModel module="Person" params="name: $data">
    <div class="flipInX" data-bind="text: name"></div>
  </viewModel>
</div>
```

In the HTML above you see a *Show List* button at the top, and a `div` below that with a `foreach` bound `peopleList`. Within that `foreach` is a declarative viewModel which will be rendered for each entry (being passed the [context $data](binding-context.md) as the `name` parameter).

Here is the wrapper view model which contains the peopleList and showList handler that populates it:

```javascript
function WrapperViewModel () {
  this.peopleList = fw.observableArray();

  // click handler to populate the peopleList
  this.showList = function () {
    this.peopleList.removeAll();
    this.peopleList([
      'Person 1', 'Person 2', 'Person 3', 'Person 4', 'Person 5',
      'Person 6', 'Person 7', 'Person 8', 'Person 9', 'Person 10'
    ]);
  };
}
```

An instance of the above `WrapperViewModel` will be bound against our HTML and provide the logic needed to populate the `peopleList` list when a button is clicked.

Here is the `person` viewModel that will be rendered `foreach: peopleList`:

```javascript
function Person (params) {
  var self = fw.viewModel.boot(this, {
    namespace: 'person',
    sequence: 70
  });

  self.name = params.name;
}

fw.viewModel.register('Person', Person);
```

A few things to take notice of here:

* A namespace *must be* specified for sequencing to work

    This is because the sequencing is based off of the fact that several instances (all with the same namespace) are being created in rapid succession (within the sequence limit).

* The `sequence` configuration option provided to the viewModel

    This is the option that tells Footwork the minimum amount of time between instances you want when animating each into place.

Once we start the application by creating an instance of the `WrapperViewModel` and binding it to our HTML...

```javascript
fw.applyBindings(new WrapperViewModel());
```

...everything is instantiated and ready to go. Initially the `peopleList` is empty... so the user would prospectively then click the *Show List* button.

The action of the user clicking the *Show List* button triggers the `showList` handler which populates the `peopleList`. When that observableArray is populated it then causes a `person` component to be rendered for each (via the `foreach` binding in the HTML). Since the `viewModel` paired with that component has the `sequence` configuration option specified, that value is used to space apart the animations.

When each instance is rendered (and subsequently its parent is tagged to `animateIn`, ie: it was resolved after the minimum duration provided via `sequence`) the class names on the child element then triggers the animation as defined. Because of the delay specified by `sequence` the net effect is that each one is animated in after the other in a smooth, pleasing fashion.

#### Sequencing Example

A usable example of the above is shown here:

<sequence-demo></sequence-demo>

!!! Note
    * You can use any of the [available animations](#available-animations) listed above.
    * You can also create your own or customize the default animations, for more information see the [footwork-animate project](https://github.com/footworkjs/footwork-animate).
