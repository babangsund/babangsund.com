---
title: "Relay Experimental (WIP)"
date: "2019-09-01"
excerpt: "Hooks!"
published: true
---

> This post is currently being written.

The `relay-experimental` package was recently merged into the Relay `master` branch,
providing us with some much needed insight into how the Relay hooks API will look once it has been released. 

Although we're told an actual release might be a couple of months away, we don't have to wait.
I for one, have never been known as a particularly patient individual.

- [Building Relay from source](#Building-Relay-from-source)
  - [Resolving broken imports](#Resolving-broken-imports)
  - [Packing for distribution](#Packing-for-distribution)
  - [Installing to project](#Installing-to-Project)
- [API](#API)
  - [MatchContainer](#MatchContainer)
  - [RelayEnvironmentProvider](#RelayEnvironmentProvider)
  - [useRelayEnvironment](#useRelayEnvironment)
  - [fetchQuery](#fetchQuery)
  - [useQuery](#useQuery)
  - [useFragment](#useFragment)
  - [useRefetchableFragment](#useRefetchableFragment)
  - [usePaginationFragment](#usePaginationFragment)
  - [useLegacyPaginationFragment](#useLegacyPaginationFragment)
  - [useBlockingPaginationFragment](#useBlockingPaginationFragment)

## Building Relay from source

First up, we need to tell Gulp that we're building the `relay-experimental` package.

> My local fork of Relay is located at `~/relay/`.

Open up `~/relay/gulpfile.js`, and find the `const builds = [...]` declaration.  
As of this writing, you will find it at `line 110`.

Inside the `builds` array, we'll add the `relay-experimental` package.  
It should look something like this:

```javascript
// ~/relay/gulpfile.js

const builds = [
  {
    package: 'relay-experimental',
    exports: {
      index: 'index.js',
    },
    bundles: [
      {
        entry: 'index.js',
        output: 'relay-experimental',
        libraryName: 'RelayExperimental',
        libraryTarget: 'umd',
      },
    ],
  },
   ...
];
```

Once done, save the file and close it.
Running `git status` should now output the following:

```bash{4}
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   gulpfile.js

no changes added to commit (use "git add" and/or "git commit -a")
```

Now we're ready to compile the source code into consumable production code.  
Navigate to the root of the project and run the following command:

    $ npm run build

This command will run `gulp` with the `gulpfile` config, which we previously edited,
and output compiled files in the `dist` directory, located at the very root of the project.

If you've built Relay from source before, you may need to run the cleanup script first:

    $ npm run build:clean

### Resolving broken imports 

There are currently three files containing broken imports:

- `useRelayEnvironment.js`
- `RelayEnvironmentProvider.js`
- `useRefetchableFragmentNode.js`

But no need to worry! These are easily solved.
We will simply open these files, and make a quick change.

#### useRelayEnvironment

```javascript
// ~/relay/dist/relay-experimental/lib/useRelayEnvironment.js 

// line 13
var ReactRelayContext = require('react-relay/ReactRelayContext');
// => 
var ReactRelayContext = require('react-relay/lib/ReactRelayContext');
```

#### RelayEnvironmentProvider

```javascript
// ~/relay/dist/relay-experimental/lib/RelayEnvironmentProvider.js 

// line 15
var ReactRelayContext = require('react-relay/ReactRelayContext');
// => 
var ReactRelayContext = require('react-relay/lib/ReactRelayContext');
```

#### useRefetchableFragmentNode

```javascript
// ~/relay/dist/relay-experimental/lib/useRefetchableFragmentNode.js

// line 580, 614
var RelayModernRecord = require('relay-runtime/store/RelayModernRecord');
// => 
var RelayModernRecord = require('relay-runtime/lib/store/RelayModernRecord');

// line 650
var _require5 = require('relay-runtime/store/RelayStoreUtils'),
// =>
var _require5 = require('relay-runtime/lib/store/RelayStoreUtils'),
```

And that's it!
If you know a better(correct-ier?) way to resolve these imports, please let me know!

### Packing for distribution

Once the imports have been replaced, `relay-experimental` is ready for distribution.
Navigate to the folder containing the build, and run `npm pack`:

    $ cd ~/relay/dist/relay-experimental
    $ npm pack

At Facebook, most (if not all?) projects are part of one big monorepo, which essentially means they're all running the latest `master` build.
Since `relay-experimental` was recently ported to Relay open source, it relies on the most recent build from `master`.

For this reason, installing `relay-experimental` alone is insufficient,
due to its incompatibility with version `5.0.0` of Relay.
Let's pack `react-relay` and `relay-runtime`.

Packing `react-relay`:

    $ cd ~/relay/dist/react-relay
    $ npm pack

Packing `relay-runtime`:

    $ cd ~/relay/dist/relay-runtime
    $ npm pack


Running the `npm pack` command creates a tarball `.tgz`,
producing the exact file that would've been published to npm, had we run `npm publish` instead.
This file can be both copied, moved and uploaded however you please.

## Installing to project

Now that we've built and packed `relay-experimental`, `react-relay` and `relay-runtime`, they're ready for installation.
To install them locally, simply navigate to your project and install them from path:

    $ npm install ~/relay/dist/relay-experimental/relay-experimental-5.0.0.tgz
    $ npm install ~/relay/dist/react-relay/react-relay-5.0.0.tgz
    $ npm install ~/relay/dist/relay-runtime/relay-runtime-5.0.0.tgz

*If* you're using third party Relay libraries, you may need enforce package resolutions for your project:

```javascript
// package.json

{
  "resolutions": {
    "react-relay": "file:../relay/dist/react-relay/react-relay-5.0.0.tgz",
    "relay-runtime": "file:../relay/dist/relay-runtime/relay-runtime-5.0.0.tgz",
    "relay-experimental": "file:../relay/dist/relay-experimental/relay-experimental-5.0.0.tgz"
  },
  ...
}
```

Followed by running `npm install`.

Ofcourse, if you're deploying to another machine, you may benefit from hosting these packages elsewhere.
Although beyond the scope of this post, suffice to say that any private registry (i.e. npm,proget) will do.

## Relay version *"not 6.0.0"*

Now that Relay has been upgraded to *"not 6.0.0"*, some import paths have been altered.

I only encountered this problem with `RelayQueryResponseCache`, which has been changed from
`relay-runtime/lib/RelayQueryResponseCache` to `relay-runtime/lib/network/RelayQueryResponseCache`.

Luckily, it has also been added as a module export:

```javascript
import {QueryResponseCache} from 'relay-runtime';
```

Should you encounter a similar issue (but with a different API), I advise you to first try importing it as a module,
and then looking for the new path at `~/relay/dist/<package>/lib/`, should it not exist as a module export.

## API

- [MatchContainer](#MatchContainer)
- [RelayEnvironmentProvider](#RelayEnvironmentProvider)
- [useRelayEnvironment](#useRelayEnvironment)
- [fetchQuery](#fetchQuery)
- [useQuery](#useQuery)
- [useFragment](#useFragment)
- [useRefetchableFragment](#useRefetchableFragment)
- [usePaginationFragment](#usePaginationFragment)
- [useLegacyPaginationFragment](#useLegacyPaginationFragment)
- [useBlockingPaginationFragment](#useBlockingPaginationFragment)

### fetchQuery

Not unlike the v5 iteration of `fetchQuery`, it fetches the given operation
and implements de-duplication of in-flight requests
by checking on-going requests with matching parameters (query, variables) beforehand.

A RelayObservable is returned by default,
which is a limited implementation of the [ESObservable proposal](https://github.com/tc39/proposal-observable).
The primary benefit of Observable, is the ability to subscribe to updates with a synchronous callback.

The `fetchQuery` function returns a disposable, which can be called to
cancel the in-flight request.

Example usage:

```javascript
const dispose = fetchQuery(environment, query, variables).subscribe({
  // Called when network requests starts
  start: (subsctiption) => {},

  // Called after a payload is received and written to the local store
  next: (payload) => {},

  // Called when network requests errors
  error: (error) => {},

  // Called when network requests fully completes
  complete: () => {},

  // Called when network request is unsubscribed
  unsubscribe: (subscription) => {},
});

// cancel the request
dispose();
```

The RelayObservable from `fetchQuery` can be converted to a Promise, which will instead
resolve to a single snapshot of the query data when the *first* (and only first) response is received from the server.

> Converting Observable to a Promise will invalidate the returned disposer function.

Example usage:

```
fetchQuery(environment, query, variables).then((data) => {
  // do something with data
});
```

It's important to know that unlike `useQuery`, `fetchQuery` does *NOT* retain query data, meaning that it is not guaranteed
that the fetched data will remain in the Relay store after the request has been completed.

---

TODO:

### MatchContainer
### useBlockingPaginationFragment

---

### RelayEnvironmentProvider

Before we can use any hooks, Relay requires access to the `Environment` via a built-in context provider.
This is meant to be done only once, at the root of your application.

As an example, I've created an arbitrary `Providers` component,
which wraps the entire application with `RelayEnvironmentProvider`.

```javascript
// Providers.js

import environment from './environment';
import {RelayEnvironmentProvider} from 'relay-experimental';

function Providers() {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <App />
    </RelayEnvironmentProvider>
  );
}
```

### useRelayEnvironment

```javascript
import {useRelayEnvironment} from "relay-experimental";

function App() {
  const environment = useRelayEnvironment();
  // do something with environment
}
```

### useQuery

Input signature:

```javascript
gqlQuery: GraphQLTaggedNode,
variables: $ElementType<TQuery, 'variables'>,
options?: {|
  fetchKey?: string | number,
  fetchPolicy?: FetchPolicy,
  networkCacheConfig?: CacheConfig,
|},
```

#### fetchKey

It can be a string or a number.
Cache key.

#### fetchPolicy

Settings for how a query may be fetched.

- 'store-only'
- 'store-or-network'
- 'store-and-network'
- 'network-only'

#### networkCacheConfig

Settings for how a query response may be cached.

- `force`: causes a query to be issued unconditionally, irrespective of the
  state of any configured response cache.
- `poll`: causes a query to live update by polling at the specified interval
  in milliseconds. (This value will be passed to setTimeout.)
- `liveConfigId`: causes a query to live update by calling GraphQLLiveQuery,
  it represents a configuration of gateway when doing live query
- `metadata`: user-supplied metadata.
- `transactionId`: a user-supplied value, intended for use as a unique id for
  a given instance of executing an operation.

Example usage:

```jsx
import {graphql,useQuery} from "react-relay";

function TodoList(props) {
  const data = useQuery(
    graphql`
      query TodoListQuery {
        viewer {
          todos {
            id
            ...TodoItem
          }
        }
      }
    `);
}
```

### useFragment

Input signature:

```javascript
fragmentInput: GraphQLTaggedNode,
fragmentRef: TKey,
```

Example usage:

```jsx
import {graphql,useFragment} from "react-relay";

function TodoItem(props) {
  const [todo, refetch] = useRefetchableFragment(graphql`
    fragment TodoItem on Todo {
      text
      isComplete
    }
  `, props.data);
}
```

### useRefetchableFragment

Input signature:

```javascript
fragmentInput: GraphQLTaggedNode,
fragmentRef: TKey,
```

Example usage:

```jsx
import {graphql,useRefetchableFragment} from "react-relay";

function TodoItem(props) {
  const [todo, refetch] = useRefetchableFragment(graphql`
    fragment TodoItem on Todo {
      text
      isComplete
    }
  `, props.data);

  // refetch the fragment
  refetch(fetchPolicy, onComplete)
}
```

### usePaginationFragment
### useLegacyPaginationFragment

```javascript
// User.js

function User() {
  const data = useQuery(
    graphql`
      query UserQuery(
        $id: ID!
        $first: Int
        $cursor: ID
      ) {
        node(id: $id) {
          ...UserTodosFragment
        }
      }
    `,
    {
      cursor: "cursor:1",
      first: 5
    });

    return <UserTodos data={data} />
}

// UserTodos.js
function UserTodos(props) {
  const {
    data: fragmentData,
    loadNext,
    loadPrevious,
    hasNext,
    hasPrevious,
    isLoadingNext,
    isLoadingPrevious,
    refetch: refetchPagination,
    } = usePaginationFragment(graphql`
      fragment UserTodosFragment on User
      @refetchable(queryName: "UserTodosPaginationQuery") {
        id
        todos (
          after: $cursor,
          first: $count,
          ) @connection(key: "UserTodos_todos") {
            edges {
              node {
                id
                ...TodoFragment
              }
            }
          }
      }
    `, props.data.node);
}
```
