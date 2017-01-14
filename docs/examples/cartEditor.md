This example shows how computed observables can be chained together. Each cart line has a `fw.pureComputed` property for its own subtotal, and these in turn are combined in a further `fw.pureComputed` property for the grand total. When you change the data, your changes ripple out through this chain of computed properties, and all associated UI is updated.

This example also demonstrates a simple way to create cascading dropdowns.

```html
<table width='100%'>
  <thead>
    <tr>
      <th width='25%'>Category</th>
      <th width='25%'>Product</th>
      <th class='price' width='15%'>Price</th>
      <th class='quantity' width='10%'>Quantity</th>
      <th class='price' width='15%'>Subtotal</th>
      <th width='10%'> </th>
    </tr>
  </thead>
  <tbody data-bind='foreach: lines'>
    <tr>
      <td>
        <select data-bind='options: sampleProductCategories, optionsText: "name", optionsCaption: "Select...", value: category'> </select>
      </td>
      <td data-bind="with: category">
        <select data-bind='options: products, optionsText: "name", optionsCaption: "Select...", value: $parent.product'> </select>
      </td>
      <td class='price' data-bind='with: product'>
        <span data-bind='text: formatCurrency(price)'> </span>
      </td>
      <td class='quantity'>
        <input data-bind='visible: product, value: quantity, valueUpdate: "afterkeydown"' />
      </td>
      <td class='price'>
        <span data-bind='visible: product, text: formatCurrency(subtotal())' > </span>
      </td>
      <td>
        <a href='#' data-bind='click: $parent.removeLine'>Remove</a>
      </td>
    </tr>
  </tbody>
</table>
<p class='grandTotal'>
  Total value: <span data-bind='text: formatCurrency(grandTotal())'> </span>
</p>
<button data-bind='click: addLine'>Add product</button>
<button data-bind='click: save'>Submit order</button>
```

```javascript
function formatCurrency(value) {
    return "$" + value.toFixed(2);
}

var CartLine = function() {
  var self = this;
  self.category = fw.observable();
  self.product = fw.observable();
  self.quantity = fw.observable(1);
  self.subtotal = fw.pureComputed(function() {
    return self.product() ? self.product().price * parseInt("0" + self.quantity(), 10) : 0;
  });

  // Whenever the category changes, reset the product selection
  self.category.subscribe(function() {
    self.product(undefined);
  });
};

var Cart = function() {
  // Stores an array of lines, and from these, can work out the grandTotal
  var self = this;
  self.lines = fw.observableArray([new CartLine()]); // Put one line in by default
  self.grandTotal = fw.pureComputed(function() {
    var total = 0;
    $.each(self.lines(), function() { total += this.subtotal() })
    return total;
  });

  // Operations
  self.addLine = function() { self.lines.push(new CartLine()) };
  self.removeLine = function(line) { self.lines.remove(line) };
  self.save = function() {
    var dataToSave = $.map(self.lines(), function(line) {
      return line.product() ? {
        productName: line.product().name,
        quantity: line.quantity()
      } : undefined
    });
    alert("Could now send this to server: " + JSON.stringify(dataToSave));
  };
};

fw.applyBindings(new Cart());
```
