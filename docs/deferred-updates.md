In complex applications, with multiple, intertwined dependencies, updating a single [observable](observables.md) might trigger a cascade of [computed observables](computedObservables.md), manual subscriptions, and UI binding updates. These updates can be expensive and inefficient if unnecessary intermediate values are pushed to the view or result in extra computed observable evaluations. Even in a simple application, updating related observables or a single observable multiple times (such as filling an [observable array](observableArrays.md)) can have a similar effect.

Using deferred updates ensures that computed observables and bindings are updated only after their dependencies are stable. Even if an observable might go through multiple intermediate values, only the latest value is used to update its dependencies. To facilitate this, all notifications become asynchronous, scheduled using the [Footwork microtask queue](microtasks.md). This may sound very similar to [rate-limiting](rateLimit-observable.md), which also helps prevent extra notifications, but deferred updates can provide these benefits across an entire application without adding delays. Here's how notification scheduling differs between the standard, deferred, and rate-limited modes:

* *Standard*

    Notifications happen immediately and synchronously. Dependencies are often notified of intermediate values.

* *Deferred*

    Notifications happen asynchronously, immediately after the current task and generally before any UI redraws.

* *Rate-limited*

    Notifications happen after the specified period of time (a minimum of 2-10 ms depending on the browser).

## Enabling deferred updates

Deferred updates are turned off by default to provide compatibility with existing applications. To use deferred updates for your application, you must enable it before initializing your viewmodels by setting the following option:

```javascript
fw.options.deferUpdates = true;
```

When the `deferUpdates` option is on, all observables, computed observables, and bindings will be set to use deferred updates and notifications. Enabling this feature at the start of creating a Footwork-based application means you do not need to worry about working around the intermediate-value problem, and so can facilitate a cleaner, purely reactive design. But you should take care when enabling deferred updates for an existing application because it will break code that depends on synchronous updates or on notification of intermediate values (although you may be able to [work around these issues](#forcing-deferred-notifications-to-happen-early)).

## Using deferred updates for specific observables

Even if you don't enable deferred updates for your whole application, you can still benefit from this feature by specifically making certain observables deferred. This is done using the `deferred` extender:

```javascript
this.data = fw.observableArray().extend({ deferred: true });
```

Now we can `push` a bunch of items into the `data` array without worrying about causing excessive UI or computed updates. The `deferred` extender can be applied to any type of observable, including observable arrays and computed observables.

## Forcing deferred notifications to happen early

Although deferred, asynchronous notifications are generally better because of fewer UI updates, it can be a problem if you need to update the UI immediately. Sometimes, for proper functionality, you need an intermediate value pushed to the UI. You can accomplish this using the [`fw.tasks.runEarly` method](microtasks.md#advanced-queue-control). For example:

```javascript
// remove an item from an array
var items = myArray.splice(sourceIndex, 1);

// force updates so the UI will see a delete/add rather than a move
fw.tasks.runEarly();

// add the item in a new location
myArray.splice(targetIndex, 0, items[0]);
```

## Forcing deferred observables to always notify subscribers

When the value of any observable is primitive (a number, string, boolean, or null), the dependents of the observable are by default notified only when it is set to a value that is actually different from before. So, primitive-valued deferred observables notify only when their value is actually different at the end of the current task. In other words, if a primitive-valued deferred observable is changed to a new value and then changed back to the original value, no notification will happen.

To ensure that the subscribers are always notified of an update, even if the value is the same, you would use the `notify` extender:

```javascript
fw.options.deferUpdates = true;

myViewModel.fullName = fw.pureComputed(function() {
  return myViewModel.firstName() + " " + myViewModel.lastName();
}).extend({ notify: 'always' });
```
