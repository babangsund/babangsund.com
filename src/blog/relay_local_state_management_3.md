---
title: "React to Relay: local state management, part 3"
date: "2019-07-30"
excerpt: "The data-masking crusader"
published: false
---

Every great movie series, is a trilogy.  
This is a law and thus, there are no exceptions.

1. [Introduction - writing a controlled input](/relay_local_state_management)  
2. [Global state - controlling the drawer](/relay_local_state_management_2)  
3. *You are here*.

If you're unfamiliar with state using [Relay](https://relay.dev/), I recommend you take the time to read part 1 and 2, first.  

![back to the future](https://images.unsplash.com/photo-1530981279185-9f0960715267?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=3900&q=80)

When using Relay for state, I generally consider it inadvisable to use it in the context of local component scope.  
React does it very well and on the surface, Relay has very little to offer in comparison.

With that being said, I want to share how I've recently used Relay to drastically simplify a complicated dialog implementation. Reading that, you might be thinking: "How can a dialog be complicated, and how could it possibly warrant the use of something like Relay state"

Well, let's take a look at the specs.

## Specifications

* It can create a `Task`.
* It can edit a `Task`.
* Some inputs are complex, so re-renders may be somewhat expensive.
* Some fields rely on the value of other fields.
* Nothing is saved, until you press *save*.
* You cannot press save, unless all inputs are in a valid.

The schema we will be working with, initially looks like this:

```graphql
type Root {
	node(id: ID!): Node
}

interface Node {
	"""The globally unique Id"""
	id: ID!
}

type Person implements Node {
	id: ID!
	firstName: String!
	lastName: String!
	active: Boolean!
	email: String
	phone: String
}

type Task implements Node {
	id: ID!
	person: Person
}
```

On root, we have a queryable field `node`, which returns the `Node` interface, which is implemented by `Person` and `Task`.

## Speculations

Working with Relay, you want to take advantage of data-masking fragments, whenever possible.

Let's start out, by creating our `QueryRenderer` component.

Because we want to be able to use this dialog for both creating and editing a task, `taskId` is not required.
The schema however, says otherwise:`node(id: ID!)`.

We don't want two queries, so let's use the `@include` directive.

```jsx
// DialogRenderer.js
function DialogRenderer({ taskId }) {
  return (
    <QueryRenderer
      variables={{
        taskId,
        getTask: !!taskId
      }}
      query={graphql`
        query DialogQuery($taskId: ID!) {
          task: node(id: $taskId) @include(if: $getTask) {
            ...DialogContainer
          }
        }
      `}
      render={({ error, props }) => {
        if (error) throw error;
        if (!props) return null;
        return <DialogContainer task={props.task || null} />;
      }}
    />
  );
}
```

If `taskId` has a value, we're telling graphQL to include the task in our query.
If there's a task, we pass it to `DialogContainer`; Otherwise, we just pass null to avoid any warnings from Relay.

Let's take a peek at the `DialogContainer`.

```jsx
function DialogContainer({ task }) {
  return (
    <div>
      <PersonComponent initialPerson={task?.person || null} />
    </div>
  );
}

export default createFragmentContainer(DialogContainer, {
  task: graphql`
    fragment DialogContainer on Task {
      id
      title
      person {
        ...PersonComponent
      }
    }
  `
});
```

Basic stuff. It receives a fragment, and passes the PersonComponent fragment down in the hierarchy.
Let's take a look at the `PersonComponent`.

```jsx
// PersonComponent.js
function PersonComponent({ initialPerson }) {
	const [person, setPerson] = React.useState(initialPerson);

	return (
		<PersonSelect value={person} onChange={setPerson} />
	)
}

export default createFragmentContainer(PersonComponent, {
	initialPerson: graphql`
		fragment PersonComponent on Person {
			id
			firstName
			lastName
			active
			email
			phone
		}`
});
```

The `initialPerson` comes from the fragment provided by the `DialogContainer`, which is used to set the initial state. We've managed leveraged the isolation of Relay's data-masking, as well as local component state to control any future changes.

Great!

But what if we need access to the value of person, outside of `PersonComponent`? 
When we want to save any changes we've made, we're currently unaware of what's changed.

*Hmm*

The answer here is obvious. We need to move person state up in the hierarchy. No problem.

```jsx
// DialogContainer.js
function DialogContainer({ task: initialTask }) {
  const [task, setTask] = React.useState(initialTask || {});
  return (
    <div>
      <PersonComponent person={task?.person || null} setTask={setTask} />
    </div>
  );
}

// PersonComponent.js
const PersonComponent = memo(({ person, setTask }) => {
  return (
    <PersonSelect person={person} onChange={person => setTask(state => ({ ...state, person }))} />
  );
});
```

Now the `person` value is passed down the parent so we can access it here as well.
Notice that we've memoized the `PersonComponent`, since we're assuming it's expensive.

So what's the problem?

## Take off your mask!

There's an issue with our person fragment. Even though we've placed the `task` with `person` in our `DialogContainer`, the data is still masked, so if we try to access any of the properties, we'll be unable to read any of the properties we may need.

This means, that if we want access to any properties on `Person`, we have to place them in the `DialogContainer` fragment.

Let's pretend we need access to the `id` and `firstName` properties from `person`, outside of `PersonComponent`.

```jsx
export default createFragmentContainer(DialogContainer, {
  task: graphql`
    fragment DialogContainer on Task {
      id
      title
      person {
        id
        firstName
        ...PersonComponent
      }
    }
  `
});
```

At this point, you may be wondering why we even bother with fragments in the first place.

The answer, is *Isolation, and reusability*. Whenever I select a `Person` in the context of my dialog, I will need to *know* which fields are required by the `PersonComponent` and it's respective sub-fields.

This can be a harrowing thought - especially if you consider a scenario where you might have a lot of fields, which in turn have a sub-selection of fields of their own.

Let's introduce an additional problem, by adding another field to the `Task` type.  
A list of notes.

```graphql
type Note implements Node {
	id: ID!
	body: String!
	color: String
	tags: [String]
}

type Task implements Node {
	...
	notes: [Note]
}
```

The `Notes` looks component like so:

```jsx
// Notes.js
const Notes = memo(({ notes, setTask }) => {
  function onCreate() { ... }
  function onUpdate() { ... }
  function onDelete() { ... }
  return (
    <div>
      ...
      {notes.map(x => (
        <span key={x.id}>x.body</span>
      ))}
    </div>
  );
});

export default createFragmentContainer(Notes, {
  notes: graphql`
    fragment Notes on Note @relay(plural: true) {
      id
      body
      color
      tags
    }
  `
});
```

And we'll add it to the `DialogContainer`.

```jsx
function DialogContainer({ task: initialTask }) {
  const [task, setTask] = React.useState(initialTask || {});
  return (
    <div>
      <PersonComponent person={task?.person || null} setTask={setTask} />
      <Notes notes={task?.notes || []} setTask={setTask} />
    </div>
  );
}

export default createFragmentContainer(DialogContainer, {
  task: graphql`
    fragment DialogContainer on Task {
      id
      title
      person {
        id
        ...PersonComponent
      }
      notes {
        id
        ...Notes
      }
    }
  `
});
```

The `Notes` component has a fragment which expects a list of `Note` notes, with a selection of fields.
Fair enough. But what what happens when we create a new note on the client, and save it in state?

For example:
```jsx
setTask(state => ({
	...state,
	notes: [...(state.notes || [], { id: Math.random(), body: "" })]
}))
```

I'll tell you what happens.
Relay will be angry with you, and throw a bunch of warnings in your face. 

*So sensitive!*

![roll eyes](https://media.giphy.com/media/Lry6jqqgMf3kk/giphy.gif)

Our *only* option is to remove the `Notes` fragment completely, and move *all* the fields from notes, into the `DialogContainer` fragment.

*Sigh* Fine, Relay - whatever you say.

```jsx
// DialogContainer.js
export default createFragmentContainer(DialogContainer, {
  task: graphql`
    fragment DialogContainer on Task {
      id
      title
      person {
        id
        firstName
        ...PersonComponent
      }
      notes {
        id
        body
        color
        tags
      }
    }
  `
});
```

As you might imagine (which you'll have to, because I don't have all day), a query following this pattern, can get quite large with scale. I should point out, that any scalar fields on `Task`, will also need to be added directly on the soon-to-be mega query.

Let's fast-forward a couple of chapters.

```jsx
// DialogContainer.js
export default createFragmentContainer(DialogContainer, {
  task: graphql`
    fragment DialogContainer on Task {
      id
      title
      dueDate
      isActive
      description
      person {
        id
        firstName
        ...PersonComponent
      }
      attachments {
        id
        fileName
        fileType
        previewUrl
        downloadUrl
      }
      notes {
        id
        body
        color
        tags
        updatedDate
        createdDate
        createdBy {
          id
          firstName
          lastName
          email
        }
        updatedBy {
          id
          firstName
          lastName
          email
        }
      }
    }
  `
});
```

It's getting pretty big, but you know what would make this query infinitely more fun?  
*Nesting!*

Say we need access to the previous task in a series of follow-ups.
Call it `previousTask`.

Since we can't refer to the `DialogContainer` fragment:
```bash
ERROR:
Found a circular reference from fragment 'DialogContainer'.
```

We'll just have to write everything twice, and since we're **unable** to use fragments in some cases, *well*...

```jsx
// DialogContainer.js
export default createFragmentContainer(DialogContainer, {
  task: graphql`
    fragment DialogContainer on Task {
      id
      title
      dueDate
      isActive
      description
      person {
        id
        firstName
        ...PersonComponent
      }
      attachments {
        id
        fileName
        fileType
        previewUrl
        downloadUrl
      }
      notes {
        id
        body
        color
        tags
        updatedDate
        createdDate
        createdBy {
          id
          firstName
          lastName
          email
        }
        updatedBy {
          id
          firstName
          lastName
          email
        }
      }
      previousTask {
        id
        title
        dueDate
        isActive
        description
        person {
          id
          firstName
          ...PersonComponent
        }
        attachments {
          id
          fileName
          fileType
          previewUrl
          downloadUrl
        }
        notes {
          id
          body
          color
          tags
          updatedDate
          createdDate
          createdBy {
            id
            firstName
            lastName
            email
          }
          updatedBy {
            id
            firstName
            lastName
            email
          }
        }
      }
    }
  `
});
```

It's shaping up pretty good. Let's hope *the new guy* is in charge of maintenance, though.

![this is fine](https://media.giphy.com/media/NTur7XlVDUdqM/giphy.gif)

No. **It's not fine**.  
So what's the trick?

## Relay, the data-masking crusader.

The trick is to use fragments.

During the process of creating a new `task`, we don't yet have a `taskId` to use in the `activity: node(id: $taskId)` query, and thus we lose the ability to fetch any data fragments from the server.

But what if we could query a *local* node with fragments? Certainly an idea worth exploring.  
Let's create a new field `temp` in the client schema, which will hold the local data from the dialog.

```graphql
# clientSchema.graphql

extend type Task {
	isNew: Boolean
}

extend type Root {
	temp: Node
}
```

On `Root`, we create `temp` of interface `Node`, meaning it can be anything which implements `Node`.
A `Task`, for instance. We've also added `isNew`, to help us tell new existing tasks apart.

Next, let's make some changes to the `DialogContainer`.

```jsx
// DialogContainer.js
function DialogContainer({ task }) {
  React.useEffect(() => {
    commitLocalUpdate(environment, store => {
      const root = store.getRoot();
      const record = root.getOrCreateLinkedRecord("temp", "Task");

      record.setValue(true, "isNew");
      record.setValue(record.getDataID(), "id");

      // If we're editing, copy all fields to temp
      if (task) {
        const proxy = store.get(task.id);
        record.copyFieldsFrom(proxy);
        record.setValue(false, "isNew");
      }
    });
    return () =>
      // Remove temp on unmount.
      commitLocalUpdate(environment, store => {
        store.delete(
          store
            .getRoot()
            .getLinkedRecord("temp")
            .getDataID()
        );
      });
  });
  // Render all the fields, without passing down data.
  return (
    <div>
      <PersonComponent />
      <Notes />
      <SaveButton />
      <Title />
      <Description />
      <Attachments />
      <PreviousTask />
    </div>
  );
}

export default createFragmentContainer(DialogContainer, {
  task: graphql`
    fragment DialogContainer on Task {
      id
      ...PersonComponent
      ...Notes
      ...Title
      ...Description
      ...Attachments
      ...PreviousTask
      ...SaveButton
    }
  `
});
```

Okay, what just happened?

There's a lot to unpack here.

Using the `React.useEffect`, we get (or create) `temp`, of type `Task`. If we're editing a task, we copy everything we've fetched onto the `temp` record. The return function, is just to make sure we clean up the store upon closing the dialog. The fragment has been reduced to spread a selection of fragments which will be fetched by the QueryRenderer.

Next up, is the Notes component.

Here, we've added a `LocalQueryRenderer`. It works like a regular `QueryRenderer`, except it does **not** send a request to the server, but rather looks up the result in the local store.

It comes from the  [react-relay-local-query-renderer](https://github.com/babangsund/react-relay-local-query-renderer) package.

```jsx
// Notes.js
export default function NotesRenderer() {
  return (
    <LocalQueryRenderer
      query={graphql`
        query NotesQuery {
          __typename
          temp {
            ...Notes
          }
        }
      `}
      render={({ props }) => {
        return !props.temp ? null : <Notes task={props.temp} />;
      }}
    />
  );
}

let id = 0;
const Notes = createFragmentContainer(
  ({ activity }) => {
    const notes = activity.notes || [];

    function onCreate() {
      commitLocalUpdate(environment, store => {
        const temp = store.getRoot().getLinkedRecord("temp");

        const dataID = `client:Note:${id++}`;
        const record = store.create(dataID, "Note");

        record.setValue(dataID, "id");
        record.setValue("", "body");

        temp.setLinkedRecords([...(temp.getLinkedRecords("notes") || []), record], "notes");
      });
    }

    function onUpdate(values) {
      commitLocalUpdate(environment, store => {
        const record = store.get(note.id);
        Object.keys(values).forEach(key => record.setValue(values[key], key));
      });
    }

    function onDelete(note) {
      commitLocalUpdate(environment, store => {
        const temp = store.getRoot().getLinkedRecord("temp");
        temp.setLinkedRecords(
          temp.getLinkedRecords("notes").filter(x => x.getDataID() !== note.id),
          "notes"
        );
      });
    }

    return (
      <div>
        {/* Render some fancy notes */}
        {notes.map(x => (
          <span key={x.id}>x.body</span>
        ))}
      </div>
    );
  },
  {
    task: graphql`
      fragment Notes on Task {
        id
        notes {
          id
          body
          color
          tags
          updatedDate
          createdDate
          createdBy {
            id
            firstName
            lastName
            email
          }
          updatedBy {
            id
            firstName
            lastName
            email
          }
        }
      }
    `
  }
);
```

Updating `temp`, works just like with any other local relay data.
In this example, I use commitLocalUpdate to update the notes accordingly.

I also want you to notice, that we no longer need to memoize the component, since no unnecessary re-renders are being triggered by the parent. Because LocalQueryRenderer is subscribed to any changes on `temp.notes`, updates are pushed ***directly within our local component scope.***

Finally, let's have a look at the save button.

It needs to be able to determine whether it should be disabled or enabled, based on the value of all other inputs in the dialog. While we're at it, let's fetch all the data required for the mutation input.

```jsx
// SaveButton.js

export default function SaveButtonRenderer() {
  return (
    <LocalQueryRenderer
      query={graphql`
        query SaveButtonQuery {
          __typename
          temp {
            ...SaveButton
          }
        }
      `}
      render={({ props }) => {
        return !props.temp ? null : <SaveButton task={props.temp} />;
      }}
    />
  );
}

const SaveButton = createFragmentContainer(
  ({ activity }) => {
    const { id, isNew, title, description, person, notes } = activity;

    const disabled = !person?.id || !title || !description; // you get the idea.

    function onSave() {
      commitMutation(environment, {
        input: {
          ...(isNew ? {} : { id }),
          personId: person.id,
          description,
          title,
          notes
        }
      });
      // save and close dialog
    }

    return <button onClick={onSave}>Save</button>;
  },
  {
    task: graphql`
      fragment SaveButton on Task {
        id
        isNew
        title
        description
        person {
          id
        }
        notes {
          id
          body
          color
          tags
        }
      }
    `
  }
);
```

`SaveButton` queries everything required to send the `create` or `update` mutation, as well as any data it needs to validate the button.

## Are you not entertained?

I'd say we're probably *way* overdue for a recap of what we've actually achieved here.  
Let's review:

1. The QueryRenderer at the top-level is responsible for fetching any initial data,
2. The `DialogContainer` will create `temp` and clone the initial data, should there be any.
3. `DialogContainer` renders all sub-fields, but passes no props, and has no state.
4. Each sub-field is responsible for querying it's own data, via the `LocalQueryRenderer`.
5. Local changes commited to the store, will trigger a re-render of components, subscribed to that field.

On top of that, each field now has a beautiful fragment on `Task`, and `DialogContainer` is just responsible for fetching whatever the children are asking for, without having to know any of the implementation details.

Furthermore, we were able to *remove* all instances of `React.memo`, and achieve `local component state`.
Updates of said state, will be triggered *automagically*, should any changes occur to fields the component uses.

![Mind. Blown.](https://media.giphy.com/media/12AZjJcRGhu9nG/giphy.gifhttps://media.giphy.com/media/12AZjJcRGhu9nG/giphy.gif)

No, **seriously**. The explicit, yet implicit beauty of this pattern *figuratively* blows my mind.  
