# Computed Observables Overview

What if you have an [observable](observables.md) for `firstName`, and another for `lastName`, and you want to display the full name? That's where *computed observables* come in - these are functions that are dependent on one or more other observables, and will automatically update whenever any of these dependencies change.

For example, given the following view model class,

```javascript
function AppViewModel() {
  this.firstName = fw.observable('Bob');
  this.lastName = fw.observable('Smith');
}
```

... you could add a computed observable to return the full name:

```javascript
function AppViewModel() {
  // create reference so we can more easily access this view model
  var self = this;

  // ...

  self.fullName = fw.computed(function() {
    return self.firstName() + " " + self.lastName();
  });
}
```

Now you could bind UI elements to it, e.g.:

```html
The name is <span data-bind="text: fullName"></span>
```

... and they will be updated whenever `firstName` or `lastName` changes (your evaluator function will be called once each time any of its dependencies change, and whatever value you return will be passed on to the observers such as UI elements or other computed observables).

## Dependency Chains

Of course, you can create whole chains of computed observables if you wish. For example, you might have:

* an **observable** called `items` representing a set of items
* another **observable** called `selectedIndexes` storing which item indexes have been 'selected' by the user
* a **computed observable** called `selectedItems` that returns an array of item objects corresponding to the selected indexes
* another **computed observable** that returns `true` or `false` depending on whether any of `selectedItems` has some property (like being new or being unsaved). Some UI element, like a button, might be enabled or disabled based on this value.

Changes to `items` or `selectedIndexes` will ripple through the chain of computed observables, which in turn will update any UI elements bound to them.

## UI-Only Computed Observables

If you only need to use the compound full name in the UI you could declare it as:

```javascript
function AppViewModel () {
  // ...

  this.fullName = function () {
    return this.firstName() + " " + this.lastName();
  };
}
```

Now your binding in UI elements becomes a method call, e.g.:

```html
The name is <span data-bind="text: fullName()"></span>
```

Footwork will create a computed observable internally in order to detect what observables the expression depends on, and will automatically dispose it when the associated element is later removed.
