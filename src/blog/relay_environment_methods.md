---
title: "Relay Environment methods (WIP)"
date: "2019-08-18"
excerpt: "It's not all useless!"
published: true
---

The Relay Environment exposes a set of methods, which you might find useful,
should you ever find yourself contributing to Relay or just building cool stuff on your own.


### retain

`environment.retain` is useful, if you ever need to tell the Relay garbage collection,
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

```javascript
environment.retain({
  dataID,
  variables: {},
  node: { selections: [] }
})
```

### lookup

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

```javascript
const request = getRequest(query);
const operation = createOperationDescriptor(request, latestVariables);

const response = environment.lookup(operation.fragment, operation);
```

`response` is a snapshot, which contains the `data` property, which is what is normally passed to the `render`
method, in the `QueryRenderer`.

### subscribe

Coming soon!

### applyUpdate

Coming soon!

### revertUpdate

Coming soon!
