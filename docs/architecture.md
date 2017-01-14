# MVVM and View Models

As a general architecture choice, Footwork follows *Model-View-View Model (MVVM)*. MVVM is a design pattern for building user interfaces. It describes how you can keep a potentially sophisticated UI simple by splitting it into three parts:

**Model**

Your application's stored data. This data represents objects and operations in your business domain (e.g., bank accounts that can perform money transfers) and is independent of any UI. When using Footwork, you will usually make Ajax calls to some server-side code to read and write this stored model data.

**View Model**

A pure-code representation of the data and operations on a UI. For example, if you're implementing a list editor, your view model would be an object holding a list of items, and exposing methods to add and remove items.

A view model is not the UI itself: it doesn't have any concept of buttons or display styles. It's not the persisted data model either - it holds the unsaved data the user is working with. When using Footwork, your view models are pure JavaScript objects that hold no knowledge of HTML. Keeping the view model abstract in this way lets it stay simple, so you can manage more sophisticated behaviors without getting lost.

**View**

A visible, interactive UI representing the state of the view model. It displays information from the view model, sends commands to the view model (e.g., when the user clicks buttons), and updates whenever the state of the view model changes.

With Footwork, your view is essentially your HTML document with declarative bindings used to link it to the view model. There are several ways to create a view, such as using templates or components.

### Creating View Models

View models are simply objects with properties. It's the properties and logic contained within that you are binding against when using [declarative bindings](binding-syntax.md) in your markup (view/template).

Below are three methods for view model creation:

