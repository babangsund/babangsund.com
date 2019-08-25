---
title: "Relay Environment methods"
date: "2019-08-18"
excerpt: "It's not all useless!"
published: true
---

The [Relay Environment](https://relay.dev/docs/en/relay-environment) exposes a set of methods, which you might find useful,
should you ever find yourself contributing to Relay - or just building cool new stuff on your own.

* [retain](#retain)
* [lookup](#lookup)
* [subscribe](#subscribe)
* [applyUpdate](#applyUpdate)
* [revertUpdate](#revertUpdate)

---

### retain

`environment.retain` is handy if you ever need to tell the Relay garbage collection,
to *retain* some data in a garbage collection cycle.

Input signature:

```javascript
type NormalizationSelector = {|
  +dataID: DataID,
  +node: NormalizationSelectableNode,
  +variables: Variables,
|};
```

`dataID` is the relay id of the record you want to retain.  
`environment.retain` returns a disposable, which can be called to discard the record from the list of *retained* nodes, and schedule a garbage collection cycle.

Example usage:

```javascript{6,9,16}
// with a query
import {getRequest, createOperationDescriptor} from 'relay-runtime';

const request = getRequest(query);
const operation = createOperationDescriptor(request, variables);
const retainDisposable = environment.retain(operation.root);  

// without a query
const retainDisposable = environment.retain({
  dataID,
  variables: {},
  node: { selections: [] }
})

// cleanup
retainDisposable();
```

### lookup

`environment.lookup` returns a snapshot of the most recent data for a given operation.
It is used internally by Relay, as can be seen in the `QueryRenderer` render prop,
where the response data snapshot is passed as `props`.

Input signature:

```javascript
type SingularReaderSelector = {|
  +kind: 'SingularReaderSelector',
  +dataID: DataID,
  +node: ReaderFragment,
  +owner: RequestDescriptor,
  +variables: Variables,
|};
```

Example usage:

```javascript{6}
import {getRequest, createOperationDescriptor} from 'relay-runtime';

const request = getRequest(query);
const operation = createOperationDescriptor(request, variables);

const response = environment.lookup(operation.fragment, operation);
// => response.data
```

`response.data` is of type `SelectorData`, which boils down to `{[key: string]: mixed}`,
which is essentially just an object of unknown shape.

### subscribe

`environment.subscribe` *subscribes* to a provided `Snapshot`, like the one returned by `environment.lookup`.  
The second argument is a callback, which is triggered by the Relay Store whenever there's an update
to the snapshot provided in the first argument.

Upon an update, a new `Snapshot` is passed, which could then be used to, say, update a `QueryRenderer`.

Input signature:

```javascript
snapshot: Snapshot,
callback: (snapshot: Snapshot) => void,
```

`environment.subscribe` returns a disposable, which should be called whenever the subscription calls your callback function.

Example usage:

```javascript{7,13}
import {getRequest, createOperationDescriptor} from 'relay-runtime';

const request = getRequest(query);
const operation = createOperationDescriptor(request, variables);
const response = environment.lookup(operation.fragment, operation);

const subscribeDisposable = environment.subscribe(response, newSnapshot => {
  // do something with newSnapshot
  console.log(newSnapshot.data)
});

// cleanup
subscribeDisposable();
```

### applyUpdate

`environment.applyUpdate` as the name implies, *applies* or *commits* an update to the Relay Store, very much like `commitLocalUpdate`.

Input signature:

```javascript
type OptimisticUpdateFunction = {|
  +storeUpdater: (store: RecordSourceProxy) => void,
|};
```

`environment.applyUpdate` returns a disposable, allowing you to revert any changes made by the `storeUpdater` function.

Example usage:

```javascript{4,7}
function storeUpdater(store) {
  // do something with store
}
const updaterDisposable = environment.applyUpdate({storeUpdater});

// revert
updaterDisposable();
```

### revertUpdate

`environment.revertUpdate` very intuitively, *reverts an update*.

Input signature:

```javascript
type OptimisticUpdateFunction = {|
  +storeUpdater: (store: RecordSourceProxy) => void,
|};
```

Example usage:

```javascript{11}
import {commitLocalUpdate} from 'relay-runtime';

function storeUpdater(store) {
  // do something with store
}

// apply
commitLocalUpdate(environment, storeUpdater);

// revert
environment.revertUpdate(storeUpdater);
```
