# Router Registration

In order to use a `router` declaratively Footwork needs to know where to locate it. There are two standard ways to register your `router` so that Footwork can find it when needed:

## Explicit Registration

Explicitly register (and cache) a `router` for later use.

The benefit of using `fw.router.register()` is that the `router` is cached in memory from the beginning so the user will not need to download it later.

This method can be called in several different ways:

* **Registering a class function**

    ```javascript
    fw.router.register('MyRouter', function MyRouter () {
      var self = fw.router.boot(this, {
        namespace: 'MyRouter',
        routes: [ /* ... */ ]
      });
    });
    ```

* **Registering a shared instance**

    ```javascript
    function MyRouter () {
      var self = fw.router.boot(this, {
        namespace: 'MyRouter',
        routes: [ /* ... */ ]
      });
    }

    fw.router.register('MyRouter', {
      instance: new MyRouter()
    });
    ```

* **Registering a createRouter factory**

    By utilizing a `createRouter` factory you can introduce custom logic to create a `router` each time a new one is requested:

    ```javascript
    function MyRouter () {
      var self = fw.router.boot(this, {
        namespace: 'MyRouter',
        routes: [ /* ... */ ]
      });
    }

    fw.router.register('MyRouter', {
      createRouter: function (params, info) {
        // info.element === container/parent element
        return new MyRouter();
      }
    });
    ```

## Location Registration

Using `fw.router.registerLocation()` you can tell Footwork where it can download your `router` when it is needed. The advantage of this is that Footwork will not download the module until it is needed (and then it caches the result)...this saves on load time and resources from an end users perspective.

To download your module, Footwork will use AMD/RequireJS...see [module format](#module-format) for more information on how to structure your files/modules.

This method can be called in several different ways:

* **With an explicit path to your router**

    ```javascript
    fw.router.registerLocation('MyRouter', '/path/to/MyRouter.js');
    ```

* **Have the module name added at the end for you**

    ```javascript
    // Note the trailing slash, that tells Footwork to add the module name at the end
    fw.router.registerLocation('MyRouter', '/path/to/'); // loads /path/to/MyRouter.js
    ```

* **You can use a regExp to match and provide a path**

    ```javascript
    // load all *-tool from /tools/
    fw.router.registerLocation(/.*-tools/, '/tools/');

    // ex: 'shop-tools' would be loaded from /tools/shop-tools.js
    ```

* **You can define several at once**

    ```javascript
    // register the location of several routers at once (ie: all in the same folder)
    fw.router.registerLocation(['Body', 'Navigation', 'Footer'], '/pageAreas/');
    ```

## Module Format

The loader included with Footwork uses AMD/RequreJS to load your modules. So you should specify your modules like so:

```javascript
define(["footwork"],
  function (fw) {
    return function MyRouter () {
      var self = fw.router.boot(this, {
        namespace: 'MyRouter',
        routes: [ /* ... */ ]
      });
    };
  }
);
```

!!! Note
    Your AMD module can return the same types of configurations that [`fw.router.register()`](#explicit-registration) supports.
