---
title: "What makes Relay great"
date: "2019-07-18"
excerpt: "Is also it's greatest weakness."
published: true
---

When we first started working with React at [Mindworking](https://mindworking.eu/), using graphql in conjunction seemed like an obvious choice for a next-generation web application.
Relay however, wasn't as much of a choice as it would've been today, given Apollo hadn't really gained much traction yet and wasn't as famous, as it is today.

Apollo's documentation is quite thorough, and very beginner-friendly.
For many, this gives Apollo a definite edge, and a low barrier for entry.
In comparison, Relay's documentation seems lacking, and at times just downright incomplete.

You have to figure a lot of things out for yourself.

---

What makes Relay great, may also be what makes the documentation opaque, and difficult for beginners.
It originated as an internal tool at Facebook, which they eventually decided to open-source, so the design is without a doubt with engineering problems at Facebook in mind.
If however, the goals of your application aligns those of Facebook, Relay might be for you.

>Relay is a highly opionionated framework, presumably built around Facebook-scale best-practices.  
>**You** get to build on top of that.

Funnily enough, [Software Engineering Daily released a podcast today, featuring Tom Occhino](https://softwareengineeringdaily.com/2019/07/18/facebook-open-source-management-with-tom-occhino/) who is the engineering director of the React group at Facebook. He shares with us, that this is a very common pattern for open-source tools at Facebook. Which in hindsight is obvious, when you look at something like Relay.

### Beyond the docs

When held up next to Apollo, Relay will seem to be lacking features in comparison.
Using Relay in a complex application, you might find yourself wishing you had chosen Apollo and everything it has to offer.

For a while, **I** felt this way. Considering the size of Relay, I must've missed something? Nope!
When working with Relay, reading the documentation at this point in time, is insufficient if you wish to learn everything the framework is capable of.  

> Reading the source code

One of the things I've found useful, is the `RelayObservable`.  
`RelayObservable` - exported as `Observable` from the `relay-runtime` package, is a limited implementation of the [ESObservable](https://github.com/tc39/proposal-observable).
The gist of it, is that it allows you to subscribe to a stream of data (like from a cache, or a server), which can then be closed at a later time. If you've ever used [RxJS](https://github.com/ReactiveX/RxJS), this will be *very* familiar to you.

#### What is it good for?

Looking at the basic implementation of the [Network Layer](https://relay.dev/docs/en/network-layer), and specifically the `fetchQuery` with a cache implementation, it might look something like this:

```jsx
function fetchQuery(
  operation,
  variables,
  cacheConfig,
) {
  const queryID = operation.text;
  const isMutation = operation.operationKind === 'mutation';
  const isQuery = operation.operationKind === 'query';
  const forceFetch = cacheConfig && cacheConfig.force;

  // Try to get data from cache on queries
  const fromCache = cache.get(queryID, variables);
  if (
    isQuery &&
    fromCache !== null &&
    !forceFetch
  ) {
    return fromCache;
  }

  // Otherwise, fetch data from server
  return fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
  }).then(response => {
    return response.json();
  }).then(json => {
    // Update cache on queries
    if (isQuery && json) {
      cache.set(queryID, variables, json);
    }
    // Clear cache on mutations
    if (isMutation) {
      cache.clear();
    }

    return json;
  });
}
```

This was taken straight from the documentation over at [https://relay.dev](https://relay.dev/docs/en/network-layer).  
Now, how can we use RelayObservable to improve this implementation?

There are a couple of things, to pay attention to here.
When we make a query, we check if it exists in the cache.
If it does - great, we return it.
If it doesn't, we'll make our request, and store the json response. On mutations, you'll notice that the cache is essentially being reset.

The reasoning for this is obvious.  
Had we decided not to clear it, the risk of running into stale data becomes a factor very quickly.

Another approach might be to use the Relay Store via updaters and local commits, to keep our data up-to-date.  
The risk of making a mistake here seems high and maintaining this could become a nightmare at scale.

On the other hand, resetting the cache completely means your users will be looking at spinners a lot more often than would otherwise have been necessary.
This is where the `RelayObservable` comes in handy.

### Implementing it

To make the user experience better we have one simple goal in mind.
*Don't delete data, unless we know it might be stale.*

Let's get started by importing `Observable`.

```jsx
import { Observable } from "relay-runtime";
```

Next we're going to wrap the fetchQuery from the documentation with a function of our own.


```jsx
function fetchQueryOuter(
  operation,
  variables,
  cacheConfig,
) {
  return Observable.create(sink => {
    fetchQuery(operation, variables, cacheConfig, sink);
  });
}
```

Then instead of just returning data from the cache, let's use `sink.next` to push data to the observer.

```jsx{5,12,14,15}
function fetchQuery(
  operation,
  variables,
  cacheConfig,
  sink
) {
  // Try to get data from cache on queries
  const fromCache = cache.get(queryID, variables);
  if (
    isQuery &&
    fromCache !== null
    //&& !forceFetch
  ) {
    //return fromCache;
    sink.next(fromCache);
  }
}
```

Instead of returning out of the function, we're passing data from the cache, if it's available.
Afterwards, we'll go ahead and fetch the most recent data from the server and then update the cache.

```jsx{30,31}
function fetchQuery(
  operation,
  variables,
  cacheConfig,
  sink
) {
  // Otherwise, fetch data from server
  return fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
  }).then(response => {
    return response.json();
  }).then(json => {
    // Update cache on queries
    if (isQuery && json) {
      cache.set(queryID, variables, json);
    }
    // Clear cache on mutations
    if (isMutation) {
      cache.clear();
    }

    //return json
    sink.next(json);
    sink.complete();
}
```

Cool!

So now, we're always returning from the cache if possible, but we're also updating the cache with the latest data and passing it down to the QueryRenderer.
But we're still deleting the cache on mutations. Let's go ahead and fix that.

```jsx{30,31}
function fetchQuery(
  operation,
  variables,
  cacheConfig,
  sink
) {
  // Otherwise, fetch data from server
  return fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
  }).then(response => {
    return response.json();
  }).then(json => {
    // Update cache on queries
    if (isQuery && json) {
      cache.set(queryID, variables, json);
    }
    // Clear cache on mutations
    //if (isMutation) {
    //  cache.clear();
    //}

    //return json
    sink.next(json);
    sink.complete();
}
```

Great. So we're now returning data from the cache right away, and updating it once we get a response from the server.
Data is persisted even when the user is sending mutations. Once we have new data available, we display it to the user.

But now we've encountered another problem.  
Because of these changes, every query now results in a request to the server.

*Not good.*

How can we fix this?
One strategy, is to avoid fetching from server, unless we **know** that the data has *not* been fetched after the most recent mutation.

Let's start by adding two new variables.

* `timeMutated`
* `queryMap`

`timeMutated` will help us keep track of when the last mutation was fired.  
`queryMap` is there to tell us which query is up to date.

```jsx{17,18,19,20}
let timeMutated = null;
const queryMap = {};

function fetchQuery(
  operation,
  variables,
  cacheConfig,
  sink
) {
	const queryID = operation.text;
  // Try to get data from cache on queries
  const fromCache = cache.get(queryID, variables);
  if (
    isQuery &&
    fromCache !== null
  ) {
    sink.next(fromCache);
		if (queryMap[queryID] >= timeMutated) {
			sink.complete();
			return;
		}
  }
}
```

Here, we're saying, that if the value found in `queryMap` is greater than or equal to the `timeMutated`, then we're good.  
Close the observer, start cleanup, and return.

Next up, we'll make sure to update the timestamps once we receive a response from the server:

```jsx{11,27,31,32,33}
let timeMutated = null;
const queryMap = {};

function fetchQuery(
  operation,
  variables,
  cacheConfig,
  sink
) {
	const queryID = operation.text;
	const timestamp = Date.now();
  // Otherwise, fetch data from server
  return fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
  }).then(response => {
    return response.json();
  }).then(json => {
    // Update cache on queries
    if (isQuery && json) {
      queryMap[queryID] = timestamp;
      cache.set(queryID, variables, json);
    }

    if (isMutation) {
      timeMutated = timestamp;
    }

    sink.next(json);
    sink.complete();
}
```

### Putting it all together 

So what's happening now? Let's review the flow.

1. We're returning data from the cache if it's available.
2. If the data was queried after the latest mutation was fired, we stop. Otherwise, we keep going.
3. Once the response from the server comes in, we return the check if it's a mutation or a query.
If it's a query, we update the timestamp for the query in our `queryMap` and set the cache value.
If it's a mutation, we update the `timeMutated` variable instead.
4. Lastly, we push the new data from the server and close the observer stream.

Not bad!  
Let's take another look.

```jsx{1,2,9,21,22,23,24,25,43,44,48,51,52}
let timeMutated = null;
const queryMap = {};

function fetchQuery(
  operation,
  variables,
  cacheConfig,
) {
	const timestamp = Date.now();
  const queryID = operation.text;
  const isMutation = operation.operationKind === 'mutation';
  const isQuery = operation.operationKind === 'query';
  const forceFetch = cacheConfig && cacheConfig.force;

  // Try to get data from cache on queries
  const fromCache = cache.get(queryID, variables);
  if (
    isQuery &&
    fromCache !== null
  ) {
    sink.next(fromCache);
		if (queryMap[queryID] >= timeMutated) {
			sink.complete();
			return;
		}
  }

  // Otherwise, fetch data from server
  return fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
  }).then(response => {
    return response.json();
  }).then(json => {
    // Update cache on queries
    if (isQuery && json) {
      queryMap[queryID] = timestamp;
      cache.set(queryID, variables, json);
    }

    if (isMutation) {
      timeMutated = timestamp;
    }

    sink.next(json);
    sink.complete();
  });
}
```

### Wrapping up

Relay is a solid framework, and you will be rewarded if you're willing to put in the time to learn it, and follow the rules and boundaries that it defines. With Relay, you're well on your way to build a scalable codebase.

Keep in mind, that there is a lot of good to be found outside of the official documentation.

