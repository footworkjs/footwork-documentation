This example shows two ways to animate transitions:

 * When using the `template/foreach` binding, you can provide `afterAdd` and `beforeRemove` callbacks. These let you intercept the code that actually adds or removes elements, so you can trivially use something like jQuery's `slideUp`/`slideDown()` animation methods or similar. To see this in action, switch between different planet types, or add new planets.
 
 * It's not hard to write a custom Footwork binding that manipulates element states in arbitrary ways according to the value of an observable. Check the HTML source code to see a custom binding called `fadeVisible` that, whenever an observable value changes, uses jQuery's `fadeIn`/`fadeOut` functions to animate the associated DOM element. To see this in action, check and uncheck the "advanced options" checkbox.

```html
<h2>Planets</h2>
<p> 
    <label>
        <input type='checkbox' data-bind='checked: displayAdvancedOptions' />
        Display advanced options
    </label>
</p>

<p data-bind='fadeVisible: displayAdvancedOptions'>
    Show:
    <label><input type='radio' name="type" value='all' data-bind='checked: typeToShow' />All</label>
    <label><input type='radio' name="type" value='rock' data-bind='checked: typeToShow' />Rocky planets</label>
    <label><input type='radio' name="type" value='gasgiant' data-bind='checked: typeToShow' />Gas giants</label>
</p>

<div data-bind='template: { foreach: planetsToShow,
                            beforeRemove: hidePlanetElement,
                            afterAdd: showPlanetElement }'>
    <div data-bind='attr: { "class": "planet " + type }, text: name'> </div>
</div>

<p data-bind='fadeVisible: displayAdvancedOptions'>
    <button data-bind='click: addPlanet.bind($data, "rock")'>Add rocky planet</button>
    <button data-bind='click: addPlanet.bind($data, "gasgiant")'>Add gas giant</button>
</p>
```

```javascript
var PlanetsModel = function() {
  this.planets = fw.observableArray([
    { name: "Mercury", type: "rock"},
    { name: "Venus", type: "rock"},
    { name: "Earth", type: "rock"},
    { name: "Mars", type: "rock"},
    { name: "Jupiter", type: "gasgiant"},
    { name: "Saturn", type: "gasgiant"},
    { name: "Uranus", type: "gasgiant"},
    { name: "Neptune", type: "gasgiant"}
  ]);

  this.typeToShow = fw.observable("all");
  this.displayAdvancedOptions = fw.observable(false);

  this.addPlanet = function(type) {
    this.planets.push({
      name: "New planet",
      type: type
    });
  };

  this.planetsToShow = fw.pureComputed(function() {
    // Represents a filtered list of planets
    // i.e., only those matching the "typeToShow" condition
    var desiredType = this.typeToShow();
    if (desiredType == "all") return this.planets();
    return fw.utils.arrayFilter(this.planets(), function(planet) {
      return planet.type == desiredType;
    });
  }, this);

  // Animation callbacks for the planets list
  this.showPlanetElement = function(elem) { if (elem.nodeType === 1) $(elem).hide().slideDown() }
  this.hidePlanetElement = function(elem) { if (elem.nodeType === 1) $(elem).slideUp(function() { $(elem).remove(); }) }
};

// Here's a custom Footwork binding that makes elements shown/hidden via jQuery's fadeIn()/fadeOut() methods
// Could be stored in a separate utility library
fw.bindingHandlers.fadeVisible = {
  init: function(element, valueAccessor) {
    // Initially set the element to be instantly visible/hidden depending on the value
    var value = valueAccessor();
    $(element).toggle(fw.unwrap(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
  },
  update: function(element, valueAccessor) {
    // Whenever the value subsequently changes, slowly fade the element in or out
    var value = valueAccessor();
    fw.unwrap(value) ? $(element).fadeIn() : $(element).fadeOut();
  }
};

fw.applyBindings(new PlanetsModel());
```
