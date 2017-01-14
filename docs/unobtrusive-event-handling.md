In most cases, data-bind attributes provide a clean and succinct way to bind to a view model. However, event handling is one area that can often result in verbose data-bind attributes, as anonymous functions were typically the recommended techinique to pass arguments.  For example:

```html
<a href="#" data-bind="click: function() {
  viewModel.items.remove($data);
}">remove</a>
```

As an alternative, Footwork provides two helper functions that allow you to identify the data associated with a DOM element:

 * `fw.dataFor(element)` - returns the data that was available for binding against the element
 * `fw.contextFor(element)` - returns the entire [binding context](binding-context.md) that was available to the DOM element.

These helper functions can be used in event handlers that are attached unobtrusively using something like jQuery's `bind` or `click`. The above function could be attached to each link with a `remove` class like:

```javascript
$(".remove").click(function () {
  viewModel.items.remove(fw.dataFor(this));
});
```

Better yet, this techinique could be used to support event delegation.  jQuery's `live/delegate/on` functions are an easy way to make this happen:

```javascript
$(".container").on("click", ".remove", function() {
  viewModel.items.remove(fw.dataFor(this));
});
```

Now, a single event handler is attached at a higher level and handles clicks against any links with the `remove` class. This method has the added benefit of automatically handling additional links that are dynamically added to the document (perhaps as the result of an item being added to an observableArray).

!!! Summary
    No matter how nested the links become, the handler is always able to identify and operate on the appropriate data. Using this techinique, we can avoid the overhead of attaching handlers to each individual link and can keep the markup clean and concise.
