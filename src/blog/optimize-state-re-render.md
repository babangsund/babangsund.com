---
title: "Optimize state re-rendering"
date: "2019-07-13"
excerpt: "Performance without complexity."
published: true
---

Finding a balance between complexity, readability, and performance in your React application, is important.

Although React is inherently fast, you are likely to encounter times, where you will find yourself having to optimize the re-rendering performance of your application.
This can be especially true if you're working with large amounts of data (Think long lists, large tables) or complex UI interactions (Dnd, animations, etc.).

#### Blinders
In an attempt to solve some of these issues, we may come to find ourselves wearing blinders.

A prime example of this, is when we're using Redux, to manage state in our application.
Redux has been really successful, with one of the main reasons being, that it solved the prop drilling issue.
Along with this solution though, it also led to the common occurrence, of *all* state being stored in **global** redux state.

This has undoubtedly increased the readability of our application, and we're now able to share state between components, simply by using the magical connect function.
Wearing blinders however, we've failed to realize that while readability is up, the complexity of our application has also increased exponentially.
Now that we're using Redux, we have to manage both reducers, actions and dispatch calls. The larger the application gets, the more difficult this becomes to handle.


#### State management
Now, state management is inarguably one of the hardest things about React.
While Redux, Mobx, and all the other state management libraries have attempted, and many indeed succeeded, in providing developers with a better experience, for many applications, complexity has also gone up.
One could definitely argue, that this falls on developer, using a library in a different way that was originally intended, by using them for local state, which React already did well on its own.
I would argue, that the complexity is simply because, we're over-engineering the solution, to local state management.

If all you take away from this article is, that you shouldn't be using Redux or Mobx for local state, that's okay too.

> React has always been great for state management

Even before hooks, React was a really solid state management library, and with the huge improvements to Context, I don't think we'll ever need another library for state.
In fact, I think it allows us to increase performance, while keeping complexity at a minimum - all without hurting readability.

---

### Case in point

Imagine that we're building a form, which needs to hold some state.
When the user confirms, the state will need to be passed on to a parent, via the prop `onConfirm`.

This is a contrived example, meant to display *prop drilling, as highlighted by the code*, and *limited re-render performance*.
Keep in mind that in this case, **we're assuming re-rendenders of our data-input components are expensive**.

* `Form` is the outermost component
* `SomeComponent` holds the `One` child component
* `OtherComponent` holds the `Two` and `Three` components
* `One`, `Two` and `Three`, are meant to display 3 different data inputs, and update handlers.

```jsx{5,6,14,22,23}
function Form({ onConfirm }) {
  const [data, setData] = useState({ one: 1, two: 2, three: 3 });
  return (
    <>
      <SomeComponent one={data.one} onChange={setData} />
      <OtherComponent two={data.two} three={data.three} onChange={setData}/>
    </>
  );
}

function SomeComponent({ one, onChange }) {
  return (
    <div>
      <One one={one} onChange={onChange} />
    </div>
  );
}

function OtherComponent({ two, three, onChange }) {
  return (
    <div>
      <Two two={two} onChange={onChange} />
      <Three two={two} three={three} onChange={onChange} />
    </div>
  );
}

function One({ one, onChange }) {
  return (
    <div onClick={() => onChange(state => ({ ...state, one: state.one + 1 }))}>
      {one}
    </div>
  );
};

function Two({ two, onChange }) {
  return (
    <div onClick={() => onChange(state => ({ ...state, two: state.two + 2 }))}>
      {two}
    </div>
  );
};

function Three({ three, onChange }) {
  return (
    <div onClick={() => onChange(state => ({ ...state, three: state.three + 3 }))}>
      {three}
    </div>
  );
};
```

The first thing you may look to improve, is prop drilling.
To do this, let's create a new Context and consume it, in our leaf data-input components.

```jsx{1,31,40,49}
const DataContext = createContext();

function Form({ onConfirm }) {
  const state = useState({ one: 1, two: 2, three: 3 });
  return (
    <ValueContext.Provider value={state}>
      <SomeComponent />
      <OtherComponent />
    </ValueContext.Provider>
  )
}

function SomeComponent() {
  return (
    <div>
      <One />
    </div>
  );
}

function OtherComponent() {
  return (
    <div>
      <Two />
      <Three />
    </div>
  );
}

function One() {
  const [{ one }, onChange] = useContext(DataContext);
  return (
    <div onClick={() => onChange(state => ({ ...state, one: state.one + 1 }))}>
      {one}
    </div>
  );
};

function Two() {
  const [{ two }, onChange] = useContext(DataContext);
  return (
    <div onClick={() => onChange(state => ({ ...state, two: state.two + 2 }))}>
      {two}
    </div>
  );
};

function Three() {
  const [{ three }, onChange] = useContext(DataContext);
  return (
    <div onClick={() => onChange(state => ({ ...state, three: state.three + 3 }))}>
      {three}
    </div>
  );
};
```

Neat! We just solved prop drilling, and we'll never have to look at it again.

