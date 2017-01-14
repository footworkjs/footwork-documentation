To help you keep track of what is going on and display or do things based on that, Footwork provides several `observable` properties on a `dataModel` (after it is bootstrapped). These values keep track of several properties related to your `dataModel` and include things like what types of requests are being issued and whether or not the `dataModel` has been created yet.

## Available Properties

### dataModel.isCreating

Observable indicating whether or not the `dataModel` is currently issuing a *create* request.

### dataModel.isReading

Observable indicating whether or not the `dataModel` is currently issuing a *read* request.

### dataModel.isUpdating

Observable indicating whether or not the `dataModel` is currently issuing an *update* request.

### dataModel.isDeleting

Observable indicating whether or not the `dataModel` is currently issuing a *delete* request.

### dataModel.isSaving

Computed observable indicating whether or not the `dataModel` is currently issuing a *create* **or** *update* request.

### dataModel.requestInProgress

Computed observable indicating whether or not the `dataModel` is currently issuing a request of **any** type.

### dataModel.isNew

Observable indicating whether or not the `dataModel` is new (not yet saved to the server).

* An instance is considered *new* if the resolved value of the `idAttribute` is *falsey*.

* This also informs Footwork that the next time it is saved it needs to be created on the server.

### dataModel.isDirty

Observable indicating whether or not the `dataModel` has any *dirty* mapped properties

* A mapped property is marked *dirty* when it is changed after it was retrieved from or saved to the server.

### Example Usage

Since these are normal `observable` values you can bind your UI to them, subscribe to changes, or create [computed observables](computedObservables.md) based off of them as well. This (for instance) would allow you to create things like a status indicator telling your user if the `dataModel` is in the process of saving its data. Things like that are important because they provide feedback to the user so they don't become frustrated.

In the code below we create a `computed` that changes its value based on whether or not a `dataModel` is currently issuing a request:

```javascript
function Person (personData) {
  var self = fw.dataModel.boot(this, {
    url: '/person'
  });

  self.requestLabel = fw.computed(function () {
    if (self.requestInProgress()) {
      return 'Busy';
    } else {
      return 'Ready';
    }
  });
}
```

As an example, binding the `requestLabel` value above to a `text` binding in your UI would keep the user informed as to what is going on:

```html
The dataModel is: <span data-bind="text: requestLabel"></span>
```

## Dirty Properties

Footwork keeps track of whether or not your `dataModel` is *dirty* or not. This is accomplished by keeping track of any changes made on your mapped observables. If any of your mapped observables is flagged as being dirty then its parent `dataModel` will be flagged as such too.

**Example DataModel**

```javascript
function Thing () {
  var self = fw.dataModel.boot(this);
  self.variable = fw.observable().map('variable', self);
  self.otherVariable = fw.observable().map('otherVariable', self);
}
```

A mapped observable is considered *dirty* when:

* Its value is changed after it was [read from the server](dataModel-requests.md#read-a-record).

* Its value is changed after it was [created on the server](dataModel-requests.md#create-a-new-record).

* Its value is changed after it was [updated on the server](dataModel-requests.md#update-a-record).

Each mapped observable is given its own `isDirty` flag:

```javascript
var thing = new Thing();

this.variable.isDirty() === false
this.otherVariable.isDirty() === false

thing.variable('a value');

this.variable.isDirty() === true // it is now dirty
this.otherVariable.isDirty() === false // was not altered, not dirty
```

As seen above, changing the `variable` value caused it to be flagged as being `isDirty`. Once an individual mapped property is flagged as *dirty* then the entire `dataModel` is flagged as *dirty* as well:

```javascript
thing.isDirty() === true
```

## Clearing Dirty Properties

Once a `dataModel` has been *dirtied* you might want to *clean* it, that is accomplished in a couple different ways:

### Explicit Clearing

```javascript
thing.variable.isDirty(false);
// thing.isDirty() === false
// this.variable.isDirty() === false
// this.otherVariable.isDirty() === false
```

As you can see above clearing the one dirty observable caused the entire `dataModel` to be marked as being clean because no other mapped observable was dirty.

### Clearing After Saving

Another way to clear `isDirty` flags is by saving the `dataModel` to the server. Once a `200` response is received from the server all mapped observables on the `dataModel` are cleared of their `isDirty` flag.

```javascript
thing.save().then(function () {
  // thing.isDirty() === false
  // this.variable.isDirty() === false
  // this.otherVariable.isDirty() === false
});
```

By saving the instance above it is then cleared of any `isDirty` properties once the response is received.
