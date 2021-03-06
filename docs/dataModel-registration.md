# DataModel Registration

In order to use a `dataModel` declaratively Footwork needs to know where to locate it. There are two standard ways to register your `dataModel` so that Footwork can find it when needed:

## Explicit Registration

Explicitly register (and cache) a `dataModel` for later use.

The benefit of using `fw.dataModel.register()` is that the `dataModel` is cached in memory from the beginning so the user will not need to download it later.

This method can be called in several different ways:

* **Registering a class function**

    ```javascript
    fw.dataModel.register('MyDataModel', function MyDataModel () {
      var self = fw.dataModel.boot(this, {
        namespace: 'MyDataModel'
      });
      self.myName = fw.observable('Smith').map('myName', self);
    });
    ```

* **Registering a shared instance**

    ```javascript
    function MyDataModel () {
      var self = fw.dataModel.boot(this, {
        namespace: 'MyDataModel'
      });
      self.myName = fw.observable('Smith').map('myName', self);
    }

    fw.router.register('MyDataModel', {
      instance: new MyDataModel()
    });
    ```

* **Registering a createDataModel factory**

    By utilizing a `createDataModel` factory you can introduce custom logic to create a `dataModel` each time a new one is requested:

    ```javascript
    function MyDataModel () {
      var self = fw.dataModel.boot(this, {
        namespace: 'MyDataModel'
      });
      self.myName = fw.observable('Smith').map('myName', self);
    }
    
    fw.dataModel.register('MyDataModel', {
      createDataModel: function (params, info) {
        // info.element === container/parent element
        return new MyDataModel();
      }
    });
    ```

## Location Registration

Using `fw.dataModel.registerLocation()` you can tell Footwork where it can download your `dataModel` when it is needed. The advantage of this is that Footwork will not download the module until it is needed (and then it caches the result)...this saves on load time and resources from an end users perspective.

To download your module, Footwork will use AMD/RequireJS...see [module format](#module-format) for more information on how to structure your files/modules.

This method can be called in several different ways:

* **With an explicit path to your dataModel**

    ```javascript
    fw.dataModel.registerLocation('MyDataModel', '/path/to/MyDataModel.js');
    ```

* **Have the module name added at the end for you**

    ```javascript
    // Note the trailing slash, that tells Footwork to add the module name at the end
    fw.dataModel.registerLocation('MyDataModel', '/path/to/'); // loads /path/to/MyDataModel.js
    ```

* **You can use a regExp to match and provide a path**

    ```javascript
    // load all *-tool from /tools/
    fw.dataModel.registerLocation(/.*-tools/, '/tools/');

    // ex: 'shop-tools' would be loaded from /tools/shop-tools.js
    ```

* **You can define several at once**

    ```javascript
    // register the location of several dataModels at once (ie: all in the same folder)
    fw.dataModel.registerLocation(['Body', 'Navigation', 'Footer'], '/pageAreas/');
    ```

## Module Format

The loader included with Footwork uses AMD/RequreJS to load your modules. So you should specify your modules like so:

```javascript
define(["footwork"],
  function (fw) {
    return function MyDataModel () {
      var self = fw.dataModel.boot(this, {
        namespace: 'MyDataModel'
      });
      self.myName = fw.observable('Smith');
    };
  }
);
```

!!! Note
    Your AMD module can return the same types of configurations that [`fw.dataModel.register()`](#explicit-registration) supports.