* [Object Literal](#object-literal)
* [Class Constructor](#class-constructor)
* [Bootstrapped](#bootstrapped)

!!! Note "This list is incomplete"
    Remember that a view model is simply an object with properties, and so you can create a view model in any way you would create an object...and in javascript there are many.

    The following discusses three methods common to Footwork applications.

#### Object Literal

Since a view model is just an object at its most basic level, you can simply define an object literal with some properties:

```javascript
var myViewModel = {
  personName: 'Bond',
  personAge: 35
};
```

#### Class Constructor

In practice, it is common to use a class constructor function to create view models as well:

```javascript
function MyViewModel () {
  this.personName = fw.observable('Bond');
  this.personAge = fw.observable(35);
}

// create a new instance of MyViewModel
var myViewModel = new MyViewModel();
```

#### Bootstrapped

Footwork also provides the capability of *bootstrapping* your view model with additional features. Bootstrapped view models have for example (among many other things) full lifecycle events, whereas non-bootstrapped variants do not.

In practice they are instantiated just like a [Class Constructor](#class-constructor) view model except they are additionally bootstrapped with a configuration:

```javascript
function MyViewModel () {
  var self = fw.viewModel.boot(this, {
    namespace: 'MyViewModel'
  });

  self.personName = fw.observable('Bond');
  self.personAge = fw.observable(35);
}

// create a new instance of MyViewModel
var myViewModel = new MyViewModel();
```

To learn more see the [Bootstrapped View Models](#bootstrapped-view-models) section below.

### Creating Views

A view is your HTML markup, including any declarative bindings/etc.

The following example shows how you can create a very simple *view* to bind to either of the view model examples above. It uses the [text binding](text-binding.md) to display the `personName` value:

```html
The name is <span data-bind="text: personName"></span>
```

## Bootstrapped View Models

As shown above you can create a view model in many ways, but at the end of the day it is simply an object with properties.

Things like lifecycle events as well as other features are provided by the additional *native* Footwork view model types. There are 3 additional *types* of view model that you can bootstrap with Footwork that give your view model extra abilities.

### [viewModel](viewModel-creation.md)

The most basic type of viewModel, this provides the core lifecycle events, namespacing, binding, etc capabilities.

* Container for logic that binds against the DOM.
* Receives lifecycle events.
* Is the base for the other types.

### [dataModel](dataModel-creation.md)

Provides ajax/persistent storage capability.

* Container for logic that binds against the DOM.
* Can save/retrieve data to/from a server.

### [router](router-creation.md)

Allows you to control various display areas and manage application state.

* Used to manage the state of an application.
* Hooks into the browser history API to preserve back/forward.
* Controls the display of any nested outlet.
* Can also contain logic that binds against the DOM.

!!! Summary
    It is important to realize that all types of view model can be interchanged and used in place of one another. At the end of the day, they are all objects with properties. You simply choose/construct the types you need based on your applications requirements.

    This means that with each type you can:

      * Bind UI elements to their properties (like any other view model)
      * Register/Configure/Use a [component](component-basics.md#component-anatomy) with them.
      * Manually/Explicitly bind them with `fw.applyBindings()`.
      * Handle lifecycle events.

## Components

At its core a [component](component-basics.md) is a view model composed with a template/view. You can create a [component](component-basics.md) whos view model is a [viewModel](viewModel-creation.md), [dataModel](dataModel-creation.md), [router](router-creation.md), or whatever other javascript object/view model you want to use.

The advantage of pairing a component with one of the built-in view model types is that you get all of the features that come along with them. This includes things like lifecycle events, or (for example) in the case of a dataModel - the ability to manage its data on a RESTful endpoint.

Components are unique in that they also allow you to declaratively instantiate them using a custom tag. This can make your code semantic and more easily read:

```html
<header>
  <user-display></user-display>
</header>

<todo-list></todo-list>
```

For more information, see [component overview](component-basics.md).

## Observables

[Observables](observables.md) are special javascript objects that can notify subscribers about changes, and depending on what type - can automatically detect dependencies and re-evaluate when they are updated.

Observables are typically used (amongst other ways) to bind against in your UI so that changes propogate between your UI and the view model. When a user changes a form value the corresponding observable has its value changed and anyone listening to it (or using it as part of a computed observable) is notified of the new value. Also, if the value is changed in your view model then that value will automagically propogate back to your UI/view.

There are several types of observable values in Footwork:

* [Observables](observables.md)

    Normal observable values.

* [Computed Observables](computedObservables.md)

    Observables that have dependencies on other observables.

* [Observable Arrays](observableArrays.md)

    Observables that manage arrays of information.

* [Broadcastables and Receivables](broadcastable-receivable.md)

    Observables that can share information/state with each other via namespaces.

* [Collections](collection-creation.md)

    ObservableArrays + searching and fetching from a remote resource.

## Namespacing

In Footwork, a [namespace](namespacing.md) can primarily be thought of as the mechanism by which different parts of your application can use to communicate or share state with.

```javascript
var myNamespace = fw.namespace('MyNamespace');
var alsoMyNamespace = fw.namespace('MyNamespace');

myNamespace.subscribe('ping', function() {
  console.log('pong');
});

alsoMyNamespace.publish('ping');
```

!!! Note
    [Namespacing](namespacing.md) is also integrated into [viewModels](viewModel-creation.md#namespace-string), [dataModels](dataModel-creation.md#namespace-string), and [routers](router-creation.md#namespace-string). In addition to communication, it is also used for animation sequencing.

## Broadcastables / Receivables

A [broadcastable and receivable](broadcastable-receivable.md) allow you to (in a loosely coupled manner) share data and state between two different areas of your application (using [namespaces](namespacing.md)), keeping them in sync as they are altered.

These allow you to keep your modules cleanly separate yet cohesively working together.

```javascript
var myName = fw.observable('Jonathan').broadcast('myName', 'Person');
var yourName = fw.observable().receive('myName', 'Person');

// yourName() === 'Jonathan'
myName('David');
// yourName() === 'David'
```

!!! Tip
    Use [broadcastables and receivables](broadcastable-receivable.md) to share state between your [viewModel](viewModel-creation.md), [dataModel](dataModel-creation.md), and [router](router-creation.md) instances easily.

    ```javascript
    function Her () {
      var self = fw.viewModel.boot(this, {
        namespace: 'Her'
      });

      self.hisName = fw.observable().receive('myName', 'Him');
      self.myName = fw.observable('Jill').broadcast('myName', self);
    }
    ```

    ```javascript
    function Him () {
      var self = fw.viewModel.boot(this, {
        namespace: 'Him'
      });

      self.herName = fw.observable().receive('myName', 'Her');
      self.myName = fw.observable('Jack').broadcast('myName', self);
    }
    ```
