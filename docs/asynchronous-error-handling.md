## fw.onError

Footwork wraps internal asynchronous calls and looks for an optional `fw.onError` callback to execute, if an exception is encountered, before throwing the original error. This gives you the opportunity to run custom logic, such as passing the error to a logging module. Additionally, since the original call is wrapped in a try/catch, the error passed to `fw.onError` contains a `stack` property, which is not true in many browsers when handling errors using `window.onerror`.

This functionality applies to errors in the following contexts:

- asynchronous updates made as part of the `textInput` and `value` binding
- component loading of a cached component when not configured for [synchronous loading](component-registration.md#controlling-synchronousasynchronous-loading)
- [rate-limited](rateLimit-observable.md) and [throttled](throttle-extender.md) computeds
- event handlers added by `fw.utils.registerEventHandler` including those bound by the `event` and `click` bindings

## Example

```javascript
fw.onError = function(error) {
  myLogger("knockout error", error);
};
```
