Whenever you inject a [component](component-basics.md) using the [`component` binding](component-binding.md) or a [custom element](component-custom-elements.md), Footwork fetches that component's template and viewModel using one or more *component loaders*. The job of a component loader is to asynchronously supply a template/viewmodel pair for any given component name.

You might want to implement a custom component loader if you want to use naming conventions, rather than explicit registration, to load components. Or, if you want to use a third-party "loader" library to fetch component viewmodels or templates from external locations.

## Available Functions

A custom component loader is simply an object whose properties are **any combination** of the following functions:

### getConfig

`getConfig(name, callback)`

***Define this if:** you want to supply configurations programmatically based on names, e.g., to implement a naming convention.*

If declared, Footwork will call this function to obtain a configuration object for each component being instantiated.

* To supply a configuration, call `callback(componentConfig)`, where `componentConfig` is any object that can be understood by the `loadComponent` function on your loader or any other loader. The default loader simply supplies whatever object was registered using `fw.components.register`.

    For example, a `componentConfig` like:

    ```javascript
    {
      template: 'someElementId',
      viewModel: { require: 'myModule' }
    }
    ```

    ...can be understood and instantiated by the default loader.

* You are not limited to supplying configuration objects in any standard format. You can supply arbitrary objects as long as your [loadComponent](#loadComponent) function understands them.
* If you do not want your loader to supply a configuration for the named component, then call `callback(null)`. Footwork will then consult any other registered loaders in sequence, until one supplies a non-`null` value.

### loadComponent

`loadComponent(name, componentConfig, callback)`

***Define this if:** you want to take control over how component configurations are interpreted, e.g., if you do not want to use the standard `viewModel`/`template` pair format.*

If declared, Footwork will call this function to convert a `componentConfig` object into a viewmodel/template pair.

* To supply a viewmodel/template pair, call `callback(result)`, where `result` is an object with the following properties:

  * `template` - **Required.** An array of DOM nodes
  * `createViewModel(params, componentInfo)` - **Optional.** A function that will later be called to supply a viewmodel object for each instance of this component

* If you do not want your loader to supply a viewmodel/template pair for the given parameters, then call `callback(null)`. Footwork will then consult any other registered loaders in sequence, until one supplies a non-`null` value.

### loadTemplate

`loadTemplate(name, templateConfig, callback)`

***Define this if:** you want to use custom logic to supply DOM nodes for a given template configuration (e.g., using an ajax request to fetch a template by URL).*

The default component loader will call this function on any registered loaders that declare it, to convert the `template` part of a component configuration into an array of DOM nodes. The nodes are then cached and cloned for each instance of the component.

The `templateConfig` value is simply the `template` property from any `componentConfig` object. For example, it may contain `"some markup"` or `{ element: "someId" }` or a custom format such as `{ loadFromUrl: "someUrl.html" }`.

* To supply an array of DOM nodes, call `callback(domNodeArray)`.

* If you do not want your loader to supply a template for the given parameters (e.g., because it does not recognize the configuration format), call `callback(null)`. Footwork will then consult any other registered loaders in sequence, until one supplies a non-`null` value.

### loadViewModel

`loadViewModel(name, templateConfig, callback)`

***Define this if:** you want to use custom logic to supply a viewmodel factory for a given viewmodel configuration (e.g., integrating with a third-party module loader or dependency injection system).*

The default component loader will call this function on any registered loaders that declare it, to convert the `viewModel` part of a component configuration into a `createViewModel` factory function. The function is then cached and called for each new instance of the component that needs a viewmodel.

The `viewModelConfig` value is simply the `viewModel` property from any `componentConfig` object. For example, it may be a constructor function, or a custom format such as `{ myViewModelType: 'Something', options: {} }`.

* To supply a `createViewModel` function, call `callback(yourCreateViewModelFunction)`. The `createViewModel` function must accept parameters `(params, componentInfo)` and must synchronously return a new viewmodel instance each time it is called.

* If you do not want your loader to supply a `createViewModel` function for the given parameters (e.g., because it does not recognize the configuration format), call `callback(null)`. Footwork will then consult any other registered loaders in sequence, until one supplies a non-`null` value.


## Registering custom component loaders

Footwork allows you to use multiple component loaders simultaneously. This is useful so that, for example, you can plug in loaders that implement different mechanisms (e.g., one might fetch templates from a backend server according to a naming convention; another might set up viewmodels using a dependency injection system) and have them work together.

So, `fw.components.loaders` is an array containing all the loaders currently enabled. By default, this array contains just one item: `fw.components.defaultLoader`. To add additional loaders, simply insert them into the `fw.components.loaders` array.

## Controlling precedence

If you want your custom loader to take precedence over the default loader (so it gets the first opportunity to supply configuration/values), then add it to the *beginning* of the array. If you want the default loader to take precedence (so your custom loader is only called for components not explicitly registered), then add it to the *end* of the array.

Example:

```javascript
// Adds myLowPriorityLoader to the end of the loaders array.
// It runs after other loaders, only if none of them returned a value.
fw.components.loaders.push(myLowPriorityLoader);

// Adds myHighPriorityLoader to the beginning of the loaders array.
// It runs before other loaders, getting the first chance to return values.
fw.components.loaders.unshift(myHighPriorityLoader)
```

If required, you can remove `fw.components.defaultLoader` from the loaders array altogether.

## Sequence of calls

The first time Footwork needs to construct a component with a given name, it:

* Calls each of the registered loaders' `getConfig` functions in turn, until the first one supplies a non-null `componentConfig`.
* Then, with this `componentConfig` object, calls each of the registered loaders' `loadComponent` functions in turn, until the first one supplies a non-null `template`/`createViewModel` pair.

When the default loader's `loadComponent` runs, it simultaneously:

 * Calls each of the registered loaders' `loadTemplate` functions in turn, until the first one supplies a non-null DOM array.
   * The default loader itself has a `loadTemplate` function that resolves a range of template configuration formats into DOM arrays.

 * Calls each of the registered loaders' `loadViewModel` functions in turn, until the first one supplies a non-null `createViewModel` function.
   * The default loader itself has a `loadViewModel` function that resolves a range of viewmodel configuration formats into `createViewModel` functions.

Custom loaders can plug into any part of this process, so you can take control over supplying configurations, interpreting configurations, supplying DOM nodes, or supplying viewmodel factory functions. By putting custom loaders into a chosen order inside `fw.components.loaders`, you can control the priority order of different loading strategies.

## Examples

### A component loader that sets up naming conventions

To implement a naming convention, your custom component loader only needs to implement `getConfig`. For example:

```javascript
var namingConventionLoader = {
  getConfig: function(name, callback) {
    // 1. Viewmodels are classes corresponding to the component name.
    //    e.g., my-component maps to MyApp.MyComponentViewModel
    // 2. Templates are in elements whose ID is the component name
    //    plus '-template'.
    var viewModelConfig = MyApp[toPascalCase(name) + 'ViewModel'],
        templateConfig = { element: name + '-template' };

    callback({ viewModel: viewModelConfig, template: templateConfig });
  }
};

function toPascalCase(dasherized) {
  return dasherized.replace(/(^|-)([a-z])/g, function (g, m1, m2) { return m2.toUpperCase(); });
}

// Register it. Make it take priority over the default loader.
fw.components.loaders.unshift(namingConventionLoader);
```

Now this is registered, you can reference components with any name (without preregistering them), e.g.:

```html
<div data-bind="component: 'my-component'"></div>

<!-- Declare template -->
<template id='my-component-template'>Hello World!</template>

<script>
  // Declare viewmodel
  window.MyApp = window.MyApp || {};
  MyApp.MyComponentViewModel = function(params) {
    // ...
  }
</script>
```


### A component loader that loads external files using custom code

If your custom loader implements `loadTemplate` and/or `loadViewModel`, then you can plug in custom code to the loading process. You can also use these functions to interpret custom configuration formats.

For example, you might want to enable configuration formats like the following:

```javascript
fw.components.register('my-component', {
  template: { fromUrl: 'file.html', maxCacheAge: 1234 },
  viewModel: { viaLoader: '/path/myvm.js' }
});
```

... and you can do so using custom loaders.

The following custom loader will take care of loading templates configured with a `fromUrl` value:

```javascript
var templateFromUrlLoader = {
  loadTemplate: function(name, templateConfig, callback) {
    if (templateConfig.fromUrl) {
      // Uses jQuery's ajax facility to load the markup from a file
      var fullUrl = '/templates/' + templateConfig.fromUrl + '?cacheAge=' + templateConfig.maxCacheAge;
      $.get(fullUrl, function(markupString) {
        // We need an array of DOM nodes, not a string.
        // We can use the default loader to convert to the
        // required format.
        fw.components.defaultLoader.loadTemplate(name, markupString, callback);
      });
    } else {
      // Unrecognized config format. Let another loader handle it.
      callback(null);
    }
  }
};

// Register it
fw.components.loaders.unshift(templateFromUrlLoader);
```

... and the following custom loader will take care of loading viewmodels configured with a `viaLoader` value:

```javascript
var viewModelCustomLoader = {
  loadViewModel: function(name, viewModelConfig, callback) {
    if (viewModelConfig.viaLoader) {
      // You could use arbitrary logic, e.g., a third-party
      // code loader, to asynchronously supply the constructor.
      // For this example, just use a hard-coded constructor function.
      var viewModelConstructor = function(params) {
        this.prop1 = 123;
      };

      // We need a createViewModel function, not a plain constructor.
      // We can use the default loader to convert to the
      // required format.
      fw.components.defaultLoader.loadViewModel(name, viewModelConstructor, callback);
    } else {
      // Unrecognized config format. Let another loader handle it.
      callback(null);
    }
  }
};

// Register it
fw.components.loaders.unshift(viewModelCustomLoader);
```

If you prefer, you could combine `templateFromUrlLoader` and `viewModelCustomLoader` into a single loader by putting the `loadTemplate` and `loadViewModel` functions on a single object. However it's quite nice to separate out these concerns, since their implementations are quite independent.

!!! Notes
    * Custom component loaders and custom elements

        If you are using a component loader to fetch components by a naming convention, and are *not* registering your components using `fw.components.register` or `fw.components.registerLocation`, then those components will not automatically be usable as custom elements (because you haven't told Footwork that they even exist).

        See: [How to enable custom elements with names that don't correspond to explicitly registered components](component-custom-elements.html#registering-custom-elements)

    * Integrating with browserify

        [Browserify](http://browserify.org/) is a popular library for referencing JavaScript libraries with a Node-style synchronous `require` syntax. It's often considered as an alternative to an AMD loader such as require.js. However Browserify solves a rather different problem: synchronous build-time reference resolution, rather than asynchronous runtime reference resolution as handled by AMD.

        Since Browserify is a build-time tool, it doesn't really need any special integration with Footwork components, and there's no need to implement any kind of custom component loader to work with it. You can simply use Browserify's `require` statements to grab instances of your component viewmodels, then explicitly register them, e.g.:

        ```javascript
        // Note that the following *only* works with Browserify - not with require.js,
        // since it relies on require() returning synchronously.

        fw.components.register('my-browserify-component', {
          viewModel: require('myViewModel'),
          template: require('fs').readFileSync(__dirname + '/my-template.html', 'utf8')
        });
        ```


        This uses the [brfs Browserify plugin](https://github.com/substack/brfs) to automatically inline the .html file, so you would need to build the script file using a command similar to:

        ```bash
        npm install brfs
        browserify -t brfs main.js > bundle.js
        ```
