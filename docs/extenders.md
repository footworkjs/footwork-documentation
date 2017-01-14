Footwork observables provide the basic features necessary to support reading/writing values and notifying subscribers when that value changes. In some cases, though, you may wish to add additional functionality to an observable. This might include adding additional properties to the observable or intercepting writes by placing a writable computed observable in front of the observable. Footwork extenders provide an easy and flexible way to do this type of augmentation to an observable.

### How to create an extender

Creating an extender involves adding a function to the `fw.extenders` object. The function takes in the observable itself as the first argument and any options in the second argument. It can then either return the observable or return something new like a computed observable that uses the original observable in some way.

 This simple `logChange` extender subscribes to the observable and uses the console to write any changes along with a configurable message.

```javascript
fw.extenders.logChange = function (target, option) {
  target.subscribe(function (newValue) {
    console.log(option + ": " + newValue);
  });
  return target;
};
```

You would use this extender by calling the `extend` function of an observable and passing an object that contains a `logChange` property.

```javascript
this.firstName = fw.observable("Bob").extend({ logChange: "first name" });
```

If the `firstName` observable's value was changed to `Ted`, then the console would show `first name: Ted`.

### Applying multiple extenders

More than one extender can be applied in a single call to the `.extend` method of an observable.

```javascript
this.firstName = fw.observable(first).extend({
  required: "Please enter a first name",
  logChange: "first name"
});
```

In this case, both the `required` and `logChange` extenders would be executed against our observable.
