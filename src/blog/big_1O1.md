---
title: "Big 1O1"
date: "2019-08-11"
excerpt: "An introduction to big O"
published: true
---

Big O.

And no, this post is not about the female orgasm, but rather the mathematical notation, 
often used in computer science to aptly describe the efficiency of any given algorithm, 
by defining how quickly the runtime complexity scales, given an increase of the input size, commonly referred to as *n*.

Why do we need big O?

Say we wrote two different algorithms as a solution to a given problem.
How would we compare them and determine which one is superior?
One could argue, that *this* solution might be better than *that* solution, 
because it's easier to code, easier to maintain, easy to understand or just flat out looks better.
But these *personal* anecdotes aren't very helpful when trying to pick the objectively "better" - more *efficient* solution.
And that's why we have *big O*.

Before diving into big O, it's important to recognize the discrepancy between big O in an academic setting,
and in the software engineering industry at large. 

Big O in a job setting, can seemingly be considered less accurate, and really more of an estimation.  
How so? Well, in academia there are three ways of describing runtimes.

* *Big Omega (Ω)* describes the lower bound of time; the best-case scenario.  
The runtime can never be less than this value.  

* *Big O* is on the opposite end of the spectrum, and describes the upper bound of time; The worst-case scenario.  
The runtime can never be greater than this value.  

* *Big Theta (Θ)* describes an algorithm where Ω and O will asymptotically grow at the same pace.  

In a non-academia environment, you will likely only ever hear of *"big O"*.
For unintuitive reasons however, *"big O"* used in the industry seems closer to the meaning of big Θ, 
than it is to academia's big O, and even so, is still not quite the same.

*Big O always attempts to describe the tightest bounds of the algorithm runtime.*

---

Okay, the description has remained amazingly abstract so far - let's dive into some examples, by exploring some common runtime expressions.

### Constant time `O(1)`

> *"O of 1"*

```javascript
function logLastIndex(array) {
  console.log(array[array.length- 1]);
}
```

Regardless of the length of `array`, the runtime of this function will always remain the same.  
In big O, this is described as a **constant** runtime, notated as `O(1)`, `1` being the constant.

#### Throw away the constant

Because big O only describes the rate of increase, we always throw away the constant.  
For example, an algorithm described as `O(2n)`, actually becomes `O(n)`.

#### Throw away the coefficient

The same is true for any notation coefficient, also commonly referred to as the "non dominant", or "less efficient" term.

```javascript
function logNumbersAndSums(nums) {
  for (const n of nums) {
    console.log(n)
  }

  for (const n of nums) {
    for (const m of nums) {
      console.log(n + m)
    }
  }
}
```

The first loop in this function, has a runtime of `O(n)`. The second nested loop, has a runtime of `O(n^2)`.
Instinctively, you would want to add them together `O(n + n^2)`. In big O however, you drop the first `n`.
Why? Because it's not especially important. We only care about the fastest growing part of the expression.

As with most rules however, there are exceptions.

If there is ever any ambiguity between the inputs of a function, it wouldn't make sense to drop them, when describing the runtime. For instance, given the expression `O(b + a^2)`, it wouldn't make sense to drop `B` like we did in our previous example, since the value of `a` and `b` are different. It's important to acknowledge that both carry relevance in this context.

### Linear time `O(n)`

> *"O of n"*

```javascript
function logAllEntries(array) {
  for (const a of array) {
    console.log(a)
  }
}
```

The runtime of this function is described as *linear*, or `O(a)` where `a` is the length of `array`.  
Whenever the length of `array` increases, the runtime increases linearly at worst.

If you're working with a sequentially iterative loop which spans from `0` to `array.length`, there's a good chance the runtime is `O(n)`.

### Logarithmic time `O(log(n))`

> *"O of log n"*

Logarithms in computer science assume a base of `2`, unlike in mathematics where it is assumed to be `10`.

The Logarithm of a number is the inverse of the exponent, meaning base b of x `log b(x)`, is the exponent to which `b` needs to be raised to obtain `x`.
For example, given `2^3 = 8`, the equivalent logarithm would be `log(8) = 3`, again assuming a base of `2`.

A very common example of a `logarithmic` runtime, is the binary search.  
Each iteration of a node in a balanced tree, chops the amount of work in half - hence, logarithmic.

In the case of javascript, it could be finding a target in a sorted array.
If the value at current index is too big, we cut away the right half and if it's too small, cut away the left.
Rinse and repeat until we find the target.

