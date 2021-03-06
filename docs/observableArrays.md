If you want to detect and respond to changes on one object or value, you'd use [observables](observables.md). If you want to detect and respond to changes of a *collection of things*, use an `observableArray`. This is useful in many scenarios where you're displaying or editing multiple values and need repeated sections of UI to appear and disappear as items are added and removed.

Example:

```javascript
var myObservableArray = fw.observableArray();
// myObservableArray() === []

myObservableArray.push('Some value'); // Adds the value and notifies observers
// myObservableArray() === ['Some value']
```

To see how you can bind the `observableArray` to a UI and let the user modify it, see [the simple list example](../examples/simpleList).

## Instantiation

To create an observableArray you use `fw.observableArray()`:

```javascript
var myObservableArray = fw.observableArray();
```

If you want your observable array **not** to start empty, but to contain some initial items, pass those items as an array to the constructor. For example:

```javascript
// This observable array initially contains three objects
var anotherObservableArray = fw.observableArray([
  { name: "Bungle", type: "Bear" },
  { name: "George", type: "Hippo" },
  { name: "Zippy", type: "Unknown" }
]);
```

## Reading

Behind the scenes, an `observableArray` is actually an [observable](observables.md) whose value is an array (plus, `observableArray` adds some additional features described below). So, you can get the underlying JavaScript array by invoking the `observableArray` as a function with no parameters, just like any other observable. Then you can read information from that underlying array. For example,

```javascript
alert('The length of the array is ' + myObservableArray().length);
alert('The first element is ' + myObservableArray()[0]);
```

Technically you can use any of the native JavaScript array functions to operate on that underlying array, but normally there's a better alternative. Footwork's `observableArray` has equivalent functions of its own, and they're more useful because:

1. For functions that modify the contents of the array, such as `push` and `splice` Footwork's methods automatically trigger the dependency tracking mechanism so that all registered listeners are notified of the change, and your UI is automatically updated.
1. The syntax is more convenient. To call Footwork's `push` method, just write `myObservableArray.push(...)`. This is slightly nicer than calling the underlying array's `push` method by writing `myObservableArray().push(...)`.

!!! Important
    **An observableArray tracks which objects are *in* the array, *not* the state of those objects**

    Simply putting an object into an `observableArray` doesn't make all of that object's properties themselves observable. Of course, you can make those properties observable if you wish, but that's an independent choice. An `observableArray` just tracks which objects it holds, and notifies listeners when objects are added or removed.

## Finding and Manipulating Data

`observableArray` exposes a familiar set of functions for modifying the contents of the array and notifying listeners.

### Finding Data

**indexOf**

The `indexOf` function returns the index of the first array item that equals your parameter. For example, `myObservableArray.indexOf('Blah')` will return the zero-based index of the first array entry that equals `Blah`, or the value `-1` if no matching value was found.

**slice**

The `slice` function is the `observableArray` equivalent of the native JavaScript `slice` function (i.e., it returns the entries of your array from a given start index up to a given end index). Calling `myObservableArray.slice(...)` is equivalent to calling the same method on the underlying array (i.e., `myObservableArray().slice(...)`).

### Manipulating Data

All of these functions are equivalent to running the native JavaScript array functions on the underlying array, and then notifying listeners about the change:

* `push(value)`

    Adds a new item to the end of array.

* `pop()`

    Removes the last value from the array and returns it.

* `unshift(value)`

    Inserts a new item at the beginning of the array.

* `shift()`

    Removes the first value from the array and returns it.

* `reverse()`

    Reverses the order of the array and returns the `observableArray` (not the underlying array).

* `sort()`

    Sorts the array contents and returns the `observableArray`.

    * The default sort is alphabetical, but you can optionally pass a function to control how the array should be sorted. Your function should accept any two objects from the array and return a negative value if the first argument is smaller, a positive value is the second is smaller, or zero to treat them as equal. For example, to sort an array of 'person' objects by last name, you could write:

        ```javascript
        myObservableArray.sort(function (left, right) {
          return left.lastName == right.lastName ? 0 : (left.lastName < right.lastName ? -1 : 1);
        });
        ```

* `splice()`

    Removes and returns a given number of elements starting from a given index. For example, `myObservableArray.splice(1, 3)` removes three elements starting from index position 1 (i.e., the 2nd, 3rd, and 4th elements) and returns them as an array.

For more details about these `observableArray` functions, see the equivalent documentation of the [standard JavaScript array functions](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array#Methods_2).

### Removing Data

`observableArray` adds some more useful methods for removing items that aren't found on JavaScript arrays by default:

* `remove(someItem )`

    Removes all values that equal `someItem` and returns them as an array.

* `remove(function (item) { return item.age < 18; })`

    Removes all values whose `age` property is less than 18, and returns them as an array.

* `removeAll(['Chad', 132, undefined])`

    Removes all values that equal `'Chad'`, `123`, or `undefined` and returns them as an array.

* `removeAll()`

    Removes all values and returns them as an array.

## destroy and destroyAll

The `destroy` and `destroyAll` functions are mainly intended as a convenience for developers using Ruby on Rails:

* `destroy(someItem)`

    Finds any objects in the array that equal `someItem` and gives them a special property called `_destroy` with value `true`.

* `destroy(function (someItem) { return someItem.age < 18; })`

    Finds any objects in the array whose `age` property is less than 18, and gives those objects a special property called `_destroy` with value `true`.

* `destroyAll(['Chad', 132, undefined])`

    Finds any objects in the array that equal `'Chad'`, `123`, or `undefined` and gives them a special property called `_destroy` with value `true`.

* `destroyAll()`

    Gives a special property called `_destroy` with value `true` to all objects in the array.

So, what's this `_destroy` thing all about? It's only really interesting to Rails developers. The convention in Rails is that, when you pass into an action a JSON object graph, the framework can automatically convert it to an ActiveRecord object graph and then save it to your database. It knows which of the objects are already in your database, and issues the correct INSERT or UPDATE statements. To tell the framework to DELETE a record, you just mark it with `_destroy` set to `true`.

Note that when Footwork renders a `foreach` binding, it automatically hides any objects marked with `_destroy` equal to `true`. So, you can have some kind of "delete" button that invokes the `destroy(someItem)` method on the array, and this will immediately cause the specified item to vanish from the visible UI. Later, when you submit the JSON object graph to Rails, that item will also be deleted from the database (while the other array items will be inserted or updated as usual).

## Suppressing Change Notifications

Normally, an `observableArray` notifies its subscribers immediately, as soon as it's changed. But if an `observableArray` is changed repeatedly or triggers expensive updates, you may get better performance by limiting or delaying change notifications. This is accomplished using the [`rateLimit` extender](rateLimit-observable.md) like this:

    // Ensure it notifies about changes no more than once per 50-millisecond period
    myViewModel.myObservableArray.extend({ rateLimit: 50 });
