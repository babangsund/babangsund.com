---
title: "Relay Environment methods, part 2 (WIP)"
date: "2019-08-25"
excerpt: "Re-creating useLocalQuery"
published: true
---

>This post is still being written.

[In my previous post](/relay_environment_methods/), I revealed a set of [Relay](https://relay.dev/) Environment methods.

In this post, I will explain how to use some of them together, by walking through an example.  
We will re-create the `useLocalQuery` hook from the 
[react-relay-local-query](https://github.com/babangsund/react-relay-local-query) repository.

---

Let's start by defining the function, and its received parameters.

```javascript
function useLocalQuery({environment, query, variables}) {
  // ...
}
```

Next up, we'll go ahead and implement `useDeepCompare`. It's basically isEqual from lodash or underscore, in that if checks if two values are equal based on the value, and not necessarily the reference.

```javascript
import areEqual from 'fbjs/lib/areEqual';

function useDeepCompare(value) {
  const latestValue = React.useRef(value);
  if (!areEqual(latestValue.current, value)) {
    latestValue.current = value;
  }
  return latestValue.current;
}
```

And then use it to define `latestVariables`.
Since we're using `useDeepCompare`, we can be sure the value reference isn't changing unnecessarily, and only if the value actually changes.

```javascript{1,4}
import useDeepCompare from './useDeepCompare';

function useLocalQuery({environment, query, variables}) {
  const latestVariables = useDeepCompare(variables);
}
```

Then we use the provided `query` and `latestVariables` to create an `operation`.
An `operation` describes a selector, or the "shape" of a given combination of GraphQL operation(think query, mutation) and variables.

```javascript{2,6-9}
import useDeepCompare from './useDeepCompare';
import {getRequest, createOperationDescriptor} from 'relay-runtime';

function useLocalQuery({environment, query, variables}) {
  const latestVariables = useDeepCompare(variables);
  const operation = useMemo(() => {
    const request = getRequest(query);
    return createOperationDescriptor(request, latestVariables);
  }, [query, latestVariables]);
}
```

refs, forceUpdate

Here we define two refs `dataRef` and `cleanupFnRef`, along with a stateful hook to force a re-render - call it `forceUpdate`, although the name is arbitrary.

- `dataRef` is meant to hold the latest relay data snapshot, and is stored in a reference in order to prevent rendering twice when data changes because of props. (eg. props change -> update, then data change -> update)
- `cleanupFnRef` as the name implies, holds the latest disposer reference.
- `forceUpdate` will allow us to trigger a re-render when the relay subscription returns a new snapsnot.

```javascript{11-13,15}
import useDeepCompare from './useDeepCompare';
import {getRequest, createOperationDescriptor} from 'relay-runtime';

function useLocalQuery({environment, query, variables}) {
  const latestVariables = useDeepCompare(variables);
  const operation = useMemo(() => {
    const request = getRequest(query);
    return createOperationDescriptor(request, latestVariables);
  }, [query, latestVariables]);

  const dataRef = useRef(null);
  const [, forceUpdate] = useState(null);
  const cleanupFnRef = useRef(null);

  return dataRef.current;
}
```

We use `useLayoutEffect` in order to call the `cleanupFnRef`, when the `useLocalQuery` is eventually removed from the DOM.

```javascript{15-20}
import useDeepCompare from './useDeepCompare';
import {getRequest, createOperationDescriptor} from 'relay-runtime';

function useLocalQuery({environment, query, variables}) {
  const latestVariables = useDeepCompare(variables);
  const operation = useMemo(() => {
    const request = getRequest(query);
    return createOperationDescriptor(request, latestVariables);
  }, [query, latestVariables]);

  const dataRef = useRef(null);
  const [, forceUpdate] = useState(null);
  const cleanupFnRef = useRef(null);

  useLayoutEffect(() => {
    const cleanupFn = cleanupFnRef.current;
    return () => {
      cleanupFn && cleanupFn();
    };
  }, [snapshot]);

  return dataRef.current;
}
```

snapshot

```javascript{15-27}
import useDeepCompare from './useDeepCompare';
import {getRequest, createOperationDescriptor} from 'relay-runtime';

function useLocalQuery({environment, query, variables}) {
  const latestVariables = useDeepCompare(variables);
  const operation = useMemo(() => {
    const request = getRequest(query);
    return createOperationDescriptor(request, latestVariables);
  }, [query, latestVariables]);

  const dataRef = useRef(null);
  const [, forceUpdate] = useState(null);
  const cleanupFnRef = useRef(null);

  const snapshot = useMemo(() => {
    let disposed = false;
    function nextCleanupFn() {
      if (!disposed) {
        disposed = true;
        cleanupFnRef.current = null;
      }
    }
    if (cleanupFnRef.current) {
      cleanupFnRef.current();
    }
    cleanupFnRef.current = nextCleanupFn;
  }, [environment, operation]);

  useLayoutEffect(() => {
    const cleanupFn = cleanupFnRef.current;
    return () => {
      cleanupFn && cleanupFn();
    };
  }, [snapshot]);

  return dataRef.current;
}
```

environment.lookup

- `operation.fragment`: a selector intended for use in reading or subscribing to
- the results of the the operation.

```javascript{2,3,19}
const snapshot = useMemo(() => {
  const response = environment.lookup(operation.fragment, operation);
  dataRef.current = response.data;

  let disposed = false;
  function nextCleanupFn() {
    if (!disposed) {
      disposed = true;
      cleanupFnRef.current = null;
    }
  }
  if (cleanupFnRef.current) {
    cleanupFnRef.current();
  }
  cleanupFnRef.current = nextCleanupFn;

  return response;
}, [environment, operation]);
```

environment.retain

- `operation.root`: a selector intended for processing server results or retaining
- response data in the store.

```javascript{5,12}
const snapshot = useMemo(() => {
  const response = environment.lookup(operation.fragment, operation);
  dataRef.current = response.data;

  const retainDisposable = environment.retain(operation.root);

  let disposed = false;
  function nextCleanupFn() {
    if (!disposed) {
      disposed = true;
      cleanupFnRef.current = null;
      retainDisposable.dispose();
    }
  }
  if (cleanupFnRef.current) {
    cleanupFnRef.current();
  }
  cleanupFnRef.current = nextCleanupFn;

  return response;
}, [environment, operation]);
```

environment.subscribe

```javascript{6-9,17}
const snapshot = useMemo(() => {
  const response = environment.lookup(operation.fragment, operation);
  dataRef.current = response.data;

  const retainDisposable = environment.retain(operation.root);
  const subscribeDisposable = environment.subscribe(res, newSnapshot => {
    dataRef.current = newSnapshot.data;
    forceUpdate(dataRef.current);
  });

  let disposed = false;
  function nextCleanupFn() {
    if (!disposed) {
      disposed = true;
      cleanupFnRef.current = null;
      retainDisposable.dispose();
      subscribeDisposable.dispose();
    }
  }
  if (cleanupFnRef.current) {
    cleanupFnRef.current();
  }
  cleanupFnRef.current = nextCleanupFn;

  return response;
}, [environment, operation]);
```

All together

```javascript
import useDeepCompare from './useDeepCompare';
import {getRequest, createOperationDescriptor} from 'relay-runtime';

function useLocalQuery({environment, query, variables}) {
  const latestVariables = useDeepCompare(variables);
  const operation = useMemo(() => {
    const request = getRequest(query);
    return createOperationDescriptor(request, latestVariables);
  }, [query, latestVariables]);

  const dataRef = useRef(null);
  const [, forceUpdate] = useState(null);
  const cleanupFnRef = useRef(null);

  const snapshot = useMemo(() => {
    const response = environment.lookup(operation.fragment, operation);
    dataRef.current = response.data;

    const retainDisposable = environment.retain(operation.root);
    const subscribeDisposable = environment.subscribe(res, newSnapshot => {
      dataRef.current = newSnapshot.data;
      forceUpdate(dataRef.current);
    });

    let disposed = false;
    function nextCleanupFn() {
      if (!disposed) {
        disposed = true;
        cleanupFnRef.current = null;
        retainDisposable.dispose();
        subscribeDisposable.dispose();
      }
    }
    if (cleanupFnRef.current) {
      cleanupFnRef.current();
    }
    cleanupFnRef.current = nextCleanupFn;

    return response;
  }, [environment, operation]);

  useLayoutEffect(() => {
    const cleanupFn = cleanupFnRef.current;
    return () => {
      cleanupFn && cleanupFn();
    };
  }, [snapshot]);

  return dataRef.current;
}
```

Summary
