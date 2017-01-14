## Footwork's microtask queue

Footwork's microtask queue supports scheduling tasks to run as soon as possible while still being asynchronous, striving to schedule them to occur before yielding for I/O, reflow, or redrawing. It is used internally for [Footwork components](component-basics.md) to maintain asynchronous behavior, and for scheduling [deferred updates](deferred-updates.md) for observables.

```javascript
fw.tasks.schedule(function () {
  // ...
});
```

This will add the provided callback function to the microtask queue. Footwork includes a fast task queue that runs tasks in FIFO order until the queue is empty. When the first task is scheduled, Footwork will schedule a flush event using the [browser's microtask](#implementation) support if possible. This ensures that the first task and subsequent tasks behave similarly.

Microtasks can be canceled using the *handle* value returned from `fw.tasks.schedule`. If the task has already run or was previously canceled, `cancel` does nothing.

```javascript
var handle = fw.tasks.schedule( /* ... */ );
fw.tasks.cancel(handle);
```

### Error handling

If a task throws an exception, it will not interrupt the task queue, which will continue until it is empty. The exception will instead be postponed to a later event and can be handled using [`fw.onError`](asynchronous-error-handling.md) or `window.onerror`.

### Recursive task limit

Since Footwork processes the microtask queue until it is empty, without yielding to external events, numerous or lengthy tasks could cause the browser page to become unresponsive. Footwork prevents infinite recursion by canceling all remaining tasks if it detects a high level of recursion. For example, the following will eventually stop and throw an error:

```javascript
function loop() {
  fw.tasks.schedule(loop);
}
loop();
```

### Implementation

When the first task is scheduled (initially and after a previous flush event has finished), Footwork will schedule a flush event to process the microtask queue. If possible, it will try to use the browsers's own microtask capabilities. In modern browsers, it will use a [DOM mutation observer](http://dom.spec.whatwg.org/#mutation-observers), and in older versions of Internet Explorer, it will use a `<script> onreadystatechange` event. These methods allow it to start processing the queue before any reflow or redrawing. In other browsers, it will revert to using `setTimeout`.

### Advanced queue control

Footwork provides some advanced methods to control when the microtask queue is processed. These are useful if you want to integrate Footwork's microtask system with another library or add support for additional environments.

* `fw.tasks.runEarly()`

    Call this method to process the current microtask queue on demand, immediately, until it is empty. Besides library integration, you might use this method if you have code that schedules a number of tasks, but then needs to deal with the effects of those tasks synchronously.

* `fw.tasks.scheduler`

    Override this method to redefine or augment how Footwork schedules the event to process and flush the queue. Footwork calls this method when the first task is scheduled, so it must schedule the event and return immediately. For example, if your application is running in Node.js, you might prefer to use `process.nextTick` for the flush event: `fw.tasks.scheduler = process.nextTick;`.

