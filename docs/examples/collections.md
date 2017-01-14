This example shows how to render a collection using the `foreach` binding.

The contents of an element using the `foreach` binding are repeated for each item in the collection and `foreach` bindings can easily be nested. As you can see from this demonstration (enable 'Show render times'), Knockout knows that it only needs to render additional content for items that are added a collection.

```html
<h2>People</h2>
<ul data-bind="foreach: people">
  <li>
    <div>
      <span data-bind="text: name"> </span> has <span data-bind='text: children().length'>&nbsp;</span> children:
      <a href='#' data-bind='click: addChild '>Add child</a>
      <span class='renderTime' data-bind='visible: $root.showRenderTimes'>
        (person rendered at <span data-bind='text: new Date().getSeconds()' > </span>)
      </span>
    </div>
    <ul data-bind="foreach: children">
      <li>
        <span data-bind="text: $data"> </span>
        <span class='renderTime' data-bind='visible: $root.showRenderTimes'>
          (child rendered at <span data-bind='text: new Date().getSeconds()' > </span>)
        </span>
      </li>
    </ul>
  </li>
</ul>
<label><input data-bind='checked: showRenderTimes' type='checkbox' /> Show render times</label> 
```

```javascript
// Define a "Person" class that tracks its own name and children, and has a method to add a new child
var Person = function(name, children) {
  var self = this;

  self.name = name;
  self.children = fw.observableArray(children);

  self.addChild = function() {
    self.children.push("New child");
  };
}

// The view model is an abstract description of the state of the UI, but without any knowledge of the UI technology (HTML)
var viewModel = {
  people: [
    new Person("Annabelle", ["Arnie", "Anders", "Apple"]),
    new Person("Bertie", ["Boutros-Boutros", "Brianna", "Barbie", "Bee-bop"]),
    new Person("Charles", ["Cayenne", "Cleopatra"])
  ],
  showRenderTimes: fw.observable(false)
};

fw.applyBindings(viewModel);
```
