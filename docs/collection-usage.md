One of the most common uses for a collection is retrieving its data from a remote location and displaying that to the user.

!!! Note
    Fetching collection data requires that the collection be properly configured with a `url` to grab the data from. See [collection configuration](collection-creation.md#using-a-configuration) for more information on how to do that.

## Fetching Data

**Grocery List**

Lets say we want to display a list of items to purchase at the local grocery store. Our endpoint will be located at `/grocery-list` and returns the following data when a `GET /grocery-list` request is issued:

```json
[
  {
    "item": "Eggs",
    "amount": 12
  },
  {
    "item": "Bread",
    "amount": 1
  },
  {
    "item": "Milk",
    "amount": 1
  },
  {
    "item": "Cereal",
    "amount": 2
  }
]
```

Lets take the groceries list above and display it to the user. First we create a container viewModel which contains a collection configured to fetch the grocery list outlined above:

```javascript
function GroceryList () {
  var self = fw.viewModel.boot(this, {
    namespace: 'GroceryList'
  });

  self.groceries = fw.collection({
    url: '/grocery-list'
  });

  self.loadGroceries = function () {
    self.groceries.fetch();
  };
}
```

Notice the *loadGroceries* function. We will use it to bind against a button the user will click, triggering the request:

```html
<!-- list the groceries in the collection -->
<div data-bind="foreach: groceries">
  <div class="grocery-item">
    <span data-bind="text: item"></span>
    <span data-bind="text: amount"></span>
  </div>
</div>

<!-- button the user will click to load the groceries -->
<button data-bind="click: loadGroceries">Load</button>
```

```javascript
window.onload = function () {
  fw.applyBindings(new GroceryList());
};
```

After loading the page, the initial render will display the *Load* button. Once the user clicks that the request is initiated and then the list rendered.

!!! Tip "Request Options"
    If you need to pass options to the underlying [ES6 fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) call you can do so by passing them into the `collection.fetch` call:

    ```javascript
    groceries.fetch({ credentials: 'same-origin' });
    ```

## Request State

One problem with the above example is that there is no feedback while the request is occuring. If the request ends up taking a significant amount of time the user might think the page has frozen or stopped responding. To remedy this, lets display a message informing them of what is going on.

A collection has an observable property on it called `isReading` (mirroring the [dataModel isReading property](dataModel-state.md#datamodelisreading)) which can be used to tell whether or not the collection currently has a *read* request in progress. During the time in which a collection is being read from its endpoint, this observable will have a value of *true*. Once the request is completed it will then be flipped back to *false*.

To take advantage of this with our previous example, we will create a [computed observable](computedObservables.md) which will convert the `isReading` flag into a textual message we can then bind in our UI and display to the user.

Taking the *GroceryList* viewModel from above, we inject a computed inside it:

```javascript
function GroceryList () {
  // ...

  self.groceries = fw.collection({
    url: '/grocery-list'
  });

  self.groceryStatus = fw.computed(function () {
    if (self.groceries.isReading()) {
      return 'Loading groceries, please wait...';
    }
    return 'Grocery List';
  });

  // ...
}
```

Taking the *groceryStatus* computed above, we bind it to our view which displays the message to the user:

```html
<div data-bind="text: groceryStatus"></div>
<div data-bind="foreach: groceries">
  <!-- ... -->
</div>
```

So now when a request is occuring (after the user clicks the *Load* button) the top will display *'Loading groceries, please wait...'*, and then switch to *'Grocery List'*, rendering the list once completed.

## Request Lull

If the request takes a *short amount* of time then the status message will flip-flop too quickly...creating a UI thrashing that is unpleasant (and possibly confusing) to the user. It would be best if we could get the message to *hang* in place for at least a small amount of time so the user can read it.

This can be done by [configuring a requestLull](collection-creation.md#requestlull-integer-callback) for the collection. Using the example above, we can add that as shown here:

```javascript
function GroceryList () {
  // ...

  self.groceries = fw.collection({
    url: '/grocery-list',
    requestLull: 300 // 300msec lull
  });

  // ...
}
```

Now once the request is issued our loading message will display for a minimum of 300 milliseconds.

!!! Tip
    For more information, see [request lull configuration](collection-creation.md#requestlull-integer-callback).
