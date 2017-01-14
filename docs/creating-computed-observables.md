Creating *computed observables* is a relatively straightforward process, however there are some things a developers should be aware of when using them.

A basic computed observable:

```javascript
function AppViewModel() {
  this.firstName = fw.observable('Bob');
  this.lastName = fw.observable('Smith');

  // Create a computed fullName value based on firstName and lastName
  this.fullName = fw.computed(function() {
    return this.firstName() + " " + this.lastName();
  }, this);
}
```

Here we see a `fullName` property being computed from the `firstName` and `lastName`. Notice we are passing in the context of the evaluator as the second parameter so that when we reference `this` inside of it we are accessing the view model (and its attached observables `fullName` and `lastName`).

!!! Tip
    Depending on your needs you may want to try the alternative [pure computed](computed-pure.md) variant, which has lower resource usage and may be a better fit for your particular use-case.

### Managing 'this'

The second parameter to `fw.computed` (the bit where we passed `this` in the above example) defines the value of `this` when evaluating the computed observable. Without passing it in, it would not have been possible to refer to `this.firstName()` or `this.lastName()`. Experienced JavaScript coders will regard this as obvious, but if you're still getting to know JavaScript it might seem strange. (Languages like C# and Java never expect the programmer to set a value for `this`, but JavaScript does, because its functions themselves aren't part of any object by default.)

**A popular convention that simplifies things**

There's a popular convention that avoids the need to track `this` altogether: if your viewmodel's constructor copies a reference to `this` into a different variable (traditionally called `self`), you can then use `self` throughout your viewmodel and don't have to worry about it being redefined to refer to something else. For example:

```javascript
function AppViewModel() {
  var self = this;

  self.firstName = fw.observable('Bob');
  self.lastName = fw.observable('Smith');
  self.fullName = fw.computed(function() {
    return self.firstName() + " " + self.lastName();
  });
}
```

Because `self` is captured in the function's closure, it remains available and consistent in any nested functions, such as the computed observable's evaluator. This convention is even more useful when it comes to event handlers.

### Change Notifications

#### Forcing computed observables to always notify subscribers

When a computed observable returns a primitive value (a number, string, boolean, or null), the dependencies of the observable are normally only notified if the value actually changed. However, it is possible to use the built-in `notify` [extender](extenders.md) to ensure that a computed observable's subscribers are always notified on an update, even if the value is the same. You would apply the extender like this:

```javascript
myViewModel.fullName = fw.pureComputed(function() {
  return myViewModel.firstName() + " " + myViewModel.lastName();
}).extend({ notify: 'always' });
```

#### Delaying and/or suppressing change notifications

Normally, a computed observable updates and notifies its subscribers immediately, as soon as its dependencies change. But if a computed observable has many dependencies or involves expensive updates, you may get better performance by limiting or delaying the computed observable's updates and notifications. This is accomplished using the [`rateLimit` extender](rateLimit-observable.md) like this:

```javascript
// Ensure updates no more than once per 50-millisecond period
myViewModel.fullName.extend({ rateLimit: 50 });
```

### Utility Methods

#### isComputed

Returns true when the passed in value is a [computed observable](computedObservables.md).

```javascript
fw.isComputed(property);
```

#### isObservable

Returns true for observables, observable arrays, and all [computed observables](computedObservables.md).

```javascript
fw.isObservable(property);
```

#### isWritableObservable

Returns true for observables, observable arrays, and [writable computed observables](computed-writable.md) (also aliased as `fw.isWriteableObservable`).

```javascript
fw.isWritableObservable(property);
```
