# Observables

Observables are powerful yet simple in nature. They are variables whos values can be subscribed to. Any time an observables value changes any dependencies listening to it will be notified. This includes manual subscriptions, computed observables, as well as bindings in your markup.

Example view model with observable properties:

```javascript
var myViewModel = {
    personName: fw.observable('Bob'),
    personAge: fw.observable(123)
};
```

If you bind this view model against some markup then anytime one of the bound-against observables changes the view automatically updates as well. Conversely, if you bind the value against a form element then when the user changes the form value its corresponding observable is updated as well.

## Reading and Writing

* To **read** the observable's current value, just call the observable with no parameters.

    In this example, `myViewModel.personName()` will return `'Bob'`, and `myViewModel.personAge()` will return `123`.

* To **write** a new value to the observable, call the observable and pass the new value as a parameter.

    For example, calling `myViewModel.personName('Mary')` will change the name value to `'Mary'`.

* To write values to **multiple observable properties** on a model object, you can use *chaining syntax*.

    For example, `myViewModel.personName('Mary').personAge(50)` will change the name value to `'Mary'` *and* the age value to `50`.

The whole point of observables is that they can be observed, i.e., other code can say that it wants to be notified of changes. That's what many of Footwork's built-in bindings do internally. So, when you write `data-bind="text: personName"`, the `text` binding registered itself to be notified when `personName` changes (assuming it's an observable value, which it is now).

When you change the name value to `'Mary'` by calling `myViewModel.personName('Mary')`, the `text` binding will automatically update the text contents of the associated DOM element. That's how changes to the view model automatically propagate to the view.

## Subscribing

If you want to register your own subscriptions to be notified of changes to observables, you can call their `subscribe` function.

For example:

```javascript
myViewModel.personName.subscribe(function (newValue) {
  alert("The person's new name is " + newValue);
});
```

The `subscribe` function is how many parts of Footwork work internally. Most of the time you don't need to use this, because the built-in bindings and templating system take care of managing subscriptions.

The `subscribe` function accepts three parameters:

* `callback` is the function that is called whenever the notification happens
* `target` (optional) defines the value of `this` in the callback function
* `event` (optional; default is `"change"`) is the name of the event to receive notification for.

You can also terminate a subscription if you wish: first capture the return value as a variable, then you can call its `dispose` function, e.g.:

```javascript
var subscription = myViewModel.personName.subscribe (function (newValue) {
  // do stuff
});

// ...then later...
subscription.dispose(); // I no longer want notifications
```

If you want to be notified of the value of an observable before it is about to be changed, you can subscribe to the `beforeChange` event. For example:

```javascript
myViewModel.personName.subscribe(function (oldValue) {
  alert("The person's previous name is " + oldValue);
}, null, "beforeChange");
```

!!! Note
    Footwork does not guarantee that the `beforeChange` and `change` events will occur in pairs, since other parts of your code might raise either event individually. If you need to track the previous value of an observable, it's up to you to use a subscription to capture and track it.

## Notifying Subscribers

When writing to an observable that contains a primitive value (a number, string, boolean, or null), the dependencies of the observable are normally only notified if the value actually changed. However, it is possible to use the built-in `notify` [extender](extenders.md) to ensure that an observable's subscribers are always notified on a write, even if the value is the same. You would apply the extender to an observable like this:

```javascript
myViewModel.personName.extend({ notify: 'always' });
```

## Suppressing Notifications

Normally, an observable notifies its subscribers immediately, as soon as it's changed. But if an observable is changed repeatedly or triggers expensive updates, you may get better performance by limiting or delaying the observable's change notifications. This is accomplished using the [`rateLimit` extender](rateLimit-observable.md) like this:

```javascript
// Ensure it notifies about changes no more than once per 50-millisecond period
myViewModel.personName.extend({ rateLimit: 50 });
```
