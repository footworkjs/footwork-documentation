# Broadcastable / Receivable

A broadcastable and receivable are `observable` values that allow you to share data and state between two different areas of your application. They are based off of `observables` and work by proxying their values over a [namespace bus](namespacing.md).

As you might have guessed, it has two parts:

* [receivable](#receivable): observable that receives its value from a broadcastable.

* [broadcastable](#broadcastable): observable that broadcasts, or syncs its value/state with other areas of your application.

```javascript
// setup observable that broadcasts its value
var broadcast = fw.observable('Hello').broadcast('broadcast', 'myNamespace');

// receive the value being broadcast
var receive = fw.observable().receive('broadcast', 'myNamespace');

// The receive observable is now held in sync with the broadcast observable
// receive() === 'Hello'
```

!!! Note
    Please be aware that there are some notes on instantiation order, and other context/use specific details that are covered in the [usage notes](#usage-notes) section.

## Receivable

Receivables are `observables` that subscribe to and listen for a `broadcastable` on a `namespace`, keeping its value in sync. They are created by calling `.receive(varName, namespace)` on an `observable`:

```javascript
// create the broadcastable that sends/sync with the receivable
var myName = fw.observable('Smith').broadcast('myName', 'someNamespace');

// The receivable which receives/syncs with the broadcastable
var receivedName = fw.observable().receive('myName', 'someNamespace');
// receivedName() === 'Smith'

// write to myName (the broadcastable) which then updates receivedName
myName('Jack');
// receivedName() === 'Jack'
```

!!! Tip
    You can also pass a *namespace* instance as the second parameter:

    ```javascript
    var someNamespace = fw.namespace('someNamespace');
    var myName = fw.observable().receive('myName', someNamespace);
    ```

### Writing To Receivables

Since a receivable is an observable property it can be written to. Depending on the configuration of its corresponding [broadcastable](#broadcastable) this may mean the value propogates back to it. There are two scenarios to be aware of:

* The corresponding broadcastable **is not configured to be writable**

    If you write to a receivable when its broadcastable is not configured to be writable, or no corresponding broadcastable is instantiated, then the value is not changed. This is because it updates only when the corresponding broadcastable sends it a new value.
    
    If no broadcastable is listening, or it is not configured to be writable, then the value is not written to it (and thus does not propogate back to any receivables).

* The corresponding broadcastable **is configured to be writable**

    If you write to a receivable whos broadcastable is configured to be writable, then the value is written to the broadcastable and propogates out to any corresponding receivables (including the one that was written to).

For more information see: [Writable Broadcastables](#writable-broadcastables)

## Broadcastable

Broadcastables are created by calling `.broadcast(varName, namespace)` on an `observable`. The `varName` is the name which the other side will listen for, and the `namespace` is the bus to broadcast the value over.

```javascript
var myName = fw.observable('test').broadcast('myName', 'someNamespace');
```

There are two primary *modes* a broadcastable can be created in:

* [Read-Only](#read-only-broadcastable)

    Sync is one way, from broadcastable to receivable. Values written to the broadcastable propogate to its receivables but not vice-versa.

* [Writable](#writable-broadcastables)

    Sync can occur in both directions. Values written to a receivable propogate back to its corresponding broadcastable.

!!! Tip
    * Just like with receivables, you can also pass a *namespace* instance as the second parameter:

        ```javascript
        var someNamespace = fw.namespace('someNamespace');
        var myName = fw.observable().broadcast('myName', someNamespace);
        ```

    * If you are creating a `broadcastable` from within the context of a [viewModel](viewModel-creation.md), [dataModel](dataModel-creation.md), or [router](router-creation.md) then you can also pass it the instance and it will use its `namespace`:

        ```javascript
        function MyViewModel () {
          var self = fw.viewModel.boot(this, {
            namespace: 'MyViewModel'
          });

          this.myName = fw.observable().broadcast('myName', self);
        }
        ```

        This can be especially helpful when you have several properties to broadcast and want to keep your code DRY.

### Read-Only Broadcastable

By default a broadcastable is *read-only*. This means that it broadcasts only (syncing is one-way, from broadcastable to receivable). A receivable cannot write back to a read-only broadcastable.

```javascript
var myName = fw.observable('test').broadcast('myName', 'someNamespace');
```

As a general rule is its best to use the same variable name when broadcasting. This helps avoid confusion when wiring up any corresponding receivables for it.

### Writable Broadcastables

You can optionally pass a 3rd boolean parameter to `.broadcast` which (if true) makes it a *writable* `broadcastable`. A *writable* `broadcastable` will allow any `receivable` to write back to it.

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
