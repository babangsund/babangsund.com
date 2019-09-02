---
title: "Relay Environment methods, part 2"
date: "2019-08-25"
excerpt: "Implementing useLocalQuery"
published: true
---

[In my previous post](/relay_environment_methods/), I revealed a set of [Relay](https://relay.dev/) Environment methods.

In this post, I will explain how to use some of them in tandem, by walking through an example.  
We will re-create the `useLocalQuery` hook from the 
[react-relay-local-query](https://github.com/babangsund/react-relay-local-query) repository.

If you're unfamiliar with `useLocalQuery`, it's essentially a small hook that utilizes internal Relay methods to implement local queries, meaning GraphQL requests through Relay ***without* *sending a request to the server.***

---

Let's start by defining the function, and its received parameters.

```javascript
function useLocalQuery({environment, query, variables}) {
  // ...
}
```

Next up, we'll go ahead and implement `useDeepCompare`. It implements the functionality of isEqual from lodash or underscore, to check if two values are equal based on the value, and not necessarily the reference.

```javascript
import areEqual from 'fbjs/lib/areEqual';

function useDeepCompare(value) {
  const latestValue = useRef(value);
  if (!areEqual(latestValue.current, value)) {
    latestValue.current = value;
  }
  return latestValue.current;
}
```

And then use it to define `latestVariables`.

Since we're using `useDeepCompare`, we can be sure the value reference only changes if there's an actual change to the variables, preventing unnecessary updates.

```javascript{1,4}
import useDeepCompare from './useDeepCompare';

function useLocalQuery({environment, query, variables}) {
  const latestVariables = useDeepCompare(variables);
}
```

Then, we use the provided `query` and `latestVariables` to create an `operation`.
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

Next, we define two refs `dataRef` and `cleanupFnRef`, along with a stateful hook to force a re-render - call it `forceUpdate`, although the name is arbitrary.

- `dataRef` is meant to hold the latest relay data snapshot, and is stored in a ref in order to prevent rendering twice when data changes because of props. (eg. props change -> update, then data change -> update).
- `cleanupFnRef` as the name implies, holds the latest disposer reference.
- `forceUpdate` will allow us to trigger a re-render when the Relay subscription returns a new snapsnot.

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

We use `useLayoutEffect` in order to call the `cleanupFnRef`, when the `useLocalQuery` hook is eventually unmounted from the DOM.

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

The `snapshot` is responsible for the majority of the hooks functionality.  
It:

- Acquires data from the store, and assigns it to `dataRef`.
- Retains said data in garbage collection.
- Subscribes to the snapshot, and reacts to updates.
- Maintains the `cleanupFnRef`, by disposing and re-assigning on updates.

First up, we declare the `snapshot` variable.
Since we've already covered the `cleanupFnRef`, let's assign it a cleanup function `nextCleanupFn`, and make sure to dispose the current one, should it exist.

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
  }, []);

  useLayoutEffect(() => {
    const cleanupFn = cleanupFnRef.current;
    return () => {
      cleanupFn && cleanupFn();
    };
  }, [snapshot]);

  return dataRef.current;
}
```

Inside snapshot, we use `environment.lookup` to extract the response object from the Relay store, which contains the data we want to return.

- `operation.fragment` is passed as the first argument, which is the selector used by Relay to read and subscribe to the result of a given operation.
- `operation` is passed a second argument, as the "owner" of the fragment.

The data is assigned to `dataRef`.

```javascript{2,3,18}
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

`environment.retain` if you recall, is used to *retain* some data during garbage collection.
This part is critical, since we do not want data to suddenly go missing while we're using it.

- `operation.root` is passed as an argument, which is the selector that points to the data from the response.

The disposable returned by `environment.retain` is added to the cleanupFn,
to make sure data doesn't linger in the store when we're no longer using it.

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

We use `environment.subscribe` to *subscribe* to the snapshot returned by `environment.lookup` from earlier.
The second parameter is the callback, which is called with a new snapshot when the selector from the previous snapshot receives an update. `forceUpdate` is then called, in order to re-render the component.

Once again, we're adding the returned disposer function to the cleanup function.

```javascript{6-9,17}
const snapshot = useMemo(() => {
  const response = environment.lookup(operation.fragment, operation);
  dataRef.current = response.data;

  const retainDisposable = environment.retain(operation.root);
  const subscribeDisposable = environment.subscribe(response, newSnapshot => {
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

And that's all there is to it!
Here is what it looks like, once we staple it all back together:

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
    const subscribeDisposable = environment.subscribe(response, newSnapshot => {
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

Next up, go use it to send some local queries!

Keep in mind, that the Relay compiler still requires you to include a server schema field in the query, even though no request is made to the server.
Ideally, you would use a schema agnostic field, like an introspection field.