```javascript
function binarySearch(array, target) {
  let startIndex = 0
  let endIndex = array.length - 1

  while (startIndex <= endIndex) {
    let middleIndex = Math.floor((startIndex + endIndex) / 2)

    if (target === array[middleIndex]) {
      // Return target;
      return array[middleIndex]
    }

    if (target > array[middleIndex]) {
      // Search right side
      startIndex = middleIndex + 1
    }

    if (target < array[middleIndex]) {
      // Search left side
      endIndex = middleIndex - 1
    }
  }
}
```

If doubling the number of entries that you're iterating does not double the amount of work, the runtime complexity is `O(log(n))` where `n` is the number of entries.

### Quasilinear time `O(n log(n))`

> *"O of n log n"*

Common examples of *quasilinear*, or *log-linear* runtime is *quick sort* and *merge sort*.

Given an array, *merge sort* recursively splits the array in half, until it's left with a single entry at the bottom of the tree, which is then compared and worked back up to a single, sorted array.

```javascript
function merge(a, b) {
  if (a.length === 0 && b.length > 0) return b;
  if (b.length === 0 && a.length > 0) return a;

  const [ah, ...at] = a;
  const [bh, ...bt] = b;

  if (ah < bh) return [ah, ...merge(at, b)];
  else return [bh, ...merge(a, bt)];
}

function mergeSort(array) {
  if (array.length < 2) return array;

  const length = array.length / 2;
  const a = array.slice(0, length);
  const b = array.slice(length);

  return merge(rec_msort(a), rec_msort(b));
}
```

Say we're given an array of 8 entries as the input.
Because the log of 8 is 3, we know we'll be doing 3 levels work, or  `O(log(n))`.
For each of these levels, we're required to do a linear amount of work, or `O(n)` amount of work.

Add it together and we're left with `O(n log(n))`.

### Quadratic time `O(n^2)`

> *"O of n-squared"*

Imagine a room full of people. A new person enters the room and is then introduced to everyone else in the room.
This is the commonly referred to, as the *handshake problem*.

*Bubble sort* is common example of quadratic runtime. It iterates through an array, and compares adjacent values which are then swapped, should the first value be greater than the second.
Rinse and repeat.

```javascript
function bubbleSort(array) {
  let sorted = true

  while (sorted) {
    sorted = false
    for (let i = 0; i < array.length; i++) {
      if (array[i] > array[i + 1]) {
        const swap = array[i]
        array[i] = array[i + 1]
        array[i + 1] = swap
        sorted = true
      }
    }
  }

  return array
}
```

In a worst-case scenario, the input `array` would be sorted completely backwards `[8,7,6,5,4,3,2,1]`, and the `for` loop would run for a total of 64 times.
We know this, because the length of the input is 8, and 8x8 = 64. *Quadratic*.

Another *very* common example of `O(n^2)`, is the nested loop.

```javascript
function logPairs(array) {
  for (const n of array) {
    for (const m of array) {
      console.log(n + m)
    }
  }
}
```

Whenever every entry *(what a tongue twister!)* of an array has to interact with every other entry, you're likely dealing with a *quadratic* runtime.

### Exponential time `O(2^n)`

> *"O of 2 to the n"*

Whenever a single entry is added to the input, the runtime significantly increases.
The workload would in fact *double*. Ouch.
This is commonly seen in backtracking problems and recursive solutions, which are calling multiple subsets of itself - i.e. in a *fork* pattern.

The elegantly recursive solution to the Fibonacci sequence, is a *classic* example of an `exponential` runtime.  

```javascript
function fib(n) {
  if (n < 2) return n
  return fib(n - 1) + fib(n - 2)
}
```

In the case of fibonacci as seen above, we're doing a lot of unnecessary work.
Function calls with the same input and output are likely to reoccur, 
which means we're doing a redundant amount of linear work.

We can fix this by memoizing the output of `fib(n)` with a generic javascript cache implementation.

```javascript
function memoize(fn) {
  const cache = {}
  return function(...args) {
    if (cache[args]) return cache[args]

    const res = fn(...args)
    cache[args] = res

    return res
  }
}
```

Which could then be used to wrap the previous `fib` function.

```javascript
function fib(n) {
  if (n < 2) return n
  return fib(n - 1) + fib(n - 2)
}

fib = memoize(fib);
```

If an input of `args` exists in the cache, the value is retrieved at a constant rate of `O(1)`.
Since we drop constants, this has reduced the runtime complexity from `O(2^n)` to `O(n)`,
because the calls to `fib` will always be increasing at the linear rate of `n`.

### Factorial time `O(n!)`

> *"O of n-factorial"*

*Factorial* time is usually seen when calculating all permutations of a given string.

In the case of the string `big`, we have to fork the string three times.
Once for each initial letter - `b`, `i` and `g`.  
Each fork then has three children, which in turn have two children, which each have one child.

This gives us the factorial pattern of 3 x 2 x 1, which is where the name comes from.
