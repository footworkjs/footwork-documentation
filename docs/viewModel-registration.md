# ViewModel Registration

In order to use a `viewModel` declaratively Footwork needs to know where to locate it. There are two standard ways to register your `viewModel` so that Footwork can find it when needed:

## Explicit Registration

Explicitly register (and cache) a `viewModel` for later use.

The benefit of using `fw.viewModel.register()` is that the `viewModel` is cached in memory from the beginning so the user will not need to download it later.

This method can be called in several different ways:

* **Registering a class function**

    ```javascript
    fw.viewModel.register('MyViewModel', function MyViewModel () {
      var self = fw.viewModel.boot(this, {
        namespace: 'MyViewModel'
      });
      self.myName = 'Smith';
    });
    ```

* **Registering a shared object instance**

    ```javascript
    fw.viewModel.register('MyViewModel', {
      instance: {
        myName: 'Smith';
      }
    });
    ```

* **Registering a createViewModel factory**

    By utilizing a `createViewModel` factory you can introduce custom logic to create a `viewModel` each time a new one is requested:

    ```javascript
    fw.viewModel.register('MyViewModel', {
      createViewModel: function (params, info) {
        // info.element === container/parent element
        return new MyViewModel();
      }
    });
    ```

## Location Registration

Using `fw.viewModel.registerLocation()` you can tell Footwork where it can download your `viewModel` when it is needed. The advantage of this is that Footwork will not download the module until it is needed (and then it caches the result)...this saves on load time and resources from an end users perspective.

To download your module, Footwork will use AMD/RequireJS...see [module format](#module-format) for more information on how to structure your files/modules.

This method can be called in several different ways:

* **With an explicit path to your viewModel**

    ```javascript
    fw.viewModel.registerLocation('MyViewModel', '/path/to/MyViewModel.js');
    ```

* **Have the module name added at the end for you**

    ```javascript
    // Note the trailing slash, that tells Footwork to add the module name at the end
    fw.viewModel.registerLocation('MyViewModel', '/path/to/'); // loads /path/to/MyViewModel.js
    ```

* **You can use a regExp to match and provide a path**

    ```javascript
    // load all *-tool from /tools/
    fw.viewModel.registerLocation(/.*-tools/, '/tools/');

    // ex: 'shop-tools' would be loaded from /tools/shop-tools.js
    ```

* **You can define several at once**

    ```javascript
    // register the location of several viewModels at once (ie: all in the same folder)
    fw.viewModel.registerLocation(['Body', 'Navigation', 'Footer'], '/pageAreas/');
    ```

## Module Format

The loader included with Footwork uses AMD/RequreJS to load your modules. So you should specify your modules like so:

```javascript
define(["footwork"],
  function (fw) {
    return function MyViewModel () {
      var self = fw.viewModel.boot(this, {
        namespace: 'MyViewModel'
      });
      self.myName = fw.observable('Smith');
    };
  }
);
```

!!! Note
    Your AMD module can return the same types of configurations that [`fw.viewModel.register()`](#explicit-registration) supports.
