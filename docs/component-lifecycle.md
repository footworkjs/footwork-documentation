## Full Lifecycle

When a `component` is injected into your application (either via a `<custom-element>` or component binding):

1. **Component loaders are asked to supply the viewModel factory and template**

    * Multiple component loaders may be consulted, until the first one recognises the component name and supplies a viewModel/template. This process only takes place **once per component type**, since Footwork caches the resulting definitions in memory.

    * The default component loaders supply viewModels/templates based on [what you have registered](component-registration.md). If applicable, this is the phase where it requests any specified AMD modules from your AMD loader.
        * Note that the default loaders map from the tagName directly to their correspondingly registered (or registered location) component name

    * Normally, this is an *asynchronous* process. It may involve requests to the server. For API consistency, Footwork by default ensures that the loading process completes as an asynchronous callback even if the component is already loaded and cached in memory. For more about this, and how to allow synchronous loading, see [Controlling synchronous/asynchronous loading](component-registration.md#controlling-synchronousasynchronous-loading).

1. **The component template is cloned and injected into the container element**

    * Any existing content is removed and discarded.

1. **If the component has a viewModel, it is instantiated**

    * If the viewModel is given as a constructor function, this means Footwork calls `new YourViewModel(params)`.

    * If the viewModel is given as a `createViewModel` factory function, Footwork calls `createViewModel(params, componentInfo)`, where `componentInfo.element` is the element into which the not-yet-bound template has already been injected.

    * This phase always completes synchronously (constructors and factory functions are not allowed to be asynchronous), since it occurs *every time a component is instantiated* and performance would be unacceptable if it involved waiting for network requests.

1. **The viewModel is bound to the view** or, if the component has no viewModel, then the view is bound to any `params` you've supplied to the `component` binding.

    * If the viewModel is booted as a [viewModel](viewModel-creation.md), [dataModel](dataModel-creation.md), or [router](router-creation.md) then it has its `afterRender` callback triggered.

1. **The component is active**

    * Now the component is operating, and can remain on-screen for as long as needed.

    * If any of the parameters passed to the component is observable, then the component can of course observe any changes, or even write back modified values. This is one way it can communicate cleanly with its parent, without tightly coupling the component code to any parent that uses it. For more extensive communcation abilities, [see namespaces](namespacing.md).

    * After all nested elements (components/viewModels/etc) are resolved and if the parent component is paired with a viewModel that has been booted as a [viewModel](viewModel-creation.md), [dataModel](dataModel-creation.md), or [router](router-creation.md) then it has its `afterResolve` callback triggered.

1. **The component is torn down, and the viewModel is disposed**

    * If the `component` binding's `name` value changes observably, or if an enclosing control-flow binding causes the container element to be removed, then any `dispose` function on the viewModel is called just before the container element is removed from the DOM. See also: [disposal and memory management](#disposal-and-memory-management).

    * If the components viewModel was booted as a [viewModel](viewModel-creation.md), [dataModel](dataModel-creation.md), or [router](router-creation.md) then its `onDispose` callback will be triggered.

    * All computeds and subscriptions (anything with a `dispose()` method) attached to the view model will be disposed.

    !!! Note
        If the user navigates to an entirely different web page, browsers do this without asking any code running in the page to clean up. So in this case no `dispose` functions will be invoked.

        This is OK because the browser will automatically release the memory used by all objects that were in use.

## Disposal And Memory Management

The disposal of a component occurs when it is removed from the DOM. A couple of reasons this might occur are:

* The `if` binding containing a component has become `false`
* The display of an [outlet](router-outlets.md) was altered.

Depending on how the components configured viewModel (if any) was instantiated, this might mean some references need to be cleaned up (so memory can be garbage collected).

### Bootstrapped viewModels

When the disposal of the component is triggered and its viewModel was [bootstrapped](architecture.md#bootstrapped) as a [viewModel](viewModel-creation.md), [dataModel](dataModel-creation.md), or [router](router-creation.md):

* Any property defined directly on the instance of the viewModel has its `dispose()` method called (ex: `fw.computed` properties).

    ```javascript
    function MyVm() {
      var self = fw.viewModel.boot(this, { /* ... */ });

      // this is automatically disposed of
      self.myValue = fw.computed(function() {});

      self.things = {
        // this is NOT automatically disposed of (memory leak)
        otherValue: self.myValue.subscribe()
      };
    }
    ```

* You can use the `onDispose` callback configuration to perform any tear down operations:

    ```javascript
    function MyVm() {
      var self = fw.viewModel.boot(this, {
        onDispose: function() {
          // variable disposed of explicitly
          otherValue.dispose();
        }
      });

      // this is automatically disposed of
      self.myValue = fw.computed(function() {});

      // this is NOT automatically disposed of
      var otherValue = self.myValue.subscribe();
    }
    ```

### Non-Bootstrapped viewModels

If the viewModel in question is [not a bootstrapped variant](architecture.md#creating-view-models) then you must explicitly release any resources that aren't inherently garbage-collectable. For example:

* `setInterval` callbacks will continue to fire until explicitly cleared.

  * Use `clearInterval(handle)` to stop them, otherwise your viewModel might be held in memory.

* `fw.computed` properties continue to receive notifications from their dependencies until explicitly disposed.

  * If a dependency is on an external object, then be sure to use `.dispose()` on the computed property, otherwise it (and possibly also your viewModel) will be held in memory. Alternatively, consider using a [*pure* computed](computed-pure.md) to avoid the need for manual disposal.

* **Subscriptions** to observables continue to fire until explicitly disposed.

  * If you have subscribed to an external observable, be sure to use `.dispose()` on the subscription, otherwise the callback (and possibly also your viewModel) will be held in memory.

* Manually-created **event handlers** on external DOM elements, if created inside a `createViewModel` function (or even inside a regular component viewModel, although to fit the MVVM pattern you shouldn't) must be removed.

  * Of course, you don't have to worry about releasing any event handlers created by standard Footwork bindings in your view, as Footwork automatically unregisters them when the elements are removed.

For example:

```javascript
var someExternalObservable = fw.observable(123);

function SomeComponentViewModel() {
  this.myComputed = fw.computed(function() {
    return someExternalObservable() + 1;
  }, this);

  this.myPureComputed = fw.pureComputed(function() {
    return someExternalObservable() + 2;
  }, this);

  this.mySubscription = someExternalObservable.subscribe(function(val) {
    console.log('The external observable changed to ' + val);
  }, this);

  this.myIntervalHandle = window.setInterval(function() {
    console.log('Another second passed, and the component is still alive.');
  }, 1000);
}

SomeComponentViewModel.prototype.dispose = function() {
  this.myComputed.dispose();
  this.mySubscription.dispose();
  window.clearInterval(this.myIntervalHandle);
  // this.myPureComputed doesn't need to be manually disposed.
}

fw.components.register('your-component-name', {
  viewModel: SomeComponentViewModel,
  template: 'some template'
});
```

It isn't strictly necessary to dispose computeds and subscriptions that only depend on properties of the same viewModel object, since this creates only a circular reference which JavaScript garbage collectors know how to release. However, to avoid having to remember which things need disposal, you may prefer to use [pureComputed](computed-pure.md) wherever possible, and explicitly dispose all other computeds/subscriptions whether technically necessary or not.
