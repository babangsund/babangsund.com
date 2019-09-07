---
title: "Relay Hooks (WIP)"
date: "2019-09-01"
excerpt: "hooks from relay-experimental"
published: true
---

> This post is currently being written.

The `relay-experimental` package was recently merged into the Relay `master` branch,
providing us with some much needed insight into how the Relay hooks API will look once it has been released. 

Although we're told an actual release might be a couple of months away, we don't have to wait.
I atleast, have never known to be a patient individual.

## Building Relay from source

> My local fork of Relay is located at `~/relay/`.

First up, we need to tell Gulp that we're building the `relay-experimental` package.

Open up `~/relay/gulpfile.js`, and find the `const builds = [...]` declaration.
As of this writing, you will find it at `line 110`.

Inside the `builds` array, we'll add the `relay-experimental` build.
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
  // ...
]
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

Now we're ready to compile the source code into consumable production (or development) code.  
Navigate to the root of the project and run the following command:

    $ npm run build

This command will run `gulp` with the `gulpfile` config we edited previously
and output compiled files in the `dist` directory, located at the root of the project.

If you've built Relay from source before, you may need to run the cleanup script first:

    $ npm run build:clean

### Fix resolutions 

#### useRelayEnvironment

```javascript
// ~/relay/dist/relay-experimental/lib/useRelayEnvironment.js 

// line 15
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

Once the imports have been replaced, `relay-experimental` is ready for distribution.
Navigate to the folder containing the build, and run `npm pack`.

    $ cd ~/relay/dist/relay-experimental
    $ npm pack

At Facebook, many (if not all?) projects are using the master branch in their production builds.
Since `relay-experimental` was recently ported to `relay` open source, it relies on the most recent build from `master`.

This means, that installing `relay-experimental` alone is insufficient,
due to it's incompatibility with version `5.0.0` of `relay`.

Therefore, we need to pack `react-relay` and `relay-runtime` as well.

    $ cd ~/relay/dist/react-relay
    $ npm pack


    $ cd ~/relay/dist/relay-runtime
    $ npm pack

## hooks

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

Enum.

```javascript
'store-only'
'store-or-network'
'store-and-network'
'network-only'
```

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
  const {todo} = useFragment({
    todo: graphql`
      fragment TodoItem on Todo {
        text
        isComplete
      }
    `
  }, props.todo);
}
```

### useRefetchableFragment

```jsx
import {graphql,useRefetchableFragment} from "react-relay";

function TodoItem(props) {
  const [{todo}, refetch] = useRefetchableFragment({
    todo: graphql`
      fragment TodoItem on Todo {
        text
        isComplete
      }
    `
  }, props.todo);

  // refetch the fragment
  refetch(fetchPolicy, onComplete)
}
```
