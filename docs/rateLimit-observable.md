Normally, an [observable](observables.md) that is changed notifies its subscribers immediately, so that any computed observables or bindings that depend on the observable are updated synchronously. The `rateLimit` extender, however, causes an observable to suppress and delay change notifications for a specified period of time. A rate-limited observable therefore updates dependencies asynchronously.

The `rateLimit` extender can be applied to any type of observable, including [observable arrays](observableArrays.md) and [computed observables](computedObservables.md). The main use cases for rate-limiting are:

 * Making things respond after a certain delay
 * Combining multiple changes into a single update

If you only need to combine updates without adding a delay, [deferred updates](deferred-updates.md) provides a more efficient method.

## Applying the rateLimit extender

`rateLimit` supports two parameter formats:

```javascript
// Shorthand: Specify just a timeout in milliseconds
someObservableOrComputed.extend({ rateLimit: 500 });

// Longhand: Specify timeout and/or method
someObservableOrComputed.extend({ rateLimit: {
  timeout: 500,
  method: "notifyWhenChangesStop"
} });
```

The `method` option controls when notifications fire, and accepts the following values:

1. `notifyAtFixedRate`

    **Default value if not otherwise specified**. The notification happens after the specified period of time from the first change to the observable (either initially or since the previous notification).

2. `notifyWhenChangesStop`

    The notification happens after no changes have occured to the observable for the specified period of time. Each time the observable changes, that timer is reset, so notifications cannot happen if the observable continuously changes more frequently than the timeout period.

## Special consideration for computed observables

For a computed observable, the rate-limit timer is triggered when one of the computed observable's dependencies change instead of when its value changes. The computed observable is not re-evaluated until its value is actually needed---after the timeout period when the change notification should happen, or when the computed observable value is accessed directly. If you need to access the value of the computed's most recent evaluation, you can do so with the `peek` method.

## Forcing rate-limited observables to always notify subscribers

When the value of any observable is primitive (a number, string, boolean, or null), the dependents of the observable are by default notified only when it is set to a value that is actually different from before. So, primitive-valued rate-limited observables notify only when their value is actually different at the end of the timeout period. In other words, if a primitive-valued rate-limited observable is changed to a new value and then changed back to the original value before the timeout period ends, no notification will happen.

If you want to ensure that the subscribers are always notified of an update, even if the value is the same, you would use the `notify` extender in addition to `rateLimit`:

```javascript
myViewModel.fullName = fw.computed(function() {
  return myViewModel.firstName() + " " + myViewModel.lastName();
}).extend({ notify: 'always', rateLimit: 500 });
```

## Comparison with deferred updates

Instead of using a timed delay, deferred updates are processed as soon as possible after the current task, before yielding for I/O, reflow, or redrawing.

## Comparison with the throttle extender

If you'd like to migrate code from using the deprecated `throttle` extender, you should note the following ways that the `rateLimit` extender is different from the `throttle` extender.

When using `rateLimit`:

1. *Writes* to observables are not delayed; the observable's value is updated right away. For writable computed observables, this means that the write function is always run right away.
2. All `change` notifications are delayed, including when calling `valueHasMutated` manually. This means you can't use `valueHasMutated` to force a rate-limited observable to notify an un-changed value.
3. The default rate-limit method is different from the `throttle` algorithm. To match the `throttle` behavior, use the `notifyWhenChangesStop` method.
4. Evaluation of a rate-limited computed observable isn't rate-limited; it will re-evaluate if you read its value.
