---
title: "Relay Hooks (WIP)"
date: "2019-09-01"
excerpt: "hooks from relay-experimental"
published: true
---

> This post is currently being written.

## Building relay-experimental

gulpfile...

store => lib/store

build

## useQuery

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

## useFragment

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

## useRefetchableFragment

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
