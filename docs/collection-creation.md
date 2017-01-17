Collections are based off of [observable arrays](observableArrays.md) (and can be used in the same way). The difference being that a collection also has features that enable it to retrieve the items from a remote endpoint and search within the collection more easily.

In all other ways including their [reading](observableArrays.md#reading) and [various utility methods](observableArrays.md#finding-and-manipulating-data) they are the same. And also just like observable arrays you can bind UI and subscribe to them as well.

## Creating Collections

To create a `collection` you use the `fw.collection()` factory, passing it an array of items to store or a configuration object:

* [Array of Items](#array-of-items)

    This is useful if you want to be able to search/find data within the collection and do not need to be able to fetch the list from an endpoint.

    ```javascript
    var people = fw.collection([
      { /* item */ },
      { /* item */ },
      // ...
    ]);
    ```

* [Using a Configuration](#using-a-configuration)

    This is useful if you need to be able to fetch the list from an endpoint.

    ```javascript
    var people = fw.collection({
      url: '/people'
    });

    people.fetch();
    ```

!!! Tip "Best Used For Objects Or Remote Data"
    The use of a collection (as opposed to an [observable array](observableArrays.md), which is what they are based on) really only makes sense if:

    * You are storing objects within it (and want to be able to [search through it](collection-usage.md#finding-data))
    * ...or have that data stored on an endpoint (and want to be able to [retrieve it](collection-usage.md#fetching-data))

    If you do not need either of these features/capabilities, then [observable arrays](observableArrays.md) are more likely the (lighter-weight) storage mechanism you should choose.

### Array of Items

By passing an array of items into the factory you can create a collection with a set of data:

```javascript
var people = fw.collection([
  {
    name: 'Jack',
    age: 35
  },
  {
    name: 'Jill',
    age: 32
  }
]);
```

### Using a Configuration

Using a configuration object you can create a collection which can retrieve its data from an endpoint.

A collection configuration has the following options available:

```javascript
var people = fw.collection({
  url: /* see below */,
  data: /* see below */,
  parse: /* see below */,
  fetchOptions: /* see below */,
  requestLull: /* see below */
});
```

* [url](#url-string-callback) (string | callback)
* [data](#data-array) (array)
* [parse](#parse-callback) (callback)
* [fetchOptions](#fetchoptions-object-callback) (object | callback)
* [requestLull](#requestlull-integer-callback) (integer | callback)

#### url (string / callback)

##### URL String

Providing a string url in the following form means the collection will be fetched via `GET /path/to/endpoint`:

```javascript
url: '/path/to/endpoint'
```

##### URL Callback

If provided, a callback function will be evaluated for each request to retrieve the endpoint. It will be passed any fetch options which were provided:

```javascript
url: function (fetchOptions) {
  return '/path/to/endpoint';
}
```

!!! Tip "Request Method"
    * You can also specify the request method to use by prepending it onto the url (just like with a [dataModel url config](dataModel-creation.md#url-object)), e.g.:

        ```javascript
        url: 'POST /path/to/endpoint'
        ```

    * You can also do this by overriding it in the fetch options directly when issuing the request as well:

        ```javascript
        collection.fetch({ method: 'POST' });
        ```

#### data (array)

Using this option you can initialize the collection with some data along with its configuration:

```javascript
data: [
  {
    name: 'Jack',
    age: 35
  },
  {
    name: 'Jill',
    age: 32
  }
]
```

#### parse (callback)

This callback is run whenever a request returns a response from the server. It is passed the response object, and you should return a response object. Using this you can interject logic between your server and the application, manipulating the data before it is stored in the `collection`.

As an example, you could use it to remove a wrapper returned durning a fetch:

```javascript
parse: function (response, requestType) {
  if (requestType === 'read') {
    // return the inner object
    return response.data;
  }
}
```

#### fetchOptions (object | callback)

Footwork generates requests using [ES6 Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch), using this parameter you can specify [options passed to the ES6 Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Supplying_request_options) call made when a request is issued. You are able to supply either an object literal or a callback which returns an object literal.

The options object you supply is used to override any options created for the request.

##### Object Literal

```javascript
fetchOptions: {
  credentials: 'same-origin'
}
```

##### Callback Function

This function is passed the `action`, the `collection`, and any `options` that were passed during construction of the request:

```javascript
fetchOptions: function (action, collection, options) {
  return {
    credentials: 'same-origin'
  };
}
```

!!! Tip "Global Request Options"
    If you need to provide request options on a global basis then you can specify them on `fw.options.fetchOptions`:

    ```javascript
    fw.options.fetchOptions = {
      credentials: 'same-origin'
    };
    ```

#### requestLull (integer | callback)

A configurable lull-time for requests made for the collection.

If a non-zero/falsey value is provided then it will be used to specify a minimum duration the `collection.isReading` observable is flipped when a request occurs. A common use for the isReading observable is to bind it to the UI to provide feedback to the user if a request is occuring.

This value makes it so that when a .fetch()'s a `collection` it will not flip-flop the `isReading` observable too quickly. Preventing the rapid flip-flop saves the user from having to experience harsh/annoying UI thrashing.

This value defaults to 0 (no delay/lull time).

##### Integer Value

```javascript
requestlull: 100 // minimum lull-time of 100 msec
```

##### Callback Function

If provided, the callback will be evaluated for each request made:

```javascript
requestLull: function () {
  return 200; // minimum lull-time of 200 msec
}
```

!!! Note
    Note that this does not prevent or slow down the request, nor does it keep the data from being written to the `collection` once the response is received. It only affects when (how fast) the `isReading` flag is flipped.

    See [request lull usage](collection-usage.md#request-lull) for more information.
