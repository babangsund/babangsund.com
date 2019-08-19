---
title: "Relay Environment methods (WIP)"
date: "2019-08-18"
excerpt: "It's not all useless!"
published: true
---

The Relay Environment exposes a set of methods, which you might find useful,
should you ever find yourself contributing to Relay or just building cool stuff on your own.


### retain

`environment.retain` is useful if you ever need to tell the Relay garbage collection,
to *retain* some data in a garbage collection cycle.

Input signature:

```javascript
type NormalizationSelector = {|
  +dataID: DataID,
  +node: NormalizationSelectableNode,
  +variables: Variables,
|};
```

dataID is the ID of the data node you want to retain.  
Example usage:

```javascript{2}
environment.retain({
  dataID,
  variables: {},
  node: { selections: [] }
})
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

```javascript{4}
import {getRequest, createOperationDescriptor} from 'relay-runtime';

const request = getRequest(query);
const operation = createOperationDescriptor(request, latestVariables);

const response = environment.lookup(operation.fragment, operation);
// => response.data
```

### subscribe

Coming soon!

### applyUpdate

Coming soon!

### revertUpdate

Coming soon!
