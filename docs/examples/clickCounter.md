This example demonstrates creating a view model class and applying various bindings to some HTML markup so that it reflects and edits the state of the view model.

Footwork tracks dependencies. Internally, `hasClickedTooManyTimes` has a subscription on `numberOfClicks`, so when `numberOfClicks` changes, that forces `hasClickedTooManyTimes` to be re-evaluated. Similarly, multiple parts of the UI reference `hasClickedTooManyTimes` and are therefore subscribed to it. Whenever `hasClickedTooManyTimes` changes, this causes the UI to be updated.

You don't have to define or manage these subscriptions manually. They are created and destroyed as needed by the framework. Check the HTML source code to see how simple this is.

```html
<div>You've clicked <span data-bind='text: numberOfClicks'>&nbsp;</span> times</div>

<button data-bind='click: registerClick, disable: hasClickedTooManyTimes'>Click me</button>

<div data-bind='visible: hasClickedTooManyTimes'>
  That's too many clicks! Please stop before you wear out your fingers.
  <button data-bind='click: resetClicks'>Reset clicks</button>
</div>
```

```javascript
var ClickCounterViewModel = function() {
  var self = this;

  self.numberOfClicks = fw.observable(0);

  self.registerClick = function() {
    self.numberOfClicks(self.numberOfClicks() + 1);
  };

  self.resetClicks = function() {
    self.numberOfClicks(0);
  };

  self.hasClickedTooManyTimes = fw.pureComputed(function() {
    return self.numberOfClicks() >= 3;
  });
};

fw.applyBindings(new ClickCounterViewModel());
```
