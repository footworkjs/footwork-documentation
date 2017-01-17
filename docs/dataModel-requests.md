A `dataModel` is a representation of your model from the server. Footwork dataModels have features and capabilities aimed at the management of a record of your data on some sort of remote resource.

## Request Types

* [Create a new record](#create-a-new-record)
* [Read a record](#read-a-record)
* [Update a record](#update-a-record)
* [Delete a record](#delete-a-record)

#### Example DataModel Configured For Requests:

```javascript
function Person (personData) {
  var self = fw.dataModel.boot(this, {
    url: '/person',
    idAttribute: 'id'
  });

  // note the self.id observable is mapped to the idAttribute
  self.id = fw.observable(personData.id).map('id', self);
  self.name = fw.observable(personData.name).map('name', self);
}
```

!!! Note "Requests return promises"
    The following sections outline how to use the API to issue requests related to the `dataModel` you are working with. Footwork utilizes ES6's `fetch` for AJAX internally. If you need to make a generic AJAX request you will want to use `fetch`, for more info on using `fetch` see [ES6 Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).

    It is also important to note that all of the methods used below return an [ES6 Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) and so you can hook into them using standard methods such as `.then()`. For more information see: [ES6 Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

## Create A New Record

To create a record using a `dataModel`:

* It must have a **falsey** value resolved for its mapped `idAttribute` (the falsey value tells Footwork the `dataModel` needs to be created, not updated).
* It must have a valid `url` configured to *create* the record on (see: [url configuration](dataModel-creation.md#url-stringobject)).
* The data you want saved needs to be mapped (see [mapping request data](dataModel-mapping.md)).

Using the [example dataModel](#example-datamodel-configured-for-requests) we instantiate a new instance and provide it a value for the `id`, which if you remember is mapped to the `idAttribute`. This value will be used to construct the `url` when we update the record on the server. We also provide a value for the `name` which is what we want saved:

```javascript
var person = new Person({
  id: 1,
  name: 'Bruce Wayne'
});
```

Since the `id` observable is mapped to the `idAttribute` of our `dataModel` it will be used when we issue the request. Footwork follows a typical REST endpoint schema by appending the `id` of a model to the URL when update a record. So in this case the final request will be to `POST /person/1`.

To create the `dataModel` on the endpoint we call `save` on the instance:

```javascript
var promise = person.save();
```

When `save` is called:

1. The `url` is resolved
1. The mapped `idAttribute` is resolved (and since it is falsey, a *create* request is generated)
1. All of the [mapped observable](dataModel-mapping.md) data is resolved and collected together in the structure the mappings define.
1. A `POST` request is issued in the form of `url/idAttribute` and passed the data (this can be customized with an explicit [url object configuration](dataModel-creation.md#url-configuration-object)).

!!! Note "Request Options"
    * If you need to pass options to the underlying [ES6 fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) call you can do so by passing them into the `dataModel.save` call:

        ```javascript
        person.save({ method: 'POST' });
        ```

    * By default when the request is returned its data is applied to your `dataModel`, you can disable this by passing `writeResponse: false` as an option:

        ```javascript
        person.save({ writeResponse: false });
        ```

## Read A Record

To read (or fetch) a record using a `dataModel`:

* It must have a **non-falsey** value resolved for its mapped `idAttribute` (the non-falsey value tells Footwork where the record is located at and is used in url generation).
* It must have a valid `url` configured to *read* the record from (see: [url configuration](dataModel-creation.md#url-stringobject)).
* The data you want fetched needs to be mapped (so Footwork knows where to write it after retrieving the request data, see [mapping request data](dataModel-mapping.md)).

Using the [example dataModel](#example-datamodel-configured-for-requests) we instantiate a new instance and provide it a value for the `id`, which if you remember is mapped to the `idAttribute`. This value will be used to construct the `url` when we fetch the data from the server:

```javascript
var person = new Person({ id: 1 });
```

Since the `id` observable is mapped to the `idAttribute` of our `dataModel` and we have a simple *string* configured for the `url`, it will be used when we dispatch the fetch request (see [url configuration](dataModel-creation.md#url-stringobject)). Footwork follows a typical REST endpoint schema by appending the `id` of a model to the URL when fetching its data. So in this case the final request will be to `GET /person/1`.

To issue the request we call `fetch` on the `dataModel` instance:

```javascript
var promise = person.fetch();
```

When `fetch` is called:

1. The `url` is resolved
1. The `idAttribute` is resolved
1. A `GET` request is issued in the form of `url/idAttribute` (this can be customized with an explicit [url object configuration](dataModel-creation.md#url-configuration-object)).

In the above example this would generate a request to `GET /person/1`.

At this point Footwork waits for the request to finish. Your endpoint should return an object literal representing the data you want to be written to your `dataModel`. For example, given our `person` instance and the `GET /person/1` request, our endpoint should return something like:

```javascript
{
  id: 1,
  name: 'Bruce Wayne'
}
```

Once the request returns a response, Footwork then takes the [mappings defined](dataModel-mapping.md) and uses that to translate and write the response object back to the `person` instance.

```javascript
// ...after the request finishes:
person.name() === 'Bruce Wayne'
```

Now that the request has finished and the data has been written back to the [mapped observables](dataModel-mapping.md):

* Any UI bound to the `dataModel` would then update automatically.
* Any [subscriptions](observables.md#explicitly-subscribing-to-observables) or [computed observables](computedObservables.md) based on the [mapped observables](dataModel-mapping.md) would also receive updates.

!!! Note "Request Options"
    If you need to pass options to the underlying [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) call you can do so by passing them into the `dataModel.fetch` call:

    ```javascript
    person.fetch({ method: 'POST' });
    ```

## Update A Record

To update a record using a `dataModel`:

* It must have a **non-falsey** value resolved for its mapped `idAttribute` (the non-falsey value tells Footwork the `dataModel` needs to be updated, not created).
* It must have a valid `url` configured to *update* the record on (see: [url configuration](dataModel-creation.md#url-stringobject)).
* The data you want saved needs to be mapped (see [mapping request data](dataModel-mapping.md)).

Using the [example dataModel](#example-datamodel-configured-for-requests) we instantiate a new instance and provide it a value for the `id`, which if you remember is mapped to the `idAttribute`. This value will be used to construct the `url` when we update the record on the server. We also provide a value for the `name` which is what we want saved:

```javascript
var person = new Person({
  id: 1,
  name: 'Bruce Wayne'
});
```

Since the `id` observable is mapped to the `idAttribute` of our `dataModel` it will be used when we issue the request. Footwork follows a typical REST endpoint schema by appending the `id` of a model to the URL when update a record. So in this case the final request will be to `PUT /person/1`.

To update the `dataModel` on the endpoint we call `save` on the instance:

```javascript
var promise = person.save();
```

When `save` is called:

1. The `url` is resolved
1. The mapped `idAttribute` is resolved (and since it is non-falsey, an *update* request is generated)
1. All of the [mapped observable](dataModel-mapping.md) data is resolved and collected together in the structure the mappings define.
1. A `PUT` request is issued in the form of `url/idAttribute` and passed the data (this can be customized with an explicit [url object configuration](dataModel-creation.md#url-configuration-object)).

!!! Note "Request Options"
    * If you need to pass options to the underlying [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) call you can do so by passing them into the `dataModel.save` call:

        ```javascript
        person.save({ method: 'POST' });
        ```

    * By default when the request is returned its data is applied to your `dataModel`, you can disable this by passing `writeResponse: false` as an option:

        ```javascript
        person.save({ writeResponse: false });
        ```

## Delete A Record

To delete (or destroy) a record using a `dataModel`:

* It must have a **non-falsey** value resolved for its mapped `idAttribute` (the non-falsey value tells Footwork where the record is located at and is used in url generation).
* It must have a valid `url` configured to *delete* the record at (see: [url configuration](dataModel-creation.md#url-stringobject)).

Using the [example dataModel](#example-datamodel-configured-for-requests) we instantiate a new instance and provide it a value for the `id`, which if you remember is mapped to the `idAttribute`. This value will be used to construct the `url` when we delete the record on the server:

```javascript
var person = new Person({
  id: 1
});
```

Since the `id` observable is mapped to the `idAttribute` of our `dataModel` it will be used when we issue the request. Footwork follows a typical REST endpoint schema by appending the `id` of a model to the URL when update a record. So in this case the final request will be to `DELETE /person/1`.

To delete the `dataModel` on the endpoint we call `destroy` on the instance:

```javascript
var promise = person.destroy();
```

When `destroy` is called:

1. The `url` is resolved
1. The mapped `idAttribute` is resolved (and since it is non-falsey, an *update* request is generated)
1. A `DELETE` request is issued in the form of `url/idAttribute` (this can be customized with an explicit [url object configuration](dataModel-creation.md#url-configuration-object)).

!!! Note "Request Options"
    If you need to pass options to the underlying [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) call you can do so by passing them into the `dataModel.destroy` call:

    ```javascript
    person.destroy({ method: 'POST' });
    ```

## Handling Errors

For all requests made, the [ES6 Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) created will be passed back to the caller. You can use that to handle any errors that might occur:

```javascript
var promise = myDataModel.fetch(); // example request
promise.then(function (response) {
  if (!response.ok) {
    console.log('Something went wrong with the request:', response.statusText);
  }
}).catch(function (error) {
  console.log('Something else went wrong:', error);
});
```

## Overriding Request Options

A `dataModel` has 3 ways in which you can alter the options passed into the underlying [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) call when a request is made:

* Individually with each request as shown in the above CRUD sections

* As a [configuration option](dataModel-creation.md#fetchoptions-objectcallback)

* On a global `fw.options.fetchOptions` configuration

    You can supply the same fetch options object configuration or callback on `fw.options.fetchOptions` just as you would on a [configuration option](dataModel-creation.md#fetchoptions-objectcallback):

    ```javascript
    fw.options.fetchOptions = fetchOptions: {
      credentials: 'same-origin'
    };
    ```

    By supplying your options here they will be used on *all requests* issued.

!!! Note "Override Priority"
    You can supply fetch options in 3 different ways, they are applied to your requests by mixing them together when the request is generated. This is done by *extending* one onto the other such that the options you supply are used in the following priority (higher ones override lower ones):

    * Individual request options (shown for each [C](#create-a-new-record)[R](#read-a-record)[U](#update-a-record)[D](#delete-a-record) action above)
    * [dataModel configuration options](dataModel-creation.md#fetchoptions-objectcallback)
    * Global `fw.options.fetchOptions` (shown here in this section)

## Altering the Storage Method

By default the storage engine utilizes a RESTful endpoint. All requests are dispatched through `fw.dataModel.sync` which is then proxied through `fw.sync`. You can override the default behavior by providing your own method at either of these two locations.


* action

    The request action (create/read/update/delete).

* dataModel

    Your `dataModel` instance

* options

    Any passed in options

```javascript

```