Looking at it from a performance perspective however, this isn't exactly true.
Ideally, we would pass props down to the expensive component, and memoize it:

```jsx
const One = memo(({ one, onChange }) => {
  return (
    <div onClick={() => onChange(state => ({ ...state, one: state.one + 1 }))}>
      {one}
    </div>
  );
});
```

But now, we're back to square one.
For optimum performance, we want to pass props from above, and memoize our component. Readabiliy however, requires us to use context.
Who says we can't have both? Context and props, don't have to be opposite. Let's use them together!

> Use context and props in tandem

To achieve this, we'll need to do two things.

* Split context into two.
* Memoize our components, and pass down the props.

---

### Splitting context

Instead of using a single `DataContext`, we're going to create two separate contexts.
Namely, `DataContext` and `OnChangeContext`. The names of course, are arbitrary.

[Doing so, allows us to consume a different context, depending on whether we want to update or display state.](/optimize-context-re-render)

```jsx{1,2,5,8,9,35,36,46,47,57,58}
const DataContext = createContext();
const OnChangeContext = createContext();

function Form({ onConfirm }) {
  const [data, onChange] = useState({ one: 1, two: 2, three: 3 });
  return (
    <OnChangeContext.Provider value={onChange}>
      <ValueContext.Provider value={data}>
        <SomeComponent />
        <OtherComponent />
      </ValueContext.Provider>
    </OnChangeContext.Provider>
  )
}

function SomeComponent() {
  return (
    <div>
      <One />
    </div>
  );
}

function OtherComponent() {
  return (
    <div>
      <Two />
      <Three />
    </div>
  );
}

function One() {
  const { one } = useContext(DataContext);
  const onChange = useContext(OnChangeContext);
  return (
    <div onClick={() => onChange(state => ({ ...state, one: state.one + 1 }))}>
      {one}
    </div>
  );
};

function Two() {
  const { two } = useContext(DataContext);
  const onChange = useContext(OnChangeContext);
  return (
    <div onClick={() => onChange(state => ({ ...state, two: state.two + 2 }))}>
      {two}
    </div>
  );
};

function Three() {
  const { three } = useContext(DataContext);
  const onChange = useContext(OnChangeContext);
  return (
    <div onClick={() => onChange(state => ({ ...state, three: state.three + 3 }))}>
      {three}
    </div>
  );
};
```

As you can see, this alone does not solve our problem, but we're almost there!

---

### Passing props

In this example, re-rendering our sub-parents `SomeComponent` and `OtherComponent` is acceptable, so we'll use them to consume the data context:


```jsx{17,20,26,29,30,35,44,53}
const DataContext = createContext();
const OnChangeContext = createContext();

function Form({ onConfirm }) {
  const [data, onChange] = useState({ one: 1, two: 2, three: 3 });
  return (
    <OnChangeContext.Provider value={onChange}>
      <ValueContext.Provider value={data}>
        <SomeComponent />
        <OtherComponent />
      </ValueContext.Provider>
    </OnChangeContext.Provider>
  )
}

function SomeComponent() {
  const { one } = useContext(DataContext);
  return (
    <div>
      <One one={one} />
    </div>
  );
}

function OtherComponent() {
  const { two, three } = useContext(DataContext);
  return (
    <div>
      <Two two={two} />
      <Three three={three} />
    </div>
  );
}

const One = memo(({ one }) => {
  const onChange = useContext(OnChangeContext);
  return (
    <div onClick={() => onChange(state => ({ ...state, one: state.one + 1 }))}>
      {one}
    </div>
  );
});

const Two = memo(({ two }) => {
  const onChange = useContext(OnChangeContext);
  return (
    <div onClick={() => onChange(state => ({ ...state, two: state.two + 2 }))}>
      {two}
    </div>
  );
});

const Three = memo(({ three }) => {
  const onChange = useContext(OnChangeContext);
  return (
    <div onClick={() => onChange(state => ({ ...state, three: state.three + 3 }))}>
      {three}
    </div>
  );
});
```

We have achieved top-level state, memoized leaf components, and avoided consecutively passing props through the hierarchy, so we could make use of React.memo.

---

### In closing

In this example, we conveniently had sub-parents which were okay to re-render.
Considering the possibility of a scenario, where you'd have an expensive sub-parent not making use of state, which also held expensive children using state, you could indeed make a man-in-the-middle component, with the sole purpose of consuming our data context.

It could look something like this:

```jsx
const ExpensiveComponent = memo(() => {
  return (
    <div>
      <MiddleComponent />
    </div>
  );
});

function MiddleComponent() {
  const { one } = useContext(DataContext);
  return (
    <One one={one} />
  )
}

const One = memo(({ one }) => {
  const onChange = useContext(OnChangeContext);
  return (
    <div onClick={() => onChange(state => ({ ...state, one: state.one + 1 }))}>
      {one}
    </div>
  );
});

```

It is important to always keep in mind however, the opening statement of this article.
You should always think twice when utilizing patterns like these - because you might just be unnecessarily increasing the complexity of your application.

Keep it simple!
