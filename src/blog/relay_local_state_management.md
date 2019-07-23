---
title: "Relay: Local state management"
date: "2019-07-23"
excerpt: "It's easy!"
published: true
---

Amongst the shrouds of the Relay source code, there are many a treasure to be found.
One of these treasures is rumoured to be none other, than local state.

Local state? Like a local government?

![government](https://miro.medium.com/max/1400/0*RFsq01F0sIPT4xPe)

*sigh*.

**No**. By local state, I'm referring to reactive state kept in Relay's internal store. [Like one might do in Apollo](https://www.apollographql.com/docs/react/essentials/local-state/)!

In Relay, you quickly get acquainted with how easy it is to retrieve remote data, by using queries and fragments to specify the data your component requires and how to use mutations, to then alter that data on the server.

But what about local data? Things like settings, dark or light theme, whether the modal is open or closed - basically anything you would want or *need* to put in ***global state***.

We *could* use a separate state-management library like Redux, or a multi-store system like Mobx, which we would have to maintain on the side. With the *"new"* Context API, you could even forgo Redux and Mobx entirely, and just create a high-level component, passing down whatever we need through context.

> It's good to have options.

But you don't have to! And it's good to have options.
Would you believe, that Relay actually provides this functionality out of the box? It this were any another framework, I would probably be linking to the documentation on the website and that would be the very abrupt end of this blog post. Fortunately for me, that is not the case.

## Just show me how it's done!

Hey, don't be rude - I'm getting to it!

If you've ever used Relay, you're probably *all too familiar* with the [compilation step](https://relay.dev/docs/en/graphql-in-relay.html#relay-compiler).
You essentially run `relay-compiler` from the bin, with a couple of arguments, in order to convert your `graphql` tagged queries into generated files, which contain runtime artifacts - and types, should you have chosen to do so.

One of the required arguments here, is the `--src` flag, which tells the compiler where your source code lives.
And this is where it get's interesting for us!

### Query local data

Inside this the src directory, which you provided to `relay-compiler`, you need to create a new `.graphql` file.
Let's call it `relayIsAwesome.graphql`, to avoid any confusion.

This schema is what Relay will refer to, as the *"client"* schema. You can put anything you want in this schema, but you probably shouldn't be overwriting your server schema, although I have yet to try this myself.

Inside the client schema, you'll be able to `extend` existing types, and refer to, say - enums.
Let's start by adding a field on the root, and then query it out in a component.

```graphql
extend type Query {
	localValue: String
}
```

```jsx
function MyComponent() {
  return (
    <QueryRenderer
      query={graphql`
        query MyComponentQuery {
          __typename
          localValue
        }
      `}
      render={({ error, props }) => {
        if (error) throw error;
        if (!props) return <Spinner />;
        return <div>{props.localValue}</div>;
      }}
    />
  );
}
```

There's a caveat to what we're doing here. You might've noticed, that we're also asking for the `__typename` field in our query. This means we're actually sending a request to the server, demanding an introspection field.

[Until changes are made](https://github.com/facebook/relay/issues/2471), we will not be able to query local extensions only. If you attempt to compile a query without any server fields, Relay will greet you with a compilation error:
```bash
ERROR:
GraphQLCompilerContext: Unknown document `MyComponentQuery`.
```

There are ways around this issue, but that might be better left for another time. ;-)
In the query above, we're still faced with an issue - the value of `props.localValue` is `undefined`.

### Initial values

We know how to query local data, but we're still starting out with `undefined` as the default value.
I've found, that your best bet here is to simply update the store right after you've instantiated it.

Sticking to our previous example of `localValue: String`, the implementation is really simple:

```javascript
const environment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),
});

commitLocalUpdate(environment, store => {
  store.getRoot().setValue("", "localValue");
});
```

Next time we make a query, the value of `props.localValue` with start out as an empty string instead of `undefined`.

### Imperative local data

If you ever need to use your Relay state outside of a query, this is possible too.

```javascript
import { ROOT_ID } from "relay-runtime";
import environment from "./Environment";

const { localValue } = environment
	.getStore()
	.getSource()
	.get(ROOT_ID);
```

`ROOT_ID` is the dataID, for the root record. Since our `localValue` is on root, this is what we want.
Although we know the value of `ROOT_ID` is `client:root`, importing it from Relay helps keep us safe, should they ever decide to change it.

### Mutating local data

At this point we know how to query local data, and we know how to set an initial value.
But that's not very exciting in itself, so let's take a shot at updating it!

A *classic* example of how to use React state, is the controlled input.
Let's see what that looks like using Relay!

```javascript
import { commitLocalUpdate } from "relay-runtime";
import environment from "./Environment";

function MyComponent() {
  return (
    <QueryRenderer
      query={graphql`
        query MyComponentQuery {
          __typename
          localValue
        }
      `}
      render={({ error, props }) => {
        if (error) throw error;
        if (!props) return <Spinner />;

        return (
          <input
            value={props.localValue || ""}
            onChange={e =>
              commitLocalUpdate(environment, store => {
                store.getRoot().setValue(e.target.value, "localValue");
              })
            }
          />
        );
      }}
    />
  );
}
```

On every change, we're updating the root field `localValue`, with the new value of our input.
Updating the value of `localValue`, will cause Relay to push new `renderProps` down to the `QueryRenderer`, which will cause a re-render, and in turn provide us with the updated value of `localValue`.

The value of `props.localValue` - a field entirely invented by the client, now has whatever value we tell it to, and can react to that change as it occurs in real-time.

![neat](https://media.giphy.com/media/8vtm3YCdxtUvjTn0U3/giphy.gif)

Hopefully, you're [caching](https://relay.dev/docs/en/network-layer#caching) the network request - otherwise you'll be sending a request to the server for every change emitted by the input!

> With great power comes great global state.

Keep in mind, that just because you *can* use Relay for local component state, does **not** mean that you should. This is a job best left to React. [Are you using hooks yet](https://reactjs.org/docs/hooks-intro.html)? If not, you're missing out!

## Conclusion

Using local data in Relay is easy - but then again, everything is easy once you know how.

1. Create a `.graphql` in your `relay-compiler --src` directory and create whatever field you'd like.

2. When fetching local data, it is treated as remote data. You can retrieve it from a `QueryRenderer`, `fetchQuery` or directly via. the store.  You should be using a `QueryRenderer` whenever possible.

3. `commitLocalUpdate` is used to update the value in the store.
