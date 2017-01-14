A `dataModel` can be instantiated and bound to the DOM in 3 different ways:

### Explicitly

```HTML
<span data-bind="text: myName"></span>
```

```javascript
function MyDataModel () {
  var self = fw.dataModel.boot(this, {
    namespace: 'MyDataModel'
  });
  self.myName = 'Smith';
}

fw.applyBindings(new MyDataModel());
```

### Using a Declarative Element

```HTML
<dataModel module="MyDataModel">
  <span data-bind="text: myName"></span>
</dataModel>
```

```javascript
function MyDataModel () {
  var self = fw.dataModel.boot(this, {
    namespace: 'MyDataModel'
  });
  self.myName = 'Smith';
}

fw.dataModel.register('MyDataModel', MyDataModel);
fw.start();
```

!!! Note
    * There are a few ways to register your dataModel so that you can use it declaratively, see: [DataModel Registration](dataModel-registration.md).
    * You can alternatively use `data-module` if you want to stick with fully valid HTML.

        ```html
        <dataModel data-module="MyDataModel">
          <span data-bind="text: myName"></span>
        </dataModel>
        ```

### Using a Component

Since a dataModel is actually a view model (but with extra features) you can use it as the `viewModel` in a [component](component-basics.md) configuration and then instantiate/bind it like any other component:

```HTML
<my-component></my-component>
```

!!! Note "Component Binding"
    You can of course also use the [component binding](component-binding.md) in addition to a custom element as shown.

```javascript
function MyDataModel () {
  var self = fw.dataModel.boot(this, {
    namespace: 'MyDataModel'
  });
  self.myName = 'Smith';
}

fw.components.register('my-component', {
  dataModel: MyDataModel,
  template: '<span data-bind="text: myName"></span>'
});
fw.start();
```

For more information, see [component basics](component-basics.md) and [component registration](component-registration.md).

!!! Note
    If using a `dataModel` in a component then you do not need to register it separately as a `dataModel`, it is loaded via its component configuration when used in this manner.

## Tools

### fw.dataModel.get()

For debugging purposes you might need to get direct access to one or more of the `dataModel` instances your application has created. If you use a declarative element or component to instantiate your `dataModel` then you aren't explicitly creating them yourself...how do you get access to them?

Footwork provides an easy way to get access to any bootstrapped `dataModel` via the `fw.dataModel.get()` method. There are several ways to call it depending on what you need.

!!! Warning
    You should only use this method for debugging purposes, for anything else you should preferentially use [namespace](namespacing.md)-based communication or [broadcastables / receivables](broadcastable-receivable.md) to synchronize state/data.

    Using this outside of a debugging context risks creating unnecessary coupling and poor cohesion within your application.

For example, lets first instatiate some `dataModels`...these can be instantiated explicitly or declaratively, as long as they are bootstrapped as a `dataModel` then this method can retrieve them. For purposes of this example, they are instantiated explicitly:

```javascript
function MyDataModel () {
  fw.dataModel.boot(this, { namespace: 'MyDataModel' });
}
new MyDataModel();
new MyDataModel();

function MyOtherDataModel () {
  fw.dataModel.boot(this, { namespace: 'MyOtherDataModel' });
}
new MyOtherDataModel();
```

Next we can use `fw.dataModel.get()` to retrieve them at any time later:

```javascript
// get all instantiated dataModels grouped by namespace
var allDataModels = fw.dataModel.get();

// get reference to all the instantiated MyDataModel
var myDataModels = fw.dataModel.get('MyDataModel');

// get reference to the one instantiated MyOtherDataModel
var myOtherDataModel = fw.dataModel.get('MyOtherDataModel');

// get reference to a list of dataModels grouped by namespace
var dataModels = fw.dataModel.get(['MyDataModel', 'MyOtherDataModel']);
```
