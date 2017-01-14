A `viewModel` can be instantiated and bound to the DOM in 3 different ways:

### Explicitly

```HTML
<span data-bind="text: myName"></span>
```

```javascript
function MyViewModel () {
  var self = fw.viewModel.boot(this, {
    namespace: 'MyViewModel'
  });
  self.myName = 'Smith';
}

fw.applyBindings(new MyViewModel());
```

### Using a Declarative Element

```HTML
<viewModel module="MyViewModel">
  <span data-bind="text: myName"></span>
</viewModel>
```

```javascript
function MyViewModel () {
  var self = fw.viewModel.boot(this, {
    namespace: 'MyViewModel'
  });
  self.myName = 'Smith';
}

fw.viewModel.register('MyViewModel', MyViewModel);
fw.start();
```

!!! Note
    * There are a few ways to register your viewModel so that you can use it declaratively, see: [ViewModel Registration](viewModel-registration.md).
    * You can alternatively use `data-module` if you want to stick with fully valid HTML.

        ```html
        <viewModel data-module="MyViewModel">
          <span data-bind="text: myName"></span>
        </viewModel>
        ```

### Using a Component

You can use it as the `viewModel` in a [component](component-basics.md) configuration and then instantiate/bind it like any other component:

```HTML
<my-component></my-component>
```

!!! Note "Component Binding"
    You can of course also use the [component binding](component-binding.md) in addition to a custom element as shown.

```javascript
function MyViewModel () {
  var self = fw.viewModel.boot(this, {
    namespace: 'MyViewModel'
  });
  self.myName = 'Smith';
}

fw.components.register('my-component', {
  viewModel: MyViewModel,
  template: '<span data-bind="text: myName"></span>'
});
fw.start();
```

For more information, see [component basics](component-basics.md) and [component registration](component-registration.md).

!!! Note
    If using a `viewModel` in a component then you do not need to register it separately as a `viewModel`, it is loaded via its component configuration when used in this manner.

## Tools

### fw.viewModel.get()

For debugging purposes you might need to get direct access to one or more of the `viewModel` instances your application has created. If you use a declarative element or component to instantiate your `viewModel` then you aren't explicitly creating them yourself...how do you get access to them?

Footwork provides an easy way to get access to any bootstrapped `viewModel` via the `fw.viewModel.get()` method. There are several ways to call it depending on what you need.

!!! Warning
    You should only use this method for debugging purposes, for anything else you should preferentially use [namespace](namespacing.md)-based communication or [broadcastables / receivables](broadcastable-receivable.md) to synchronize state/data.

    Using this outside of a debugging context risks creating unnecessary coupling and poor cohesion within your application.

For example, lets first instatiate some `viewModels`...these can be instantiated explicitly or declaratively, as long as they are bootstrapped as a `viewModel` then this method can retrieve them. For purposes of this example, they are instantiated explicitly:

```javascript
function MyViewModel () {
  fw.viewModel.boot(this, { namespace: 'MyViewModel' });
}
new MyViewModel();
new MyViewModel();

function MyOtherViewModel () {
  fw.viewModel.boot(this, { namespace: 'MyOtherViewModel' });
}
new MyOtherViewModel();
```

Next we can use `fw.viewModel.get()` to retrieve them at any time later:

```javascript
// get all instantiated viewModels grouped by namespace
var allViewModels = fw.viewModel.get();

// get reference to all the instantiated MyViewModel
var myViewModels = fw.viewModel.get('MyViewModel');

// get reference to the one instantiated MyOtherViewModel
var myOtherViewModel = fw.viewModel.get('MyOtherViewModel');

// get reference to a list of viewModels grouped by namespace
var viewModels = fw.viewModel.get(['MyViewModel', 'MyOtherViewModel']);
```
