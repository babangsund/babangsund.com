---
title: "Relay Experimental"
date: "2019-09-01"
excerpt: "Hooks"
published: true
---

The `relay-experimental` package was [recently merged](https://github.com/facebook/relay/commit/b83aace7a95f5fd82cbb30d1f6888bcc4767eeb5) into the Relay `master` branch,
providing us with some much needed insight into how the Relay hooks API will look once it has been released. 

Although we're told an actual release might be a couple of months away, we don't have to wait.
I for one, have never been known as a particularly patient individual.

- [Building Relay from source](#Building-Relay-from-source)
  - [Resolving broken imports](#Resolving-broken-imports)
  - [Packing for distribution](#Packing-for-distribution)
  - [Installing to project](#Installing-to-project)
- [API](#API)
  - [RelayEnvironmentProvider](#RelayEnvironmentProvider)
  - [useRelayEnvironment](#useRelayEnvironment)
  - [fetchQuery](#fetchQuery)
  - [useQuery](#useQuery)
  - [useFragment](#useFragment)
  - [useRefetchableFragment](#useRefetchableFragment)
  - [usePaginationFragment](#usePaginationFragment)

## Building Relay from source

First up, we need to tell Gulp to build the `relay-experimental` package.

> My local fork of Relay is located at `~/relay/`.

Open up `~/relay/gulpfile.js`, and find the `const builds = [...]` declaration.  
At the time of this writing, you will find it at `line 110`.

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

### Resolving broken imports 

There are currently three files containing broken imports:

- `useRelayEnvironment.js`
- `RelayEnvironmentProvider.js`
- `useRefetchableFragmentNode.js`

But no need to worry! These are easily solved.
We will simply open these files and make a quick change.

#### useRelayEnvironment.js

```javascript
// ~/relay/packages/relay-experimental/useRelayEnvironment.js

// line 14
const ReactRelayContext = require('react-relay/ReactRelayContext');
// =>
const {ReactRelayContext} = require('react-relay');
```


#### RelayEnvironmentProvider.js

```javascript
// ~/relay/packages/relay-experimental/RelayEnvironmentProvider.js

// line 15
const ReactRelayContext = require('react-relay/ReactRelayContext');
// =>
const {ReactRelayContext} = require('react-relay');
```

#### useRefetchableFragmentNode.js

First, add `RelayModernRecord` as a public export from `relay-runtime`.

```javascript
// ~/relay/packages/relay-runtime/index.js

// add to imports
const RelayModernRecord = require('./store/RelayModernRecord');

// add to exports
module.exports = {
  Record: RelayModernRecord,
  ...
}
```

Then update the imports as usual.

```javascript
// ~/relay/packages/relay-experimental/useRefetchableFragmentNode.js

// line 536
const RelayModernRecord = require('relay-runtime/store/RelayModernRecord');
// =>
const {Record:RelayModernRecord} = require('relay-runtime');

// line 563
const RelayModernRecord = require('relay-runtime/store/RelayModernRecord');
// =>
const {Record:RelayModernRecord} = require('relay-runtime');


// line 594
const {ID_KEY} = require('relay-runtime/store/RelayStoreUtils');
// =>
const {ID_KEY} = require('relay-runtime');
```

And that's it!
Running `git status` again should now output the following:

```bash
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   gulpfile.js
	modified:   packages/relay-experimental/RelayEnvironmentProvider.js
	modified:   packages/relay-experimental/useRefetchableFragmentNode.js
	modified:   packages/relay-experimental/useRelayEnvironment.js
	modified:   packages/relay-runtime/index.js

no changes added to commit (use "git add" and/or "git commit -a")
```

[I have opened a pull request, so these changes will hopefully become unnecessary in the near future.](https://github.com/facebook/relay/pull/2847)

Now we're ready to compile the source code into consumable production code.  
Navigate to the root of the Relay project and run the following command:

    $ npm run build

This command will run `gulp` with the `gulpfile` configuration we previously edited,
and output compiled files in the `dist` directory, located at the very root of the project.

If you've built Relay from source before, you may need to run the cleanup script first:

    $ npm run build:clean


### Packing for distribution

`relay-experimental` is now ready for distribution.  
Navigate to the folder containing the build, and run `npm pack`:

    $ cd ~/relay/dist/relay-experimental
    $ npm pack

At Facebook, most (if not all?) projects are part of one big monorepo, which essentially means they're all running the latest `master` build.
Since `relay-experimental` was recently ported to Relay open source, it relies on the most recent build.

Therefore, installing `relay-experimental` alone is insufficient,
due to its incompatibility with the overall version `5.0.0` of Relay.
We need to pack `react-relay`,`relay-runtime` and `relay-compiler` as well.

Packing `react-relay`:

    $ cd ~/relay/dist/react-relay
    $ npm pack

Packing `relay-runtime`:

    $ cd ~/relay/dist/relay-runtime
    $ npm pack

Packing `relay-compiler`:

    $ cd ~/relay/dist/relay-compiler
    $ npm pack

Running the `npm pack` command creates a tarball `.tgz`,
producing the exact file that would've been published to npm, had we run `npm publish` instead.
This file can be copied, moved and uploaded however you please.

## Installing to project

Now that we've built and packed `relay-experimental`, `react-relay`, `relay-runtime` and `relay-compiler`, they're ready for installation.
To install them locally, simply navigate to your project and install the packages from path:

    $ npm install ~/relay/dist/relay-experimental/relay-experimental-5.0.0.tgz
    $ npm install ~/relay/dist/react-relay/react-relay-5.0.0.tgz
    $ npm install ~/relay/dist/relay-runtime/relay-runtime-5.0.0.tgz
    $ npm install ~/relay/dist/relay-compiler/relay-compiler-5.0.0.tgz

If you're using third party Relay libraries, you may need to enforce package resolutions for your project:

```javascript
// package.json

{
  "resolutions": {
    "react-relay": "file:../relay/dist/react-relay/react-relay-5.0.0.tgz",
    "relay-runtime": "file:../relay/dist/relay-runtime/relay-runtime-5.0.0.tgz",
    "relay-compiler": "file:../relay/dist/relay-compiler/relay-compiler-5.0.0.tgz",
    "relay-experimental": "file:../relay/dist/relay-experimental/relay-experimental-5.0.0.tgz"
  },
  ...
}
```

Followed by running `npm install`.

Ofcourse, if you're deploying to another machine, you may need to host these packages elsewhere.
Although beyond the scope of this post, suffice to say that any registry (i.e. npmjs,proget) will do.

## Relay version *"not 6.0.0"*

Now that Relay has been upgraded to *"not 6.0.0"*, some import paths have been altered.

I only encountered this problem with `RelayQueryResponseCache`, which as an example has been changed from
`relay-runtime/lib/RelayQueryResponseCache` to `relay-runtime/lib/network/RelayQueryResponseCache`.

Luckily, it has also been added as a module export:

```javascript
import {QueryResponseCache} from 'relay-runtime';
```

Should you encounter a similar issue (but with a different API), I advise you to first try importing it as a module,
and then looking for the new path at `~/relay/dist/<package>/lib/` in case it doesn't exist as a module export.

## API

- [fetchQuery](#fetchQuery)
- [RelayEnvironmentProvider](#RelayEnvironmentProvider)
- [useRelayEnvironment](#useRelayEnvironment)
- [useQuery](#useQuery)
- [useFragment](#useFragment)
- [useRefetchableFragment](#useRefetchableFragment)
- [usePaginationFragment](#usePaginationFragment)

### fetchQuery

Not unlike the v5 iteration of `fetchQuery`, it fetches the given operation in an imperative manner - outside of React.  

This version however, also implements query de-duplication by checking for in-flight requests with matching parameters (query, variables) upon each request.

A RelayObservable is returned by default,
which is a limited implementation of the [ESObservable proposal](https://github.com/tc39/proposal-observable).
The primary benefit of Observable, is the ability to subscribe to updates with a callback in a synchronous manner.

> [I've talked about `RelayObservable` in a previous post.](/what-makes-relay-great)

This implementation of `fetchQuery` function returns a disposable, which can be called to
cancel an in-flight request.

**Example usage:**

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

// cancel the in-flight request
dispose();
```

The RelayObservable from `fetchQuery` can be converted to a Promise, which will instead
resolve to a snapshot of the query data when the *first* (and only first) response is received from the server.

> Converting RelayObservable to a Promise will nullify the returned disposer function.

**Example usage:**

```javascript
fetchQuery(environment, query, variables).then((data) => {
  // do something with data
});
```

It's important to know that unlike `useQuery`, `fetchQuery` does *NOT* retain query data, meaning that it is not guaranteed
that the fetched data will remain in the Relay store after the request has been completed.

To clarify, `fetchQuery` from `relay-experimental` is just like `fetchQuery` from `relay-runtime`,
with the addition of de-duplicating requests and returning an observable which can be cancelled or converted to a promise.

### RelayEnvironmentProvider

Before we can use any hooks, Relay requires access to the `Environment` via a built-in context provider.
This is meant to be done only once, at the very root of your application.

As an example, I've created an arbitrary `Providers` component,
which wraps the entire application with `RelayEnvironmentProvider`.

**Example usage:**

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

This is the same pattern as implemented in [relay-fns](https://github.com/babangsund/relay-fns#usage).
(Yeah it's a shameless plug - sue me.)

### useRelayEnvironment

If you're familiar with React's Context API, `useRelayEnvironment` should require no explanation as to what it does.

Just in case you aren't; It's basically a function that "consumes",
or "captures" the Context value from a parent provider - in this case `environment` from `RelayEnvironmentProvider`.

**Example usage:**

```javascript
import {useRelayEnvironment} from "relay-experimental";

function App() {
  const environment = useRelayEnvironment();
  // do something with environment
}
```

### useQuery

The hook implementation of [QueryRenderer](https://relay.dev/docs/en/query-renderer).

Instead of the `render` callback, this hook will suspend the component upon a request,
which means it will throw a Promise and render a fallback component until data is received.

It takes three unnamed parameters:

- The graphql tagged query.  (i.e. graphql\`\`)
- The GraphQL query variables, in the shape of an object mapping from variable name to value.
- An object containing a set of options:
  - `fetchKey`: String or a number. Acts as a custom cacheKey.
  - `fetchPolicy`: Enum. Setting for how a query may be fetched.
		- `'store-only'`: Returns local data. No request is made.
		- `'store-or-network'`: Returns local data if available, otherwise suspends and makes a request.
		- `'store-and-network'`: Returns local data and then makes a request.
		- `'network-only'`: Always suspends and sends a request, even if data is available locally.
	- `networkCacheConfig`: An object containing settings for how a query response may be cached.
		- `force`: causes a query to be issued unconditionally, irrespective of the
			state of any configured response cache.
		- `poll`: causes a query to live update by polling at the specified interval
			in milliseconds. (This value will be passed to setTimeout.)
		- `liveConfigId`: causes a query to live update by calling GraphQLLiveQuery,
			it represents a configuration of gateway when doing live query
		- `metadata`: user-supplied metadata.
		- `transactionId`: a user-supplied value, intended for use as a unique id for
			a given instance of executing an operation.

**Example usage:**

Make sure we have a `React.Suspense` boundary in place.

```jsx{5}
// App.js

function App() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <TodoList />
    </React.Suspense>
  );
}
```

And then use `useQuery` to request some data.

```jsx
// TodoList.js

import {graphql} from 'react-relay';
import {useQuery} from 'relay-experimental';

function TodoList(props) {
  const data = useQuery(
    graphql`
      query TodoListQuery {
        viewer {
          todos {
            id
            ...TodoItemFragment
          }
        }
      }
    `);

  return data.todos.map(todo => (
    <TodoItem todo={todo} />
  ));
}
```

Because of suspension, we never have to worry about data being null.  
Once the component is rendered, the request sent by `useQuery` will have been resolved.

I'm happy to say that `useQuery` replaces the need for `useLocalQuery` from [react-relay-local-query](https://github.com/babangsund/react-relay-local-query).

**Example usage:**

If you recall, `fetchPolicy` value `store-only` does not send a request.
We will use this to acquire local data from the Relay store.

```jsx{14}
// UserSettings.js

import {graphql} from 'react-relay';
import {useQuery} from 'relay-experimental';

function UserSettings(props) {
  const data = useQuery(
    graphql`
      query UserSettingsQuery {
        someClientSchemaField
      }
    `,
    null,
    { fetchPolicy: 'store-only' });

	return <div>{data.someClientSchemaField}</div>;
}
```

### useFragment

The hook implementation of [createFragmentContainer](https://relay.dev/docs/en/classic/fragment-container#createfragmentcontainer).

It takes two unnamed parameters:

- The graphql tagged fragment.  (i.e. graphql\`\`)
- The data prop containing the fragment spread.

**Example usage:**

The fragment is spread inside a query, and is then passed to a child.

```jsx{7,13,20}
// TodoList.js

import {graphql} from 'react-relay';
import {useQuery} from 'relay-experimental';

function TodoList(props) {
  const data = useQuery(
    graphql`
      query TodoListQuery {
        viewer {
          todos {
            id
            ...TodoItemFragment
          }
        }
      }
    `);

    return data.todos.map(todo => (
      <TodoItem todo={todo} />
    ));
}
```

The component requesting this fragment will then consume the data fragment from props (referred to as a fragmentRef),
and subscribe to future data.

```jsx{13}
// TodoItem.js

import {graphql} from 'react-relay';
import {useFragment} from 'relay-experimental';

function TodoItem(props) {
  const todo = useFragment(graphql`
    fragment TodoItemFragment on Todo {
      id
      name
    }
  `,
  props.todo);
}
```

The subscribed fragment will update the component either if it receives an update from the Relay store indicating that the data
the component is directly subscribed to has changed, or if the fragment refs point to different records, OR if the context environment has changed.

### useRefetchableFragment

The hook implementation of [createRefetchContainer](https://relay.dev/docs/en/classic/refetch-container#createrefetchcontainer).

Just like `useFragment`, it takes two unnamed parameters:

- The graphql tagged fragment.  (i.e. graphql\`\`)
- The data prop containing the fragment spread.

A `useRefetchableFragment` fragment requires the `@refetchable` GraphQL directive.
This directive takes the `queryName` parameter, which is the name of the generated query used by Relay when refetching the fragment.

The `@refetchable` directive can only be used on the Query type, Viewer type, Node type, or types implementing Node.

`useRefetchableFragment` returns an array which contains two values.
- The data consumed and returned by the fragment.
- `refetch`: Function to restart the pagination on the connection.
  Disposes in-flight pagination queries before refetching. Takes two parameters.
    - The GraphQL query variables, in the shape of an object mapping from variable name to value.
    - An object containing a set of options:
      - `fetchPolicy`: Enum. Setting for how a query may be fetched.
          - `'store-only'`: Returns local data. No request is made.
          - `'store-or-network'`: Returns local data if available, otherwise suspends and makes a request.
          - `'store-and-network'`: Returns local data and then makes a request.
          - `'network-only'`: Always suspends and sends a request, even if data is available locally.
      - `onComplete` Function called when the new page has been fetched.
      If an error occurred during refetch, this function will receive that error as an argument.

**Example usage:**

```jsx{9}
// TodoItem.js

import {graphql} from 'react-relay';
import {useRefetchableFragment} from 'relay-experimental';

function TodoItem(props) {
  const [todo, refetch] = useRefetchableFragment(graphql`
    fragment TodoItemFragment on Todo 
    @refetchable(queryName: "TodoItemFragmentRefetchQuery") {
      text
      isComplete
    }
  `, props.todo);

  // refetch the fragment
  refetch({ id: "id:2" }, { onComplete: (error) => console.info("Maybe success!") });
}
```

Upon a refetch call, **this component will suspend**, which currently results in a very sketchy user experience.
It is expected that the upcoming release of React will ship with a solution to this issue
(Which is probably also why this version of Relay has yet to be officially released).

When the refetch request completes, the query fragment is extracted from the response,
which will point to the refetch query as its owner.

~~**Note:** The path to the refetch query generated by `relay-compiler` is currently broken, but is hopefully fixed very soon.
[This pull request has been submitted as a possible solution](https://github.com/facebook/relay/pull/2846).~~ **Merged!**

### usePaginationFragment

The hook implementation of [createPaginationContainer](https://relay.dev/docs/en/classic/pagination-container#createpaginationcontainer).

Just like `useFragment` and `useRefetchableFragment` it takes two unnamed parameters:

- The graphql tagged fragment.  (i.e. graphql\`\`)
- The data prop containing the fragment spread.

Unlike `createPaginationContainer`, `usePaginationFragment` will provide most of the pagination functionality for you.
No need for a large, somewhat complicated and obscure configuration object. Rejoice!

The `usePaginationFragment` function returns data along with a set of additional functions and values, which provide both backward and forward pagination functionality.

- `data`: The data consumed and returned by the fragment.
- `loadNext`: A function to load the next *n* items, in the `forward` direction. Takes two parameters.
    - The amount *n* of items to fetch.
    - An object containing a set of options:
      - `onComplete` Function called when the new page has been fetched.
      If an error occurred during refetch, this function will receive that error as an argument.
- `loadPrevious`: Same as `loadNext`, except the direction is `backward`.
- `hasNext`: Whether or not there are more items in the `forward` direction.
- `hasPrevious`: Whether or not there are more items in the `backward` direction.
- `isLoadingNext`: Whether or not `loadNext` is in-flight.
- `isLoadingPrevious`: Whether or not `loadPrevious` is in-flight.
- `refetch`: Function to restart the pagination on the connection.
  Disposes in-flight pagination queries before refetching. Takes two parameters.
    - The GraphQL query variables, in the shape of an object mapping from variable name to value.
    - An object containing a set of options:
      - `fetchPolicy`: Enum. Setting for how a query may be fetched.
          - `'store-only'`: Returns local data. No request is made.
          - `'store-or-network'`: Returns local data if available, otherwise suspends and makes a request.
          - `'store-and-network'`: Returns local data and then makes a request.
          - `'network-only'`: Always suspends and sends a request, even if data is available locally.
      - `onComplete` Function called when the new page has been fetched.
      If an error occurred during refetch, this function will receive that error as an argument.

**Example usage:**

`useQuery` is responsible for fetching the `UserFragment` and passes the user fragmentRef to a child.

```javascript
// User.js

import {graphql} from 'react-relay';
import {useQuery} from 'relay-experimental';

function User() {
  const { node } = useQuery(
    graphql`
      query UserQuery(
        $id: ID!
        $last: Int
        $first: Int
        $after: ID
        $before: ID
      ) {
        node(id: $id) {
          ...UserFragment
        }
      }
    `,
    {
      id: '1',
      first: 1,
      last: null,
      before: null,
      after: 'cursor:1',
    });

  return <UserTodos user={node} />
}
```

The `UserFragment` is marked with the `@refetchable` directive, and `todos` with the `@connection` directive.

```javascript{18,26}
// UserTodos.js

import {graphql} from 'react-relay';
import {usePaginationFragment} from 'relay-experimental';

function UserTodos(props) {
  const {
    data,
    loadNext,
    loadPrevious,
    hasNext,
    hasPrevious,
    isLoadingNext,
    isLoadingPrevious,
    refetch,
    } = usePaginationFragment(graphql`
      fragment UserFragment on User
      @refetchable(queryName: "UserFragmentPaginationQuery") {
        id
        name
        todos(
          first: $first,
          last: $last,
          after: $after,
          before: $before,
        ) @connection(key: "UserFragment_todos") {
          edges {
            node {
              id
              ...TodoFragment
            }
          }
        }
      }
    `, props.user);
}
```

As with `useRefetchableFragment`, **this component will suspend** upon a request.

---

## In closing

So, is this commit the best thing that has ever happened to Relay?

*Without a doubt.*

The API has been greatly simplified, and with the introduction of suspense for data fetching, 
you no longer have to infest your code with defensive precautions against nullable data from props.

With this upcoming release, I'd argue that Relay's barrier to entry will have been lowered quite significantly, which has been a major shortcoming of Relay since it was first released.

That being said, `relay-experimental` isn't ready for use in production just yet.  
For the time being, all we can do is wait patiently for the next release of React.
