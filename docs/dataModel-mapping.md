A `dataModel` is intended to help you manage data on an endpoint somewhere. To do this, Footwork needs to know where inside your `dataModel` the data actually is, and how that maps to the server side. This is needed so it can properly construct the data for outbound requests as well as map that back to your `dataModel` when it retrieves data.

## Mapping Properties

To map properties in your `dataModel` you use the `.map()` method on an `observable`, passing it the *'path'* and *instance* to map.

```javascript
function Person (personData) {
  // you must boot the dataModel prior to mapping any properties
  var self = fw.dataModel.boot(this, {
    url: '/person'
  });

  self.name = fw.observable(personData.name).map('name', self);
  self.attr = {
    height: fw.observable(personData.height).map('attr.height', self),
    weight: fw.observable(personData.weight).map('attr.weight', self)
  };
}

var batman = new Person({
  name: 'Bruce Wayne',
  attr: {
    height: 6,
    weight: 220
  }
});
```

In the above example you see the `name` property as well as `height` and `weight` under `attr`. You will notice that `height` and `weight` are specified as properties of `attr` via the full *path* (`attr.height`/`attr.weight`). This dot-notation is used to describe or map the data on the backend.

Footwork will use these mappings to translate your `dataModel` to/from the form your backend uses. If fetching data from the server, the mappings will be used to determine what values from the response are written to what observables in your `dataModel`. Conversely, if you are performing an operation that requires the data be sent upstream then Footwork uses the mappings to convert your `dataModel` into its object literal form and then sending that over the wire.

!!! Note
    * Any `observable` property can be mapped. This includes `observable`, `observableArray`, `computed`, and `collection` properties.
    * The *path* of a mapped variable does not necessarily have to match the *actual path* inside of your `dataModel` (although you generally want that to be the case, to avoid confusion/inconsistencies).

## Unmapping Properties

If you need to unmap a property, that is done with `dataModel.$removeMap()`:

```javascript
function Person (personData) {
  // you must boot the dataModel prior to mapping any properties
  var self = fw.dataModel.boot(this, {
    url: '/person'
  });

  self.name = fw.observable(personData.name).map('name', self);
  self.attr = {
    height: fw.observable(personData.height).map('attr.height', self),
    weight: fw.observable(personData.weight).map('attr.weight', self)
  };

  self.noName = function () {
    self.$removeMap('name'); // removes the mapped observable for 'name'
  };
}
```
