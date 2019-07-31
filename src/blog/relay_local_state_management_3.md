---
title: "React to Relay: local state management, part 3"
date: "2019-07-30"
excerpt: "Nesting nested nests"
published: false
---

Every great movie series, is a triology.  
This is a law and thus, there are no exceptions.

1. [Introduction - writing a controlled input](/relay_local_state_management)  
2. [Global state - controlling the drawer](/relay_local_state_management_2)  
3. *You are here*.

If you're unfamiliar with state managment using [Relay](https://relay.dev/), I recommend you take the time to read part 1 and 2, first.  

![back to the future](https://images.unsplash.com/photo-1530981279185-9f0960715267?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=3900&q=80)

When using Relay for state, I generally consider it inadvisible to use it in the context of local component scope.  
React does it very well, and Relay has very little to offer in comparison.

With that being said, I want to share how I've recently used Relay, and how it helped me greatly simplify a complicated dialog architechture.
Reading that, you might be thinking: "How can a dialog be complicated?" - and how could it possibly warrant the use of something like Relay?

Well, let's take a look at the specs.

### Specifications

* It can create an Activity.
* It can edit  an Activity.
* Input fields are determined by a user defined type.
* The type is selected upon creation.
* Some input fields are dynamic, and visually change depending on your selection.  
  Re-renders can be somewhat expensive. We probably want to avoid re-rendering them, unless their input has changed.
* Some inputs, rely on the value of other fields.
* Nothing is saved, until you press *save*.
* You cannot press save, unless the inputs are all valid.

An Activity is an interface for either a Task, or an Appointment.

Working with Relay, you want to take advantage of data-masking fragments, whenever possible.
With local state, this very quickly becomes a difficult thing to accomplish.

One solution, might be to fetch everything with fragments as initial values, and then keep any changes in local component state.
That way, no local values will be passed down, and break the data-masking principle, with the added benefit of limiting state changes to that of the component itself.

Ideally however, we don't want to write two dialogs. One for creating, and one for editing.
When you're creating a new Activity, you have to select a type, and then whatever subfields that type requires.
To avoid having Relay throw a bunch of warnings at us, we would have to pass null in place of a fragment to our fragment components.

To throw a wrench in the matter of isolated local state, we need to keeep in mind, that some fields depend on the input value of other fields, and the save button should always know whether all given inputs are valid.

### Speculations

Knowing that fields may rely on each other, and that the save button should always know all input values, tells us that state should probably be placed at the top-level of our dialog.

Let's start, by doing that.

```jsx
function Dialog() {
  const [activity, setActivity] = React.useState();
  return (
    <div>
      <div>
        // Fields go here
      </div>
      <button>
        Save
      </button>
    </div>
  )
}

```
