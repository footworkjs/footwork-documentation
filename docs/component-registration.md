# Registering Components

For Footwork to be able to load and instantiate your components, you must register them one of two ways:

* [Register A Location](#register-a-location)

    Providing the location of your component assets. Footwork will then use this to download and instantiate your component via AMD/RequireJS when it is needed.

* [Register A Configuration](#register-a-configuration)

    Providing a configuration which Footwork uses to load and instantiate the component.

!!! note
    As an (advanced) alternative, it is possible to implement a [custom component loader](component-loaders.md) that fetches components by your own conventions instead of the ones provided by Footwork natively here.

## Register a Location

Footwork provides `fw.components.registerLocation()` to register components you want resolved via AMD/RequireJS. Using AMD to load your component asynchronously (and on demand) is beneficial as your application can wait until the user needs your component to download it (thus saving bandwidth/resources/load-time).

Using `fw.components.registerLocation()` also has additional capabilities such as:

* Being able to specify many components location at once.

* Automatically appending the file name based on the components name to the path.

* Using a regular expression to match against component names.

* **Many others...see examples below...**

!!! Tip
    If you need something on screen as fast as possible then you will want to [register it directly](#register-a-configuration). Registering a location is for assets which are beneficially lazy-loaded.

### File Name Automatically Appended

Register component under 'sprocket' using individual paths for the viewModel and template files. The file name will be appended using the name of the component + .ext:

```javascript
fw.components.registerLocation('sprocket', {
  viewModel: 'components/bikeParts/', // components/bikeParts/sprocket.js
  template: 'components/bikeParts/' // components/bikeParts/sprocket.html
});
```

### Explicit File Name

You can specify the full file name (ie: such as when the component file names do not (or cannot) match what you want to use in the markup):

```javascript
fw.components.registerLocation('sprocket', {
  viewModel: 'components/bikeParts/TheSprocket.js', // components/bikeParts/TheSprocket.js
  template: 'components/bikeParts/theSprocket.html' // components/bikeParts/theSprocket.html
});
```

### Automatic Name Concatenation

Load component assets from inner folder using a single string:

```javascript
// load viewModel from components/sprocket/sprocket.js and template from components/sprocket/sprocket.html
fw.components.registerLocation('sprocket', 'components/sprocket/');
```

### Specify Multiple Components

You can also specify the path to many components at once (Footwork will append the appropriate file name/etc):

```javascript
fw.components.registerLocation(['sprocket', 'wheel'], {
  viewModel: 'components/bikeParts/', // components/bikeParts/component-name.js
  template: 'components/bikeParts/' // components/bikeParts/component-name.html
});
```

### Automatic Sub-Folder Concatenation

You can tell Footwork to prepend with a folder name when loading the component:

```javascript
fw.components.registerLocation('sprocket', {
  viewModel: 'components/', // components/sprocket/sprocket.js
  template: 'components/' // components/sprocket/sprocket.html
}, true); // tell Footwork to load the component from an inner folder of the same name as the component
```

In the preceding example you can see that it not only loaded from the `components` folder but also appended a 'folder' using the component name and then also added on the final file names for each individual asset. This is convenient if you choose to keep your components assets (html/js/css/etc) encapsulated within their own folders (*strongly recommended*).

Also remember that since all of these options can be mixed, you can use an `Array` to specify multiple components at once and each will have their correct folder and file name appended:

```javascript
fw.components.registerLocation(['sprocket', 'wheel'], {
  viewModel: 'components/', // components/<component-name>/<component-name>.js
  template: 'components/' // components/<component-name>/<component-name>.html
}, true); // tell Footwork to load the component from an inner folder of the same name as the component
```

...and then with an even shorter syntax, using only a string to specify the parent folder for all assets:

```javascript
/**
 * This tells Footwork to load the components as follows:
 * viewModel: components/<component-name>/<component-name>.js
 * template: components/<component-name>/<component-name>.html
 */
fw.components.registerLocation(['sprocket', 'wheel'], 'components/', true);
```

### Regular Expressions

It is also possible to use a regular expression to match against the component name:

```javascript
fw.components.registerLocation(/^numbered-component[0-9]+$/, 'components/numbered-components/');
```

As an example, the above would load a component named `numbered-component101` from:

 * *viewModel*: `components/numbered-components/numbered-component101.js`
 * *template*: `components/numbered-components/numbered-component101.html`

Of course, you can also tell it to append the folder name as well:

```javascript
fw.components.registerLocation(/^numbered-component[0-9]+$/, 'components/', true);
```

The above will append the component name as a 'folder' and then append the file name after that...just [as it is shown here too](#automatically-adding-the-sub-folder-name).

!!! note "Remember"
    Remember that all of these options can be mixed together. The previous just being example usage of the various available options.

### Checking For A Registered Location

Sometimes you may want to check if a particular location is registered, to do that you would use `fw.components.locationIsRegistered`:

```javascript
fw.components.registerLocation('my-component', /* ... */);

fw.components.locationIsRegistered('my-component') === true

fw.components.locationIsRegistered('some-unknown-component') === false
```

## Register a Configuration

You can also provide your own loading configuration. This configuration can specify your components assets in a more direct manner, providing more options.

You can register a component with a configuration as follows:

```javascript
fw.components.register('some-component-name', {
  viewModel: /* viewModel config, see 'Specifying A viewModel' below */,
  template: /* template config, see 'Specifying A Template' below */
});
```

* The component **name** can be any nonempty string. It's recommended, but not mandatory, to use lowercase dash-separated strings (such as `your-component-name`) so that the component name is valid to use as a [custom element](component-custom-elements.md) (such as `<your-component-name>`).

* `viewModel` is optional, and can take any of [the viewModel formats described below](#specifying-a-viewmodel).

* `template` is required, and can take any of [the template formats described below](#specifying-a-template).

If no viewmodel is given, the component is treated as a simple block of HTML that will be bound to any parameters passed to the component.

### Specifying A viewModel

Any valid [viewModel](architecture.md#creating-view-models) can be configured with/for a component, including the three [bootstrapped variants](architecture.md#bootstrapped-view-models):

Example:

```javascript
function MyComponent (params) {
  fw.viewModel.boot(this, {
    namespace: 'my-component'
  });
}

fw.components.register('my-component', {
  viewModel: MyComponent,
  template: // ...
});
```

The following are several example ways of specifying a viewModel.

#### Constructor Function

You can specify a constructor function as your viewModel, such as:

```javascript
function SomeComponentViewModel(params) {
  // 'params' is an object whose key/value pairs are the parameters
  // passed from the component binding or custom element.
  this.someProperty = params.something;
}

SomeComponentViewModel.prototype.doSomething = function() { ... };

fw.components.register('my-component', {
  viewModel: SomeComponentViewModel,
  template: // ...
});
```

Footwork will invoke your constructor once for each instance of the component, producing a separate viewmodel object for each. Properties on the resulting object or its prototype chain (e.g., `someProperty` and `doSomething` in the example above) are available for binding in the component's view.

#### Shared Object Instance

If you want all instances of your component to share the same viewmodel object instance (which is not usually desirable):

```javascript
var sharedViewModelInstance = { ... };

fw.components.register('my-component', {
  viewModel: { instance: sharedViewModelInstance },
  template: // ...
});
```

Note that it's necessary to specify `viewModel: { instance: object }`, and not just `viewModel: object`. This differentiates from the other cases below.

#### createViewModel factory function

If you want to run any setup logic on the associated element before it is bound to the viewmodel, or use arbitrary logic to decide which viewmodel to instantiate:

```javascript
fw.components.register('my-component', {
  viewModel: {
    createViewModel: function(params, componentInfo) {
      // - 'params' is an object whose key/value pairs are the parameters
      //   passed from the component binding or custom element
      // - 'componentInfo.element' is the element the component is being
      //   injected into. When createViewModel is called, the template has
      //   already been injected into this element, but isn't yet bound.
      // - 'componentInfo.templateNodes' is an array containing any DOM
      //   nodes that have been supplied to the component. See below.

      // Return the desired view model instance, e.g.:
      return new MyViewModel(params);
    }
  },
  template: // ...
});
```

Note that, typically, it's best to perform direct DOM manipulation only through [custom bindings](custom-bindings.md) rather than acting on `componentInfo.element` from inside `createViewModel`. This leads to more modular, reusable code.

The `componentInfo.templateNodes` array is useful if you want to build a component that accepts arbitrary markup to influence its output (for example, a grid, list, dialog, or tab set that injects supplied markup into itself). For a complete example, see [passing markup into components](component-custom-elements.md#passing-markup-into-components).

#### An AMD Module Whose Value Describes A View Model

!!! note
    Remember that you likely should use [fw.components.registerLocation()](#register-a-location) if you simply want to load your assets via AMD/RequireJS.

    The following describes a more direct way of configuring Footwork to retreive your view model via AMD/RequireJS.

If you have an AMD loader (such as [require.js](http://requirejs.org/)) already in your page, then you can use it to fetch a view model. For more details about how this works, see [how AMD loading works](#how-amd-loading-works) below. Example:

```javascript
fw.components.register('my-component', {
  viewModel: { require: 'some/module/name' },
  template: // ...
});
```

The returned AMD module object can be in any of the forms allowed for viewmodels. So, it can be a constructor function, e.g.:

```javascript
// AMD module whose value is a component viewmodel constructor
define(['footwork'], function(fw) {
  function MyViewModel() {
    // ...
  }

  return MyViewModel;
});
```

... or a shared object instance, e.g.:

```javascript
// AMD module whose value is a shared component viewmodel instance
define(['footwork'], function(fw) {
  function MyViewModel() {
    // ...
  }

  return { instance: new MyViewModel() };
});
```

... or a `createViewModel` function, e.g.:

```javascript
// AMD module whose value is a 'createViewModel' function
define(['footwork'], function(fw) {
  function myViewModelFactory(params, componentInfo) {
    // return something
  }

  return { createViewModel: myViewModelFactory };
});
```

... or even, though it's unlikely you'd want to do this, a reference to a different AMD module, e.g.:

```javascript
// AMD module whose value is a reference to a different AMD module,
// which in turn can be in any of these formats
define(['footwork'], function(fw) {
  return { module: 'some/other/module' };
});
```

### Specifying A Template

Templates can be specified in any of the following forms. The most commonly useful are [existing element IDs](#an-existing-element-id) and [AMD modules](#an-amd-module-whose-value-describes-a-template).

#### An Existing Element ID

For example, the following element:

```html
<template id='my-component-template'>
  <h1 data-bind='text: title'></h1>
  <button data-bind='click: doSomething'>Click me right now</button>
</template>
```

... can be used as the template for a component by specifying its ID:

```javascript
fw.components.register('my-component', {
  template: { element: 'my-component-template' },
  viewModel: // ...
});
```

Note that only the nodes *inside* the specified element will be cloned into each instance of the component. The container element (in this example, the `<template>` element), will *not* be treated as part of the component template.

You're not limited to using `<template>` elements, but these are convenient (on browsers that support them) since they don't get rendered on their own. Any other element type works too.

#### An Existing Element Instance

If you have a reference to a DOM element in your code, you can use it as a container for template markup:

```javascript
var elemInstance = document.getElementById('my-component-template');

fw.components.register('my-component', {
  template: { element: elemInstance },
  viewModel: // ...
});
```

Again, only the nodes *inside* the specified element will be cloned for use as the component's template.

#### A String Of Markup

```javascript
fw.components.register('my-component', {
  template: '<h1 data-bind="text: title"></h1>\
             <button data-bind="click: doSomething">Clickety</button>',
  viewModel: // ...
});
```

This is mainly useful when you're fetching the markup from somewhere programmatically (e.g., [AMD - see below](#a-recommended-amd-module-pattern)), or as a build system output that packages components for distribution, since it's not very convenient to manually edit HTML as a JavaScript string literal.

#### An Array Of DOM Nodes

If you're building configurations programmatically and you have an array of DOM nodes, you can use them as a component template:

```javascript
var myNodes = [
  document.getElementById('first-node'),
  document.getElementById('second-node'),
  document.getElementById('third-node')
];

fw.components.register('my-component', {
  template: myNodes,
  viewModel: // ...
});
```

In this case, all the specified nodes (and their descendants) will be cloned and concatenated into each copy of the component that gets instantiated.

#### A Document Fragment

If you're building configurations programmatically and you have a `DocumentFragment` object, you can use it as a component template:

```javascript
fw.components.register('my-component', {
  template: someDocumentFragmentInstance,
  viewModel: // ...
});
```

Since document fragments can have multiple top-level nodes, the *entire* document fragment (not just descendants of top-level nodes) is treated as the component template.

#### An AMD Module Whose Value Describes A Template

If you have an AMD loader (such as [require.js](http://requirejs.org/)) already in your page, then you can use it to fetch a template. For more details about how this works, see [how Footwork loads components via AMD](#how-footwork-loads-components-via-amd) below.

!!! note
    You likely should use [fw.components.registerLocation()](#register-a-location) if you simply want to load your assets via AMD/RequireJS.

    The following describes a more direct way of configuring Footwork to retreive your template via AMD/RequireJS.

Example:

```javascript
fw.components.register('my-component', {
  template: { require: 'some/template' },
  viewModel: // ...
});
```

The returned AMD module object can be in any of the forms allowed for viewmodels. So, it can be a string of markup, e.g. fetched using [require.js's text plugin](http://requirejs.org/docs/api.html#text):

```javascript
fw.components.register('my-component', {
  template: { require: 'text!path/my-html-file.html' },
  viewModel: // ...
});
```

... or any of the other forms described here, though it would be unusual for the others to be useful when fetching templates via AMD.

#### Registering As A Single Module

For even better encapsulation, you can package a component into a single self-describing AMD module. Then you can reference a component as simply as:

```javascript
  fw.components.register('my-component', { require: 'some/module' });
```

Notice that no viewmodel/template pair is specified. The AMD module itself can provide a viewmodel/template pair, using any of the definition formats listed above. For example, the file `some/module.js` could be declared as:

```javascript
// AMD module 'some/module.js' encapsulating the configuration for a component
define(['footwork'], function(fw) {
  function MyComponentViewModel(params) {
    this.personName = fw.observable(params.name);
  }

  return {
    viewModel: MyComponentViewModel,
    template: 'The name is <strong data-bind="text: personName"></strong>'
  };
});
```

### A Recommended AMD Module Pattern For Single Modules

What tends to be most useful in practice is creating AMD modules that have inline viewmodel classes, and explicitly take AMD dependencies on external template files.

For example, if the following is in a file at `path/my-component.js`,

```javascript
// Recommended AMD module pattern for a Footwork component that:
//  - Can be referenced with just a single 'require' declaration
//  - Can be included in a bundle using the r.js optimizer
define(['footwork', 'text!./my-component.html'], function(fw, htmlString) {
  function MyComponentViewModel(params) {
    // Set up properties, etc.
  }

  // Use prototype to declare any public methods
  MyComponentViewModel.prototype.doSomething = function() { ... };

  // Return component definition
  return { viewModel: MyComponentViewModel, template: htmlString };
});
```

... and the template markup is in the file `path/my-component.html`, then you have these benefits:

 * Applications can reference this trivially, i.e., `fw.components.register('my-component', { require: 'path/my-component' });`
 * You only need two files for the component - a viewmodel (`path/my-component.js`) and a template (`path/my-component.html`) - which is a very natural arrangement during development.
 * Since the dependency on the template is explicitly stated in the `define` call, this automatically works with the [`r.js` optimizer](http://requirejs.org/docs/optimization.html) or similar bundling tools. The entire component - viewmodel plus template - can therefore trivially be included in a bundle file during a build step.

#### Specifying Additional Component Options

As well as (or instead of) `template` and `viewModel`, your component configuration object can have arbitrary other properties. This configuration object is made available to any [custom component loader](component-loaders.md) you may be using.

#### Checking For A Registered Component

Sometimes you may want to check if a particular location is registered, to do that you would use `fw.components.isRegistered`:

```javascript
fw.components.register('my-component', /* ... */);

fw.components.isRegistered('my-component') === true

fw.components.isRegistered('some-unknown-component') === false
```

## How AMD Loading Works

When you load a viewmodel or template via `fw.components.registerLocation`:

```javascript
fw.components.registerLocation('my-component', 'components/my-component/');
```

Or with `require` declarations in a configuration, e.g.:

```javascript
fw.components.register('my-component', {
  viewModel: { require: 'components/my-component/my-component' },
  template: { require: 'text!components/my-component/my-component.html' }
});
```

...all Footwork does is call `require(['components/my-component/my-component'], callback)` and `require(['text!components/my-component/my-component.html'], callback)`, and uses the asynchronously-returned objects as the viewmodel and template definitions. So,

 * **This does not take a strict dependency on [require.js](http://requirejs.org/)** or any other particular module loader. *Any* module loader that provides an AMD-style `require` API will do. If you want to integrate with a module loader whose API is different, you can implement a [custom component loader](component-loaders.md).
 * **Footwork does not interpret the module name** in any way - it merely passes it through to `require()`. So of course Footwork does not know or care about where your module files are loaded from. That's up to your AMD loader and how you've configured it.
 * **Footwork doesn't know or care whether your AMD modules are anonymous or not**. Typically we find it's most convenient for components to be defined as anonymous modules, but that concern is entirely separate from Footwork.

### AMD modules are loaded only on demand

Footwork does not call `require([moduleName], ...)` until your component is being instantiated. This is how components get loaded on demand, not up front.

For example, if your component is inside some other element with an [`if` binding](if-binding.md) (or another control flow binding), then it will not cause the AMD module to be loaded until the `if` condition is true. Of course, if the AMD module was already loaded (e.g., in a preloaded bundle) then the `require` call will not trigger any additional HTTP requests, so you can control what is preloaded and what is loaded on demand.
