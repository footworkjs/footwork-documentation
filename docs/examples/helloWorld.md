In this example, the two text boxes are bound to <em>observable</em> variables on a data model. The "full name" display is bound to a <em>computed observable</em>, whose value is calculated in terms of the observables.

```html
<p>First name: <input data-bind="value: firstName" /></p>
<p>Last name: <input data-bind="value: lastName" /></p>
<h2>Hello, <span data-bind="text: fullName"> </span>!</h2>
```

```javascript
// Here's my data model
var ViewModel = function(first, last) {
  var self = this;

  self.firstName = fw.observable(first);
  self.lastName = fw.observable(last);

  self.fullName = fw.pureComputed(function() {
    // Footwork tracks dependencies automatically. It knows that fullName depends on firstName and lastName, because these get called when evaluating fullName.
    return self.firstName() + " " + self.lastName();
  });
};

fw.applyBindings(new ViewModel("Planet", "Earth")); // This makes Footwork get to work
```
