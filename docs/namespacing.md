# Namespacing

FootworkJS enables you to organize your code into `namespaces`. Namespaces boil down to a simple `string` identifier which is used to segment off one area from another.

By keeping your modules separate and using a `namespace` to communicate and share state you are more easily able to keep your application [loosely coupled](https://en.wikipedia.org/wiki/Loose_coupling).

## Publish / Subscribe

[Pub/Sub](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) is a messaging pattern used to aide in decoupling by allowing communication between separate areas of your application without the need of direct references.

With Footwork-based code pub/sub is even more necessary because any *declarative* [viewModel](viewModel-creation.md), [dataModel](dataModel-creation.md), and [router](router-creation.md) instances (along with components) you create will not give you direct references to them. Why? Because you don't explicitly instantiate them.

So in order for you to tell these modules to do things (outside of binding your UI to them) you will need to pass them messages. Footwork facilitates this via its `namespace` feature.

!!! Note
    Each `namespace` instance using the same *string* identifier communicates on the same message bus.

    This means that if you create a `namespace` in two places using the same string identifier they will receive the same messages.

### Subscribing to Messages

To receive a message you must first subscribe to its topic, in Footwork this is done by calling `subscribe` on a `namespace` instance and providing it the topic as well as a handler callback.

For example:

```javascript
// first create the namespace instance we need to setup our subscription handler on
var blahNamespace = fw.namespace('blah');

// create the subscription passing it the topic and callback handler
var subscription = blahNamespace.subscribe('something-happened', function (thisThingHappened) {
  console.log(thisThingHappened);
});
```

In the example above you can see a `namespace` of *blah* being instantiated and a subscription handler for the *something-happened* `topic`. The handler defined simply logs any message it receives to the console.

### Publishing a Message

In the preceding example, it showed how to create a `subscription` to the topic *something-happened* on the `namespace` *blah*. Lets publish a message to it from some other place in our code:

```javascript
/**
 * We need access to the namespace in order to publish a message to it
 * so we create another instance using the same string identifier as before.
 */
var alsoBlahNamespace = fw.namespace('blah');

/**
 * Now lets publish a message, all subscriptions listening to the
 * 'something-happened' topic will receive it.
 */
alsoBlahNamespace.publish('something-happened', 'this thing happened');
// console logs: 'this thing happened'
```

The example above shows a new instance of the same *blah* `namespace` being created, and then a message published on it using the same *something-happened* `topic` we subscribed to in the earlier example. Because we are sending a message on the same `namespace` and `topic` the handler we setup prior then receives the message and logs it to the console.

## Request / Response

At times you may need to ask a different area of your program for a piece of information (or state). Footwork helps with this by providing an easy way to synchronously request for data via its `namespace`.

### Listening for Requests

To listen for a request you setup a `requestHandler` on a `namespace` for a specific `topic`. This is shown here:

```javascript
var blahNamespace = fw.namespace('blah');

var requestHandler = blahNamespace.requestHandler('what-happened', function () {
  return 'this thing happened';
});
```

You can also optionally receive a parameter from the requester:

```javascript
var requestHandler = blahNamespace.requestHandler('what-happened', function (param) {
  return 'this thing happened with ' + param;
});
var response = blahNamespace.request('what-happened', 'that');
// response === 'this thing happened with that'
```

### Requesting data

After creating the request handler, issuing a request is as simple as `request`'ing it:

```javascript
var alsoBlahNamespace = fw.namespace('blah');

var thingThatHappened = alsoBlahNamespace.request('what-happened');
// thingThatHappened === 'this thing happened'
```

Using a `namespace` instance with the same *blah* string identifier as before we request the data. The previously setup handler responds to it and returns our requested data.

### Handling Multiple Responses

You may be asking, what happens if I setup multiple handlers for the same request `topic` on a `namespace`? Well, that depends...

* **Receiving only the first response**

By default, only the first response is returned.

```javascript
var blahNamespace = fw.namespace('blah');

var requestHandler = blahNamespace.requestHandler('what-happened', function () {
  return 'this thing happened';
});
var anotherRequestHandler = blahNamespace.requestHandler('what-happened', function () {
  return 'this other thing happened';
});

var thingThatHappened = blahNamespace.request('what-happened');
console.log(thingThatHappened);
// console logs: 'this thing happened'
```

* **Receiving all responses**

You can optionally pass `true` as the third parameter to `request`, telling Footwork to return all of the responses it receives:

```javascript
var thingsThatHappened = blahNamespace.request('what-happened', null, true);

console.log(thingsThatHappened);
// console logs: ['this thing happened', 'this other thing happened']
```

## Sharing State

Pub/Sub and request/receive are great, but what if you just want to share/sync some data across different areas of your code? Footwork provides an easy way to do that via its [broadcastable / receivable](broadcastable-receivable.md) functionality:

### Broadcast / Receive

A broadcastable and receivable allow you to (in a [loosely coupled](https://en.wikipedia.org/wiki/Loose_coupling) manner) share data and state between two different areas of your application, keeping them in sync as they are altered.

```javascript
// share this value as 'broadcastable' on the 'someNamespace' namespace
var broadcastable = fw.observable().broadcast('broadcastable', 'someNamespace');

// receive/sync the value 'broadcastable' from the 'someNamespace' namespace
var receivable = fw.observable().receive('broadcastable', 'someNamespace');
// receivable() === undefined

broadcastable('someValue');
// receivable() === 'someValue'
```

For more information see [broadcastables / receivables](broadcastable-receivable.md).

## Lifecycle

Any subscriptions or request handlers setup on a `namespace` will hang around in memory until disposed of.

As you may have seen above, a `subscription` is returned each time you setup a request handler or `subscription`. You can explicitely dispose of a single subscription using its `dispose` method:

```javascript
var subscription = blahNamespace.subscribe('something-happened', function (thisThingHappened) {
  console.log(thisThingHappened);
});

blahNamespace.publish('something-happened', 'this thing happened');
// console logs: 'this thing happened'

// dispose of the subscription handler setup above
subscription.dispose();

blahNamespace.publish('something-happened', 'this thing happened again');
// console does not log anything
```

Another way to dispose of handlers is to dispose of the `namespace` they were created on. Each `namespace` saves a record of each subscriptionn or handler that is setup...so once the `namespace` is disposed it then disposes all of its subscriptions/handlers as well.

```javascript
blahNamespace.subscribe('something-happened', function (thisThingHappened) {
  console.log(thisThingHappened);
});

blahNamespace.publish('something-happened', 'this thing happened');
// console logs: 'this thing happened'

// dispose of the namespace which then disposes its subscription handler setup above
blahNamespace.dispose();

blahNamespace.publish('something-happened', 'this thing happened again');
// console does not log anything
```

!!! Note
    If you are using a `namespace` that is attached to a [viewModel](viewModel-creation.md), [dataModel](dataModel-creation.md), or [router](router-creation.md) then it will also be disposed of when the instance it is attached to is disposed of (and of course, its handlers/subscriptions).

## Tools

### Get the string identifier for a namespace

To get the string identifier of an instantiated `namespace` you call the `getName` method:

```javascript
var blahNamespace = fw.namespace('blah');

console.log(blahNamespace.getName());
// console logs: 'blah'
```
