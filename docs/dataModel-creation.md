# DataModel Creation and Configuration

A `dataModel` can be thought of as an enhanced [viewModel](viewModel-creation.md). It has all the same capabilities but additionally has features which aid in the management of [RESTful](https://en.wikipedia.org/wiki/Representational_state_transfer) data.

With a `dataModel`, in addition to its [viewModel](viewModel-creation.md) capabilities you can:

* Create a new record on an endpoint
* Retreive data from an endpoint
* Update data on an endpoint
* Delete a record on an endpoint

A typical use case for a `dataModel` is when you want to store/retrieve/delete data on a server, and bind that to your UI with a form.

An example of this might be creating an HTML form which can retrieve and create tickets for a help system. You would bind a `dataModel` to the form and later on might retrieve and display that form back to the user to edit/modify the ticket. A `dataModel` would facilitate the mapping of and retrieval/storage of that data on a [RESTful](https://en.wikipedia.org/wiki/Representational_state_transfer) endpoint.

## Creation

A `dataModel` is a view model object that has been bootstrapped with `fw.dataModel.boot()` by passing it the instance along with an optional configuration:

```javascript
function MyDataModel () {
  var self = fw.dataModel.boot(this, {
    // see Configuration below
  });

  self.someValue = fw.observable();
}
```

In the code above you see the instance bootstrapped as a `dataModel`, the boot method will return a reference to the instance.

## Configuration

When you call `fw.dataModel.boot()` you pass it two parameters, the view model instance/object and an optional configuration object. The configuration for a `dataModel` has the following options:

```javascript
function MyDataModel () {
  // For convenience the boot method returns a reference to the instance.
  var self = fw.dataModel.boot(this, {
    namespace: /* see below */,
    afterRender: /* see below */,
    afterResolve: /* see below */,
    onDispose: /* see below */,
    sequence: /* see below */,
    idAttribute: /* see below */,
    url: /* see below */,
    parse: /* see below */,
    fetchOptions: /* see below */,
    requestLull: /* see below */
  });
}
```

All of these options, are optional...you only have to provide the values required for your applications needs.

* [namespace](#namespace-string) (string)
* [afterRender](#afterrender-callback) (callback)
* [afterResolve](#afterresolve-callback) (callback)
* [onDispose](#ondispose-callback) (callback)
* [sequence](#sequence-integer) (integer | callback)
* [idAttribute](#idattribute-string) (string)
* [url](#url-string-object) (string | object)
* [parse](#parse-callback) (callback)
* [fetchOptions](#fetchoptions-object-callback) (object | callback)
* [requestLull](#requestlull-integer-callback) (integer | callback)

!!! Note "Callback Context"
    All callback functions execute with the context of the `dataModel` instance.

Each of these options and their use is described below:

### namespace (string)

Footwork provides an easy way to logically separate your modules using string-based identifiers. This configuration value is used to set the `dataModel` namespace:

```javascript
namespace: 'MyDataModel'
```

Once your `dataModel` is bootstrapped its namespace is made available as `$namespace` on the object instance:

```javascript
function MyDataModel () {
  fw.dataModel.boot(this, { namespace: 'MyDataModel' });
  this.$namespace.subscribe('someEvent', function () {
    // do something...
  });
}
```

Namespaces in Footwork are a mechanism used to help keep your application [loosely coupled yet highly cohesive](https://thebojan.ninja/2015/04/08/high-cohesion-loose-coupling/). Among other things, namespacing provides hooks for pub/sub communication, [dataModel animation](dataModel-animation.md), as well as [broadcastables / receivables](broadcastable-receivable.md). For more information see [namespaces](namespacing.md).

### afterRender (callback)

This callback is triggered after binding and rendering the `dataModel` with the DOM (but before `afterResolve()` and also before any nested elements are bound/resolved).

It is passed one parameter, the parent DOM element the `dataModel` is bound against.

```javascript
afterRender: function (element) {
  console.info('My element is', element);
}
```

Prospectively you might use this as a way to startup various 3rd party plugins such as those that work with jQuery.

### afterResolve (callback)

This callback is triggered after binding the `dataModel` with the DOM and all nested components/dataModel/etc have been fully resolved as well.

If you are animating a `dataModel` into place then that will only occur once the instance has been resolved. Note that the resolution of your `dataModel` only affects when it is animated into place, it does not affect when it is bound or rendered into the DOM (that occurs as soon as possible). If you are not animating your instances into place then you do not need to worry about when it is resolved. For information on how to use the animation features, see [animating dataModels](dataModel-animation.md).

The `afterResolve` callback is passed one parameter, a **resolve** function. Using the **resolve()** function you tell Footwork when your instance has been resolved. It can be called in three different ways to specify resolution, depending on your needs:

* You can call it nothing to mark the current instance as resolved immediately:

    ```javascript
    afterResolve: function (resolve) {
      resolve(); // now marked as resolved
    }
    ```

* You can pass it a promise which Footwork then waits to be fulfulled or rejected:

    ```javascript
    afterResolve: function (resolve) {
      var myRequest = fetch(/* ... */);
      resolve(myRequest); // marked resolved once myRequest resolves/rejects
    }
    ```

* You can pass it an array of promises which Footwork then waits to be fulfulled or rejected:

    ```javascript
    afterResolve: function (resolve) {
      var requests = [
        fetch(/* ... */),
        fetch(/* ... */)
      ];
      resolve(requests); // marked resolved once all of the requests resolve/reject
    }
    ```

* The resolve callback itself returns a promise which resolves once all promises you pass in have resolved:

    ```javascript
    afterResolve: function (resolve) {
      var requests = [
        fetch(/* ... */),
        fetch(/* ... */)
      ];
      resolve(requests).then(function () {
        console.info('all requests have completed');
      });
    }
    ```

Once your instance has been marked as *resolved* (along with any siblings that may exist), its parent is then informed (if there is one) by calling its `resolve` callback. This continues up the context chain until there are no more left.

!!! Note
    Each instance, once marked *resolved*, will be animated into place if configured to do so (see: [animating dataModels](dataModel-animation.md)).

### onDispose (callback)

This callback is triggered anytime the `dataModel` has its `dispose()` method called. It is passed one parameter, the parent DOM element the `dataModel` is bound against.

```javascript
onDispose: function (element) {
  // custom disposal logic
}
```

Just as with `afterRender` this might be used as an API hook for 3rd party plugins. You would do whatever custom disposal logic you might need here.

!!! Note
    Footwork will trigger `dispose()` automatically if:

    * The `dataModel` was bound with a component that was removed from the DOM
    * The element a `dataModel` was bound against was removed from the DOM

### sequence (integer | callback)

The value provided will cause Footwork to sequence the animations on all `viewModel` instantiated with the same namespace as this one. Essentially this means that if you instantiate a bunch of the same `viewModels` then their animations will all be sequenced with a delay between them being the value provided here. This enables you to easily animate in elements in a pleasing way.

#### Integer Value

```javascript
sequence: 100 // 100 msec between
```

#### Callback Function

This callback is triggered with each new instance:

```javascript
sequence: function () {
  return 100; // 100 msec between
}
```

For more information see [animating dataModels](dataModel-animation.md) and more specifically [sequencing animations](#sequencing-animations).

### idAttribute (string)

This is the attribute used as the primary key (id) of the model. It has the default value of *'id'*:

```javascript
idAttribute: 'id'
```

The `idAttribute` is used primarily for two different purposes:

1. If you provide a simple string `url` configuration then the `idAttribute` is used to *fill-in* the remaining url parameters when needed:
    * As the trailing value added to the `url` when the `dataModel` is being read from the server
    * As the trailing value added to the `url` when the `dataModel` is being updated on the server
    * As the trailing value added to the `url` when the `dataModel` is being deleted on the server
    * See [URL Configuration Object](#url-configuration-object) for more information.

1. The value of your mapped `idAttribute` is used in the `isNew` evaluator. This is a flag indicating whether or not your `dataModel` has been persisted to the server yet. It is based off of whether or not the mapped `idAttribute` is *falsey* or not. A *falsey* value indicates the `dataModel` is new (ie: has no id yet, and must be created).

For more information see: [issuing requests](#issuing-requests).

### url (string | object)

This option specifies the URL to use for RESTful operations.

#### URL String

By providing a *string* value, Footwork will fill in the details for you based on the current request action:

```javascript
url: '/path/to/endpoint'
```

Depending on the desired (CRUD) operation, this will generate different types of requests. The default actions can be modified by specifying a configuration object explicitly.

!!! Note
    The default request actions are shown in the following [URL Object](#url-object) section.

#### URL Object

You can optionally specify an explicit request for a designated action using a URL object configuration (**default requests actions are shown**):

```javascript
url: {
  // if save() is called and the idAttribute resolves to a falsey value
  'create': 'POST /path/to/endpoint',

  // if fetch() is called and the idAttribute resolves to a non-falsey value
  'read': 'GET /path/to/endpoint/:id',

  // if save() is called and the idAttribute resolves to a non-falsey value
  'update': 'PUT /path/to/endpoint/:id',

  // if destroy() is called and the idAttribute resolves to a non-falsey value
  'delete': 'DELETE /path/to/endpoint/:id'
}
```

!!! Note "Action-Specific Callbacks"
    Note that you can also provide individual callbacks for each request action. The callbacks are evaluated each time a request is issued, and are passed any `fetchOptions` that were supplied:

    ```javascript
    url: {
      'create': function (fetchOptions) {
        return 'POST /path/to/endpoint';
      }
    }
    ```

This is how Footwork issues requests for the CRUD operations by default, and it is also how you would alter the requests by more explicitly defining them with an object configuration.

You also might notice the *:id* at the end of some of these request configurations. Footwork has the capability of interpolating any mapped value into a url, and this is done by specifying one or more *:mappedVariable* in the url string.

By default Footwork will append/interpolate the value of the `idAttribute` onto the end of the url if it is needed. The default `idAttribute` configuration value is *id* (see: [idAttribute configuration](#idattribute-string))...so in this case when a request is made the value of the observable mapped to *id* would be resolved and appended to all read, update, and delete requests.

You can of course customize this however you like by instead using an explicit URL configuration object as shown above and specifying the action in a `REQUEST_METHOD /url/to/resource` fashion as shown.

!!! Tip "URL Variable Interpolation"
    Any mapped value can be interpolated into the url:

        function MyDataModel (data) {
          var self = fw.dataModel.boot(this, {
            url: {
              'read': 'GET /path/:folder/:id'
            }
          });

          self.id = fw.observable(data.id).map('id', self);
          self.folder = fw.observable(data.folder).map('folder', self);
        }

        var model = new MyDataModel({
          id: 1,
          folder: 'to/endpoint'
        });

        model.fetch(); // GET /path/to/endpoint/1

    In the example above the mapped `folder` and `id` values will be inserted into the URL when a read request is issued (triggered by a call to fetch). The url is re-evaluated with each request.

### parse (callback)

This callback is run whenever a request returns a response from the server. It is passed the response object as well as the request type, and you should return a response object. Using this you can interject logic between your server and the application, manipulating the data before it is stored in the `dataModel`.

As an example, you could use it to remove a wrapper returned durning a fetch:

```javascript
parse: function (response, requestType) {
  if (requestType === 'read') {
    // return the inner object
    return response.data;
  }
}
```

### fetchOptions (object | callback)

Footwork generates requests using [ES6 Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch), using this parameter you can specify [options passed to the ES6 Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Supplying_request_options) call made when a request is issued. You are able to supply either an object literal or a callback which returns an object literal.

The options object you supply is used to override any options created for the request.

#### Object Literal

```javascript
fetchOptions: {
  credentials: 'same-origin'
}
```

#### Callback Function

This function is passed the `action`, the `dataModel`, and any `options` that were passed during construction of the request:

```javascript
fetchOptions: function (action, dataModel, options) {
  return {
    credentials: 'same-origin'
  };
}
```

!!! Tip "Providing Fetch Options"
    * **Global Request Options**

        If you need to provide request options on a global basis then you can specify them on `fw.options.fetchOptions`:

        ```javascript
        fw.options.fetchOptions = {
          credentials: 'same-origin'
        };
        ```

        For more information see: [Overriding Request Options](dataModel-requests.md#overriding-request-options)

    * **Action Specific Request Options**

        You can provide request options on a per-request basis when using one of the request methods such as `fetch`:

        ```javascript
        dataModel.fetch({ credentials: 'same-origin' });
        ```

        For more information see: [Issuing Requests](dataModel-requests.md)

### requestLull (integer | callback)

A configurable lull-time for the **CRUD** (`isCreating`/`isReading`/`isUpdating`/`isDeleting`) observables on the dataModel.

If a non-zero/falsey value is provided then it will be used to specify a minimum duration the CRUD observables are flipped when a request occurs. A common use for the CRUD observables is to bind them to your UI, using them to provide feedback to the user if a request is occuring.

This value makes it so that (for example) when a user .save()'s a `dataModel` it will not flip-flop the `isUpdating` observable too quickly. Preventing the rapid flip-flop saves the user from having to experience harsh/annoying UI thrashing.

This value defaults to 0 (no delay/lull time).

#### Integer Value

```javascript
requestlull: 100 // minimum lull-time of 100 msec, affects all request types
```

#### Callback Function

This callback is passed the operation type.

```javascript
requestLull: function (requestType) {
  if(requestType === 'read') {
    return 100;
  } else {
    return 200;
  }
}
```

The above example will slow down `read` (fetch/`GET`) operations only 100msec while all others (create, update, destroy) have a longer duration of 200msec. Note that this does not prevent or slow down the request, nor does it keep the data from being written to the `dataModel` once the response is received. It only affects when the CRUD flags are flipped.

For more details on the `isCreating`/`isReading`/`isUpdating`/`isDeleting` (**CRUD**) state observable flags see [Managing Requests and State](#managing-requests-and-state).
