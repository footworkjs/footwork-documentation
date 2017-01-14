# Broadcastable / Receivable

A broadcastable and receivable are `observable` values that allow you to share data and state between two different areas of your application. They are based off of `observables` and work by proxying their values over the `namespace` bus.

As you might have guessed, it has two parts:

* **broadcastable**: observable that broadcasts, or shares its value to other areas of your application.
* **receivable**: observable that receives its value from a broadcastable.

## Broadcastable

Broadcastables are created by calling `.broadcast(varName, namespace)` on an `observable`. The `varName` is the name which the other side will listen for, and the `namespace` is the bus to broadcast the value over.

### Read-Only Broadcastable

```javascript
var myName = fw.observable().broadcast('myName', 'someNamespace');
```

You can pass it a `namespace` instance as the second parameter:

```javascript
var someNamespace = fw.namespace('someNamespace');
var myName = fw.observable().broadcast('myName', someNamespace);
```

As a general rule is its best to use the same variable name when broadcasting. This helps avoid confusion when wiring up any corresponding receivables for it.

!!! Tip
    If you are creating a `broadcastable` from within the context of a [viewModel](viewModel-creation.md), [dataModel](dataModel-creation.md), or [router](router-creation.md) then you can also pass it the instance and it will use its `namespace`:

    ```javascript
    function MyViewModel () {
      var self = fw.viewModel.boot(this, {
        namespace: 'MyViewModel'
      });

      this.myName = fw.observable().broadcast('myName', self);
    }
    ```

    This can be especially helpful when you have several properties to broadcast and want to keep your code DRY.

### Writable Broadcastables

You can optionally pass a 3rd boolean parameter to `.broadcast` which (if true) makes it a *writable* `broadcastable`. What is that? It is a `broadcastable` that will allow any `receivable` to write back to it.

* Create the *writable* broadcastable that sends/sync with the receivable

    ```javascript
    var myName = fw.observable('Smith').broadcast('myName', 'Person', true);
    ```

* Create receivedName (a receivable) which receives/syncs with the broadcastable

    ```javascript
    var receivedName = fw.observable().receive('myName', 'Person');
    // receivedName() === 'Smith'
    ```

    `receivedName` is instantiated and is set to the current value of `myName` (its corresponding broadcastable).

* We then write to `receivedName` (the receivable), which then updates `myName` (the broadcastable)

    ```javascript
    receivedName('Jack');
    // myName() === 'Jack'
    ```

    The above example shows `myName` which is a `broadcastable` that can be written to, being written to by `receivedName`, a `receivable`.

## Receivable

Receivables are `observables` that subscribe to and listen for a `broadcastable` on a `namespace`, keeping its value in sync. They are created by calling `.receive(varName, namespace)` on an `observable`:

```javascript
// create the broadcastable that sends/sync with the receivable
var myName = fw.observable('Smith').broadcast('myName', 'someNamespace');

// create receivedName (the receivable) which receives/syncs with the broadcastable
var receivedName = fw.observable().receive('myName', 'someNamespace');
// receivedName() === 'Smith'

// write to myName (the broadcastable) which then updates receivedName
myName('Jack');
// receivedName() === 'Jack'
```

You can also pass it a `namespace` instance as the second parameter:

```javascript
var someNamespace = fw.namespace('someNamespace');
var myName = fw.observable().receive('myName', someNamespace);
```

## Usage Notes

There are a few special conditions where the behavior of a broadcastable and receivable need to be defined:

### Instantiation Order

When a `receivable` is instantiated it will request the current value from its corresponding `broadcastable`. This means it does not matter the order in which you instantiate them.

**Creating the broadcastable first:**

```javascript
var myName = fw.observable('Jerry').broadcast('myName', 'someNamespace');

var receivedName = fw.observable().receive('myName', 'someNamespace');
// receivedName() === 'Jerry'
```

The above example shows that when a `receivable` is instantiated it retrieves the current value from its corresponding `broadcastable` (if it exists).

**Creating the receivable first:**

```javascript
var receivedName = fw.observable().receive('myName', 'someNamespace');
// receivedName() === undefined

var myName = fw.observable('Jerry').broadcast('myName', 'someNamespace');
// receivedName() === 'Jerry'
```

The example above shows when `myName` is initialized it then updates `receivedName` even though the `myName` is created *after* `receivedName`. This is because upon instantiation, a `broadcastable` broadcasts the current value which any listening `receivables` then is updated with.

### Multiple Broadcastables

If you create multiple `broadcastable` instances that all *point to* the same variable, then:

* Each `broadcastable` retains their local value, regardless of what the other broadcastables are set as.
* When instantiated, `receivables` will receive *all* of the current broadcastable values, but only retain the last.
* The `receivables` will have the most recently broadcasted value.

### Using Non-Primitive Types

Non-primitive types (such as `Arrays` or `Objects`) are passed by reference. This means that if you broadcast/receive one of these pass-by-reference values, each side will have a direct reference.

For example:

```javascript
var thisThing = fw.observable().broadcast('thisThing', 'someNamespace');
var thatThing = fw.observable().receive('thisThing', 'someNamespace');

// log any changes to thatThing to the console
thatThing.subscribe(function(newThings) {
  console.log(newThings);
});

// modify thisThing which then propogates to thatThing, which then gets logged
thisThing(['this array', 'of values', 'is not', 'a primitive']);
// console logs: ['this array', 'of values', 'is not', 'a primitive']
```

If you then modify the observables value *directly*, the other side will not be notified of the changed:

```javascript
var thisThingData = thisThing();

// modify thisThing, but directly.
thisThingData.push('it was modified');
// console does not log anything
// thatThing() === ['this array', 'of values', 'is not', 'a primitive', 'it was modified']
```

Above you can see that when we modify the underlying *reference* to the `thisThing` (which happens to be an `Array`) the value of `thatThing` is also updated...but nothing is logged to the console because we modified the underlying *reference* to the value...which Footwork doesn't know about.

This may be *OK* for your application, as long as you are aware of its consequences. You can avoid this issue by only using `broadcast` and `receive` with [primitive values](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Primitive_values).

## Lifecycle

Both receivables and broadcastables make a subscription to the designated `namespace` bus, because of this they need to be disposed of before they can be garbage collected (and freed from memory).

To dispose of them, you call the `dispose` method:

```javascript
var receivedName = fw.observable().receive('myName', 'someNamespace');

// ... some time later
receivedName.dispose();
```

!!! Note
    If your `receivable`/`broadcastable` is attached to a [viewModel](viewModel-creation.md), [dataModel](dataModel-creation.md), or [router](router-creation.md) instance then it will be disposed of along with it (just like all other properties).
