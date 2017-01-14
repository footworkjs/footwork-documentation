**Components** are a powerful, clean way of organizing your UI code into self-contained, reusable chunks. They:

 * ...can represent individual controls/widgets, or entire sections of your application.
 * ...contain their own view, and usually (but optionally) their own view model.
 * ...can either be preloaded, or loaded asynchronously (on demand) via AMD or other module systems.
 * ...can receive parameters, and optionally write back changes to them or invoke callbacks.
 * ...can be composed together (nested) or inherited from other components.
 * ...can easily be packaged for reuse across projects.
 * ...let you define your own conventions/logic for configuration and loading.
 * ...can be animated into place via the native animation transitions.

This pattern is beneficial for large applications, because it **simplifies development** through clear organization and encapsulation, and helps to **improve runtime performance** by incrementally loading your application code and templates as needed.

**Custom elements** are an optional but convenient syntax for consuming components. Instead of needing placeholder `<div>`s into which components are injected with bindings, you can use more self-descriptive markup with custom element names (e.g., `<voting-button>` or `<product-editor>`).

## Component Anatomy

A component consists of a template (and optionally a view model):

```javascript
fw.components.register('like-widget', {
  viewModel: function (params) { /* ... */ }, // optional
  template: '<div>The view template.</div>' // required
});
```

The view model portion of a component can be *any type of view model*. This includes the [bootstrapped](architecture.md#bootstrapped) variants ([viewModel](viewModel-creation.md)/[dataModel](dataModel-creation.md)/[router](router-creation.md)).

## Examples

### Like/Dislike Widget

To get started, you can register a component using `fw.components.register` (technically, registration is optional, but it's the easiest way to get started). A component definition specifies a `viewModel` and `template`. For example:

```javascript
fw.components.register('like-widget', {
  viewModel: function (params) {
    // Data: value is either null, 'like', or 'dislike'
    this.chosenValue = params.value;

    // Behaviors
    this.like = function () { this.chosenValue('like'); }.bind(this);
    this.dislike = function () { this.chosenValue('dislike'); }.bind(this);
  },
  template:
    '<div class="like-or-dislike" data-bind="visible: !chosenValue()">\
       <button data-bind="click: like">Like it</button>\
       <button data-bind="click: dislike">Dislike it</button>\
     </div>\
     <div class="result" data-bind="visible: chosenValue">\
       You <strong data-bind="text: chosenValue"></strong> it\
     </div>'
});
```

**Normally, you'd load the view model and template from external files** instead of declaring them inline like this. We'll get to that later.

Now, to use this component, you can reference it from any other view in your application, either using the [`component` binding](component-binding.md) or using a [custom element](component-custom-elements.md). Here's a live example that uses it as a custom element:


```html
<ul data-bind="foreach: products">
  <li class="product">
    <strong data-bind="text: name"></strong>
    <like-widget params="value: userRating"></like-widget>
  </li>
</ul>
```

```javascript
function Product (name, rating) {
  this.name = name;
  this.userRating = fw.observable(rating || null);
}

function MyViewModel () {
  this.products = [
    new Product('Garlic bread'),
    new Product('Pain au chocolat'),
    new Product('Seagull spaghetti', 'like') // This one was already 'liked'
  ];
}

fw.applyBindings(new MyViewModel());
```

In this example, the component both displays and edits an observable property called `userRating` on the `Product` view model class.

## Learn more

For more more detailed information, see:

 * [Defining and registering components](component-registration.md)
 * [Using Custom Elements](component-custom-elements.md)
 * [The component binding](component-binding.md)
 * [Custom Component Loaders](component-loaders.md)
