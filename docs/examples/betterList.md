This example builds on the earlier [simple list example](simpleList.html) by making it possible to remove items (with multi-selection) and to sort the list. The "remove" and "sort" buttons become disabled if they are not applicable (e.g., if there aren't enough items to sort).

Check out the HTML source code to see how little code all this takes. This example also shows how you can use function literals in bindings (see the binding for 'sort').

```html
<form data-bind="submit:addItem">
    Add item: <input type="text" data-bind='value:itemToAdd, valueUpdate: "afterkeydown"' />
    <button type="submit" data-bind="enable: itemToAdd().length > 0">Add</button>
</form>

<p>Your values:</p>
<select multiple="multiple" height="5" data-bind="options:allItems, selectedOptions:selectedItems"> </select>

<div>
    <button data-bind="click: removeSelected, enable: selectedItems().length > 0">Remove</button>
    <button data-bind="click: sortItems, enable: allItems().length > 1">Sort</button>
</div>
```

```javascript
var BetterListModel = function () {
  var self = this;

  self.itemToAdd = fw.observable("");
  self.allItems = fw.observableArray(["Fries", "Eggs Benedict", "Ham", "Cheese"]); // Initial items
  self.selectedItems = fw.observableArray(["Ham"]);                                // Initial selection

  self.addItem = function () {
    if ((self.itemToAdd() != "") && (self.allItems.indexOf(self.itemToAdd()) < 0)) // Prevent blanks and duplicates
        self.allItems.push(self.itemToAdd());
    self.itemToAdd(""); // Clear the text box
  };

  self.removeSelected = function () {
    self.allItems.removeAll(self.selectedItems());
    self.selectedItems([]); // Clear selection
  };

  self.sortItems = function() {
    self.allItems.sort();
  };
};

fw.applyBindings(new BetterListModel());
```
