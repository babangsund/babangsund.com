---
title: "React to Relay: local state management, part 2"
date: "2019-07-24"
excerpt: "Is the drawer open or closed?"
published: true
---

[In my previous post](https://babangsund.com/relay_local_state_management/), I explain how to use [Relay](https://relay.dev/) as a local state management library.

If you haven’t read it yet, I highly recommend doing so *first*.

---

![government](https://miro.medium.com/max/1400/0*x4DFSRHRY_uT2ZqT)

In this post, we will explore how an implementation of this concept might look in a more realistic scenario than in my previous controlled input example.

## Global state

A common use-case for global state is the theme and another could be whether a side-menu - the drawer, is open or closed.
In this post we will implement global state to control the latter.

Our folder structure looks like this:

```
application
├── node_modules
├── Environment.js
├── src
│   ├── Header.js
│   ├── Drawer.js
│   ├── Main.js
│   └── index.js
├── README.md
└── package.json
```

The `src/index.js` file looks like this.  
We won't be making any changes to this file.

```jsx
// src/index.js

import React from "react";
import ReactDOM from "react-dom";

import Header from "./Header";
import Drawer from "./Drawer";
import Main from "./Main";

function App() {
  return (
    <div>
      <Header />
      <Drawer />
      <Main />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
```

Our goal is to able to update the global state in the `Header` and have the ability to then react to that change in the `Drawer` and `Main` components.

### Updating the client schema

For starters, we will need to make some new additions to our client-side schema.  
Let's call it `clientSchema.graphql`, and add it to our `src` directory.

```graphql
# src/clientSchema.graphql

type Settings {
    isDrawerOpen: Boolean!
}

extend type Query {
    settings: Settings!
}
```

We've created a new type `Settings`, and added a new field `isDrawerOpen: Boolean!`.  
The root `Query`, has been extended with a new field `settings` of type `Settings!`.

### Setting the initial value

Since our schema specifies that `settings: Settings!` and `isDrawerOpen: Boolean!` are both required fields, we need to set the initial values.
In most cases, you will find yourself wanting to set these anyway.

```javascript{28}
// Environment.js

import {
  Store,
  Network,
  Environment,
  RecordSource,
  commitLocalUpdate
} from "relay-runtime";
import RelayQueryResponseCache from "relay-runtime/lib/RelayQueryResponseCache";

// Make the request, and implement the cache
function fetchQuery(...) {
  ...
}

// Create an instance of Relay Environment
const environment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),  
});

// Set initial values
commitLocalUpdate(environment, store => {
  const fieldKey = "settings";
  const __typename = "Settings";

  const dataID = `client:${__typename}`;
  const record = store.create(dataID, __typename);

  record.setValue(true, "isDrawerOpen");

  environment.retain({
    dataID,
    variables: {},
    node: { selections: [] }
  });

  store.getRoot().setLinkedRecord(record, fieldKey);
});

export default environment;
```

In Relay, it's common practice to append "`client:`" to the type of any client-side fields as an ID, as you’ll notice we’ve done in the example here above.
Then, we created a new  record of type `Settings`, and set the initial `isDrawerOpen` value to `true`.

`environment.retain` is there to prevent Relay from garbage collecting our local record.  
Lastly, we attach the `Settings` record that we've created, onto the root `Query` record.

### Creating a reusable Component

To update the global state, we're going to make use of a `button`.  
We want the label of this button to correspond with the current state.

> I debated whether this should be a query or a fragment, but in the end I decided to leave it as a fragment,  
> in order to demonstrate how it can work in tandem with a server query.

Let's make a reusable component, with a fragment of its own.

```jsx
// src/DrawerButton.js

import React from 'react';
import { commitLocalUpdate } from "relay-runtime";
import { createFragmentContainer } from "react-relay";

import environment from "../Environment";

function DrawerButton({ settings }) {
  const openOrClose = settings.isDrawerOpen ? "Close" : "Open";
  return (
    <button
      onClick={() => {
        commitLocalUpdate(environment, store => {
          const record = store.getRoot().getLinkedRecord("settings");
          record.setValue(!settings.isDrawerOpen, "isDrawerOpen");
        });
      }}
    >
      {openOrClose} the side-menu.
    </button>
  );
}

export default createFragmentContainer(DrawerButton, {
  settings: graphql`
    fragment DrawerButton on Settings {
      isDrawerOpen
    }
  `
});
```

We're using `commitLocalUpdate` to alter Relay's internal records.

`getRoot()` gives us the root `Query` record, and `getLinkedRecord` returns the record we're looking to update.  
On the `settings` record, we toggle the value of `isDrawerOpen` by using `setValue`.

### Put it in the header!

We want our `DrawerButton` component to appear in the `Header`, so let's use the `HeaderQuery` to spread our `DrawerButton` fragment.
The `settings` prop is passed down the `DrawerButton` to provide it with the data it requires.

```jsx
// src/Header.js

import React from "react";
import QueryRenderer from "react-relay";

import DrawerButton from "./DrawerButton";
import environment from "../Environment";

function Header() {
  return (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query HeaderQuery {
          user {
              firstName
          }
          settings {
            ...DrawerButton
          }
        }
      `}
      render={({ error, props }) => {
        if (error) throw error;
        if (!props) return <Spinner />;

        return (
          <header>
            <DrawerButton settings={props.settings} />
            <span>Welcome back, {props.user.firstName}.</span>
          </header>
        );
      }}
    />
  );
}

