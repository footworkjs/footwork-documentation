This example demonstrates binding to an observable array.

```html
<form data-bind="submit: addItem">
    New item:
    <input data-bind='value: itemToAdd, valueUpdate: "afterkeydown"' />
    <button type="submit" data-bind="enable: itemToAdd().length > 0">Add</button>
    <p>Your items:</p>
    <select multiple="multiple" width="50" data-bind="options: items"> </select>
</form>
```

```javascript
var SimpleListModel = function(items) {
  var self = this;
  
  self.items = fw.observableArray(items);
  self.itemToAdd = fw.observable("");

  self.addItem = function() {
    if (self.itemToAdd() != "") {
      // Adds the item. Writing to the "items" observableArray causes any associated UI to update.
      self.items.push(self.itemToAdd());

      // Clears the text box, because it's bound to the "itemToAdd" observable
      self.itemToAdd("");
    }
  }
};

fw.applyBindings(new SimpleListModel(["Alpha", "Beta", "Gamma"]));
```
