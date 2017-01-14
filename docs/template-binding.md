## The template Binding

The `template` binding populates the associated DOM element with the results of rendering a template. Templates are a simple and convenient way to build sophisticated UI structures - possibly with repeating or nested blocks - as a function of your view model data.

There are two main ways of using templates:

* *Native templating* is the mechanism that underpins `foreach`, `if`, `with`, and other control flow bindings. Internally, those control flow bindings capture the HTML markup contained in your element, and use it as a template to render against an arbitrary data item. This feature is built into Footwork and doesn't require any external library.
* *String-based templating* is a way to connect Footwork to a third-party template engine. Footwork will pass your model values to the external template engine and inject the resulting markup string into your document. See below for examples that use the *jquery.tmpl* and *Underscore* template engines.

## Parameters

* Main parameter

    * Shorthand syntax: If you just supply a string value, Footwork will interpret this as the ID of a template to render. The data it supplies to the template will be your current model object.

    * For more control, pass a JavaScript object with some combination of the following properties:

        * `name`

            the ID of an element that contains the template you wish to render - see [Example 5](#dynamically-choosing-which-template-is-used) for how to vary this programmatically.

        * `nodes`

            directly pass an array of DOM nodes to use as a template. This should be a non-observable array and note that the elements will be removed from their current parent if they have one. This option is ignored if you have also passed a nonempty value for `name`.

        * `data`

            an object to supply as the data for the template to render. If you omit this parameter, Footwork will look for a `foreach` parameter, or will fall back on using your current model object.

        * `if`

            if this parameter is provided, the template will only be rendered if the specified expression evaluates to `true` (or a `true`-ish value). This can be useful for preventing a null observable from being bound against a template before it is populated.

        * `foreach`

            instructs Footwork to render the template in "foreach" mode - see [Example 2](#using-the-foreach-option-with-a-named-template) for details.

        * `as`

            when used in conjunction with `foreach`, defines an alias for each item being rendered - see [Example 3](#using-as-to-give-an-alias-to-foreach-items) for details.

        * `afterRender`, `afterAdd`, or `beforeRemove`

            callback functions to be invoked against the rendered DOM elements - see [Example 4](#using-afterrender-afteradd-and-beforeremove)

* Additional parameters

    * None

## Examples

### Rendering a named template

Normally, when you're using control flow bindings (`foreach`, `with`, `if`, etc.), there's no need to give names to your templates: they are defined implicitly
and anonymously by the markup inside your DOM element. But if you want to, you can factor out templates into a separate element and then reference them by name:

```html
<h2>Participants</h2>
Here are the participants:
<div data-bind="template: { name: 'person-template', data: buyer }"></div>
<div data-bind="template: { name: 'person-template', data: seller }"></div>

<script type="text/html" id="person-template">
  <h3 data-bind="text: name"></h3>
  <p>Credits: <span data-bind="text: credits"></span></p>
</script>

<script type="text/javascript">
  function MyViewModel() {
    this.buyer = { name: 'Franklin', credits: 250 };
    this.seller = { name: 'Mario', credits: 5800 };
  }
  fw.applyBindings(new MyViewModel());
</script>
```

In this example, the `person-template` markup is used twice: once for `buyer`, and once for `seller`. Notice that the template markup is wrapped in a `<script type="text/html">` ---
the dummy `type` attribute is necessary to ensure that the markup is not executed as JavaScript, and Footwork does not attempt to apply
bindings to that markup except when it is being used as a template.

It's not very often that you'll need to use named templates, but on occasion it can help to minimise duplication of markup.

### Using the "foreach" option with a named template

If you want the equivalent of a `foreach` binding, but using a named template, you can do so in the natural way:

```html
<h2>Participants</h2>
Here are the participants:
<div data-bind="template: { name: 'person-template', foreach: people }"></div>

<script type="text/html" id="person-template">
  <h3 data-bind="text: name"></h3>
  <p>Credits: <span data-bind="text: credits"></span></p>
</script>
```

```javascript
function MyViewModel() {
  this.people = [
    { name: 'Franklin', credits: 250 },
    { name: 'Mario', credits: 5800 }
  ]
}

fw.applyBindings(new MyViewModel());
```

This gives the same result as embedding an anonymous template directly inside the element to which you use `foreach`, i.e.:

```html
<div data-bind="foreach: people">
  <h3 data-bind="text: name"></h3>
  <p>Credits: <span data-bind="text: credits"></span></p>
</div>
```

### Using "as" to give an alias to "foreach" items

When nesting `foreach` templates, it's often useful to refer to items at higher levels in the hierarchy. One way to do this is to refer to `$parent` or other [binding context](binding-context.md) variables in your bindings.

A simpler and more elegant option, however, is to use `as` to declare a name for your iteration variables. For example:

```html
<ul data-bind="template: { name: 'employeeTemplate',
                                  foreach: employees,
                                  as: 'employee' }"></ul>
```

Notice the string value `'employee'` associated with `as`. Now anywhere inside this `foreach` loop, bindings in your child templates will be able to refer to `employee` to access the employee object being rendered.

This is mainly useful if you have multiple levels of nested `foreach` blocks, because it gives you an unambiguous way to refer to any named item declared at a higher level in the hierarchy. Here's a complete example, showing how `season` can be referenced while rendering a `month`:

```html
<ul data-bind="template: { name: 'seasonTemplate', foreach: seasons, as: 'season' }"></ul>

<script type="text/html" id="seasonTemplate">
  <li>
    <strong data-bind="text: name"></strong>
    <ul data-bind="template: { name: 'monthTemplate', foreach: months, as: 'month' }"></ul>
  </li>
</script>

<script type="text/html" id="monthTemplate">
  <li>
    <span data-bind="text: month"></span>
    is in
    <span data-bind="text: season.name"></span>
  </li>
</script>

<script>
  var viewModel = {
    seasons: fw.observableArray([
      { name: 'Spring', months: [ 'March', 'April', 'May' ] },
      { name: 'Summer', months: [ 'June', 'July', 'August' ] },
      { name: 'Autumn', months: [ 'September', 'October', 'November' ] },
      { name: 'Winter', months: [ 'December', 'January', 'February' ] }
    ])
  };

  fw.applyBindings(viewModel);
</script>
```

Tip: Remember to pass a *string literal value* to as (e.g., `as: 'season'`, *not* `as: season`), because you are giving a name for a new variable, not reading the value of a variable that already exists.

### Using "afterRender", "afterAdd", and "beforeRemove"

Sometimes you might want to run custom post-processing logic on the DOM elements generated by your templates. For example, if you're using a JavaScript widgets library such as jQuery UI, you might want to intercept your templates' output so that you can run jQuery UI commands on it to transform some of the rendered elements into date pickers, sliders, or anything else.

Generally, the best way to perform such post-processing on DOM elements is to write a [custom binding](custom-bindings.md), but if you really just want to access the raw DOM elements emitted by a template, you can use `afterRender`.

Pass a function reference (either a function literal, or give the name of a function on your view model), and Footwork will invoke it immediately after rendering or re-rendering your template. If you're using `foreach`, Footwork will invoke your `afterRender` callback for each item added to your observable array. For example,

```html
<div data-bind='template: { name: "personTemplate",
                            data: myData,
                            afterRender: myPostProcessingLogic }'> </div>
```

... and define a corresponding function on your view model (i.e., the object that contains `myData`):

```javascript
viewModel.myPostProcessingLogic = function (elements) {
  // "elements" is an array of DOM nodes just rendered by the template
  // You can add custom post-processing logic here
}
```

If you are using `foreach` and only want to be notified about elements that are specifically being added or are being removed, you can use `afterAdd` and `beforeRemove` instead. For details, see documentation for the [`foreach` binding](foreach-binding.md).

### Dynamically choosing which template is used

If you have multiple named templates, you can pass an observable for the `name` option. As the observable's value is updated, the element's contents will be re-rendered using the appropriate template. Alternatively, you can pass a callback function to determine which template to use. If you are using the `foreach` template mode, Footwork will evaluate the function for each item in your array, passing that item's value as the only argument. Otherwise, the function will be given the `data` option's value or fall back to providing your whole current model object.

For example,

```html
<ul data-bind='template: { name: displayMode,
                          foreach: employees }'> </ul>

<script>
  var viewModel = {
    employees: fw.observableArray([
      { name: "Kari", active: fw.observable(true) },
      { name: "Brynn", active: fw.observable(false) },
      { name: "Nora", active: fw.observable(false) }
    ]),
    displayMode: function(employee) {
      // Initially "Kari" uses the "active" template, while the others use "inactive"
      return employee.active() ? "active" : "inactive";
    }
  };

  // ... then later ...
  viewModel.employees()[1].active(true); // Now "Brynn" is also rendered using the "active" template.
</script>
```

If your function references observable values, then the binding will update whenever any of those values change.  This will cause the data to be re-rendered using the appropriate template.

If your function accepts a second parameter, then it will receive the entire [binding context](binding-context.md). You can then access `$parent` or any other [binding context](binding-context.md) variable when dynamically choosing a template. For example, you could amend the preceding code snippet as follows:

```javascript
displayMode: function(employee, bindingContext) {
  // Now return a template name string based on properties of employee or bindingContext
}
```

### Using An External Template Engine

In the vast majority of cases, Footwork's native templating and the `foreach`, `if`, `with` and other control flow bindings will be all you need to construct an arbitrarily sophisticated UI.

#### jQuery Templates

By default, Footwork comes with support for [jquery.tmpl](https://github.com/BorisMoore/jquery-tmpl). To use it, you need to reference the following libraries, in this order:

```html
<!-- First jQuery -->     <script src="http://code.jquery.com/jquery-1.7.1.min.js"></script>
<!-- Then jQuery.tmpl --> <script src="jquery.tmpl.js"></script>
<!-- Then Footwork -->    <script src="footwork.js"></script>
```

Then, you can use jQuery.tmpl syntax in your templates. For example,

```html
<h1>People</h1>
<div data-bind="template: 'peopleList'"></div>

<script type="text/html" id="peopleList">
  {{'{{'}}each people}}
    <p>
      <b>${name}</b> is ${age} years old
    </p>
  {{'{{'}}/each}}
</script>

<script type="text/javascript">
  var viewModel = {
    people: fw.observableArray([
      { name: 'Rod', age: 123 },
      { name: 'Jane', age: 125 },
    ])
  };

  fw.applyBindings(viewModel);
</script>
```

This works because `{{'{{'}}each ...}}` and `${ ... }` are jQuery.tmpl syntaxes. What's more, it's trivial to nest templates: because you can use data-bind attributes from inside a template, you can simply put a `data-bind="template: ..."` inside a template to render a nested one.

Please note that, as of December 2011, jQuery.tmpl is no longer under active development. We recommend the use of Footwork's native DOM-based templating (i.e., the `foreach`, `if`, `with`, etc. bindings) instead of jQuery.tmpl or any other string-based template engine.

#### Underscore.js Templates

The [Underscore.js template engine](http://underscorejs.org/#template) by default uses ERB-style delimiters (`<%= ... %>`). Here's how the preceding example's template might look with Underscore:

```html
<script type="text/html" id="peopleList">
  <% _.each(people(), function(person) { %>
    <li>
      <b><%= person.name %></b> is <%= person.age %> years old
    </li>
  <% }) %>
</script>
```

!!! Tip
    If you're not a fan of the `<%= ... %>` delimiters, you can configure the Underscore template engine to use any other delimiter characters of your choice.

### Dependencies

 * **Native templating** does not require any library other than Footwork itself
 * **String-based templating** works only once you've referenced a suitable template engine, such as jQuery.tmpl or the Underscore template engine.