export default Header;
```

### Just sit back and React.

Next up, we want to react to any changes emitted by the store.  
Let's wrap our `Main` component in a `QueryRenderer` and watch for any changes emitted through `props`.

```jsx
// src/Main.js

import React from "react";
import QueryRenderer from "react-relay";

import environment from "../Environment";

function Main() {
  return (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query MainQuery {
          settings {
            isDrawerOpen
          }
        }
      `}
      render={({ error, props }) => {
        if (error) throw error;
        if (!props) return <Spinner />;

        return (
          <main style={props.settings.isDrawerOpen ? openStyles : closedStyles}>
            This is the main content. Sorry, but we're suffering from content drought!
          </main>
        );
      }}
    />
  );
}

export default Main;
```

Let's do the same in the Drawer, to cover our bases.
The implementation of the two is almost identical, but I didn't want to leave it out just for brevity.

```jsx
// src/Drawer.js

import React from "react";
import QueryRenderer from "react-relay";

import environment from "../Environment";

function Drawer() {
  return (
    <QueryRenderer
      environment={environment}
      query={graphql`
        query DrawerQuery {
          settings {
            isDrawerOpen
          }
        }
      `}
      render={({ error, props }) => {
        if (error) throw error;
        if (!props) return <Spinner />;

        return (
          <div style={props.settings.isDrawerOpen ? openStyles : closedStyles}>
            This is a side-menu
          </div>
        );
      }}
    />
  );
}

export default Drawer;
```

At this point, you might say that we've successfully achieved our goal.
We're able to make changes in the `Header`, via the `DrawerButton` component and we can then React to those changes across our application.

That in itself is actually pretty darn cool. Thumbs up!

![pretty cool](https://media.giphy.com/media/mgqefqwSbToPe/giphy.gif)

But what if the user was to log out, or refresh the page?

*Oops.*

Now our state is gone. If we want it to persist, we oughta store it on the server - right?  
Well, maybe. But there's also the option of putting it in *localStorage*.

### Persist with localStorage

In case you’re not interested in storing anything in the browsers `localStorage`, there isn’t much else to see here, and I don’t want to waste your valuable time.

If that’s you — thanks for reading. `break`;  
Else if this sounds interesting to you, then please read on. `continue`;

---

To get started, let's take another look at setting our initial values.
Instead of always defaulting to the same value, we need to grab the previous value from `localStorage` and use that instead.

First, let's take another look at what `Environment.js` looks like.

```javascript
// Environment.js

import {
  Store,
  Network,
  Environment,
  RecordSource,
  commitLocalUpdate
} from "relay-runtime";
import RelayQueryResponseCache from "relay-runtime/lib/RelayQueryResponseCache";

// Make the request, and implement the cache
function fetchQuery(...) {
  ...
}

// Create an instance of Relay Environment
const environment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),  
});

// Set initial values
commitLocalUpdate(environment, store => {
  const fieldKey = "settings";
  const __typename = "Settings";

  const dataID = `client:${__typename}`;
  const record = store.create(dataID, __typename);

  record.setValue(true, "isDrawerOpen");

  environment.retain({
    dataID,
    variables: {},
    node: { selections: [] }
  });

  store.getRoot().setLinkedRecord(record, fieldKey);
});

export default environment;
```

To use localStorage, we want to alter the `commitLocalUpdate` section.
Rather than always entering `true`, we're going to make a small helper function, to retrieve the value from `localStorage`.

If an error occurs during `JSON.parse`, or nothing was found in storage, we want it to return the default value we provide.
The function looks like this:

```javascript
// Environment.js

function getInitialValue(key, value) {
  try {
    const storedValue = window.localStorage.getItem(key));
    return !storedValue ? value : JSON.parse(storedValue);
  } catch (error) {
    return value;
  }
}
```

Next up, we use the result of `getInitialValue` to determine and set our initial value.

```javascript{9,11}
// Environment.js

commitLocalUpdate(environment, store => {
  const fieldKey = "settings";
  const __typename = "Settings";

  const dataID = `client:${__typename}`;
  const record = store.create(dataID, __typename);
  const initialValue = getInitialValue("Settings.isDrawerOpen", true);

  record.setValue(initialValue, "isDrawerOpen");

  environment.retain({
    dataID,
    variables: {},
    node: { selections: [] }
  });

  store.getRoot().setLinkedRecord(record, fieldKey);
});
```

When we update the value of `isDrawerOpen` in our `DrawerButton`, we need to update `localStorage` as well.  
To make reuse of this functionality easy, let's turn it into a function.

It needs to get the record, and then update that record alongside localStorage.

```javascript
// Environment.js

export function updateLocalSetting(key, value) {
  commitLocalUpdate(environment, store => {
    const record = store.getRoot().getLinkedRecord("settings");
    window.localStorage.setItem(`Settings.${key}`, JSON.stringify(value));
    record.setValue(value, key);
  });
}
```

Just for the sake of clarity - `Environment.js` now looks like this in it's entirety.

```javascript{23-31,40,42,53-60}
// Environment.js

import {
  Store,
  Network,
  Environment,
  RecordSource,
  commitLocalUpdate
} from 'relay-runtime';
import RelayQueryResponseCache from 'relay-runtime/lib/RelayQueryResponseCache';

// Make the request, and implement the cache
function fetchQuery(...) {
  ...
}

// Create an instance of Relay Environment
const environment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),  
});

// Function to return value from localStorage, or our default value.
function getInitialValue(key, value) {
  try {
    const storedValue = window.localStorage.getItem(key));
    return !storedValue ? value : JSON.parse(storedValue);
  } catch (error) {
    return value;
  }
}

// Set initial values from localStorage.
commitLocalUpdate(environment, store => {
  const fieldKey = "settings";
  const __typename = "Settings";

  const dataID = `client:${__typename}`;
  const record = store.create(dataID, __typename);
  const initialValue = getInitialValue("Settings.isDrawerOpen", true);

  record.setValue(initialValue, "isDrawerOpen");

  environment.retain({
    dataID,
    variables: {},
    node: { selections: [] }
  });

  store.getRoot().setLinkedRecord(record, fieldKey);
});

// Function to set value in Relay, and save it to localStorage.
export function updateLocalSetting(key, value) {
  commitLocalUpdate(environment, store => {
    const record = store.getRoot().getLinkedRecord("settings");
    window.localStorage.setItem(`Settings.${key}`, JSON.stringify(value));
    record.setValue(value, key);
  });
}

export default environment;
```

Now let's use the `updateLocalSetting` function we created earlier, to update state in the `DrawerButton`.

```jsx{6,12}
// src/DrawerButton.js

import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';

import { updateLocalSetting } from "../Environment";

function DrawerButton({ settings }) {
  const openOrClose = settings.isDrawerOpen ? "Close" : "Open";
  return (
    <button
      onClick={() => updateLocalSetting("isDrawerOpen", !settings.isDrawerOpen)}
    >
      {openOrClose} the side-menu.
    </button>
  );
}

export default createFragmentContainer(DrawerButton, {
  settings: graphql`
    fragment DrawerButton on Settings {
      isDrawerOpen
    }
  `
});
```

![Woah](https://media.giphy.com/media/3o6gDPXMNxFhvHdcf6/giphy.gif)

And that's all there is to it!

With Relay, we have the ability to store some arbitrary state in the internal store.
We can make changes to this local data on the client, and React to those changes elsewhere in the application.

Since we have full control over the initial values, we can even use something like `localStorage` to persist state in a full refresh of the page.
