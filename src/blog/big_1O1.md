---
title: "Big 1O1"
date: "2019-08-11"
excerpt: "What is big O notation?"
published: false
---

Big O.

And no, this post is not about the female orgasm, but rather the mathematical notation, 
often used in computer science to aptly describe the efficiency of any given algorithm, 
by defining how quickly the runtime complexity scales, given an increase of the input size, commonly referred to as *n*.

Why do we need big O?

Say we wrote two different algorithms as a solution to a given problem.
How would we compare them, and determine which one is best?
One could argue, that *this* solution might be better than *that one*, 
because it's easier to code, easier to maintain, easy to understand or just flat out looks better. 
But these *personal* anecdotes, aren't very helpful when trying to pick the objectively "better" - more *efficient* solution.
And that's why we have *big O*.

Before diving into big O, it's important to know that there's a discrepancy between big O in an academic setting,
and in the software engineering industry at large. 

Big O in a job setting, can seemingly be considered less accurate, and really more of an estimation.  
How so? Well, in academia there are three ways of describing runtimes.

*Big Omega (Ω)* describes the lower bound of time; the best-case scenario.  
The runtime can never be less than this value.  

*Big O* is on the opposite end of the spectrum, and describes the upper bound of time; The worst-case scenario.  
The runtime can never be greater than this value.  

*Big Theta (Θ)* describes an algorithm where Ω and O will asymptotically grow at the same pace.  

In a non-academia environment, you will likely only ever hear of *"big O"*.
For unintuitive reasons however, *"big O"* used in the industry seems closer to the meaning of big Θ, 
than it is to academia's big O, and even so, is still not quite the same.

*Big O always attempts to describe the tightest bounds of the algorithm runtime.*

---

Okay, the description has remained amazingly abstract so far - let's dive into some examples.

### Constant time

```javascript
function logLastIndex(array) {
	console.log(array[array.lenght - 1]);
}
```

Regardless of the length of `array`, the runtime of this function will always remain the same.
In big O, this is described as a **constant** runtime, notated as `O(1)`, `1` being the constant.

> Throw away the constant

Because big O only describes the rate of increase, we always throw away the constant.
For example, an algorithm described as `O(2N)`, actually becomes `O(N)`.

> Throw away the coefficient

You will find, that the same is true, for any notation coefficient, also commonly referred to as the "non dominant", or "less efficient" term.

```javascript
function printNumbersAndSums(nums) {
	for (const n of nums) {
		console.log(n);
	}

	for (const n of nums) {
		for (const m of nums) {
			console.log(n + m);
		}
	}
}
```

The first loop in this function, has a runtime of `O(N)`. The second nested loop, has a runtime of `O(N^2)`.
Instinctively, you would want to add them together `O(N + N^2)`. In big O however, you drop the first `N`.
Why? Because it's not especially important. We only care about the fastest growing part of the expression.

As with most rules however, there are exceptions.

If there is ever any ambiguity between the inputs of a function, it wouldn't make sense to drop them, when describing the runtime. For instance, given the expression `O(B + A^2)`, it wouldn't make sense to drop `B` like we did in our previous example, since the value of `A` and `B` are different. It's important to acknowledge that both carry relevance in this context.
