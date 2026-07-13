# Inside MiniReact: Crafting a Custom UI Engine & Fiber Reconciler From Scratch

Modern frontend development is dominated by declarative UI libraries like React. We write components as functions returning HTML-like syntax, and the UI magically updates. But how does this work under the hood?

To understand React's internal architecture, we built **MiniReact**—a light, from-scratch custom UI library that implements the Virtual DOM, cooperative Fiber scheduling, diffing algorithms, and hooks (`useState` / `useEffect`) using only vanilla JS and native Web APIs.

Here is a deep technical breakdown of the engine we designed.

---

## 1. The Virtual DOM Representation

The Virtual DOM is simply a lightweight, nested JavaScript object describing what should appear on the screen. Directly manipulating the real browser DOM is slow, so we operate on these memory descriptors first.

In MiniReact, `createElement` normalizes the tag type, props, and children:

```javascript
export function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.flat(Infinity).map(child => {
        return typeof child === "object" ? child : createTextElement(child);
      })
    }
  };
}
```

Every string or number is serialized into a structured `TEXT_ELEMENT` object. This creates a uniform node tree that our engine can traverse without encountering mixed data types.

---

## 2. Why Fiber & Cooperative Scheduling Matter

In early versions of React (pre-v16), updates traversed the VDOM recursively. Once rendering started, it could not be paused. For large trees, this synchronous recursion blocked the browser's main thread, causing missed frames, stuttering, and unresponsive UI inputs.

React solved this by introducing **Fiber**—a virtual stack frame architecture.
In MiniReact, a **Fiber** is a work unit representing a component and its relationships:
- `child`: Link to its first direct child node.
- `sibling`: Link to its immediate sibling node.
- `parent`: Link back to its parent.

This links the entire tree into a **singly-linked list**. Using this structure, we can traverse the tree using a simple loop rather than recursion. If the browser needs to paint or handle a click, we pause the loop, yield control, and resume where we left off.

```
       [ App ]
          | (child)
      [ Navbar ] -------> [ Main ] (sibling)
                             | (child)
                         [ Counter ]
```

We schedule this using `requestIdleCallback` (with a `setTimeout` fallback for browsers like Safari):

```javascript
function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }
  if (!nextUnitOfWork && wipRoot) {
    commitRoot(); // Enter the commit phase
  }
  requestIdleCallback(workLoop);
}
```

---

## 3. The Two-Phase Rendering Pipeline

To ensure a smooth, flicker-free user experience, our rendering engine separates work into two distinct phases:

### Phase A: Reconciliation (Asynchronous/Cooperative)
- We traverse the Virtual DOM structure and generate the Fiber tree in memory.
- We check for differences between the old fiber tree and new elements.
- We tag fibers with effect tags (`PLACEMENT`, `UPDATE`, `DELETION`).
- This phase can yield to the browser if a frame takes too long.

### Phase B: Commit (Synchronous)
- Once the entire reconciliation work is completed, we apply all changes to the physical DOM in one fast, synchronous operation.
- We append new nodes, update attributes, and delete removed nodes.
- We execute side-effects and register cleanup callbacks.
- Because it is synchronous, the user never sees a half-rendered UI.

---

## 4. The Diffing Algorithm

Our diffing algorithm compares the active tree (the `alternate` fiber reference) with the newly generated elements to figure out what actually changed:

1. **Same Type**: If the node type matches (e.g. `div` matches `div`), we reuse the DOM node and schedule an `UPDATE` effect to only update the changed props (attributes, event listeners).
2. **Different Type / New Element**: If the types differ or there was no previous node, we create a new fiber node with a `PLACEMENT` effect.
3. **Old Node Missing**: If there is no corresponding new element, we mark the old fiber for deletion and add it to our `deletions` queue.

```javascript
const sameType = oldFiber && element && element.type === oldFiber.type;

if (sameType) {
  newFiber = {
    type: oldFiber.type,
    props: element.props,
    dom: oldFiber.dom,
    parent: wipFiber,
    alternate: oldFiber,
    effectTag: "UPDATE"
  };
}
```

---

## 5. Hook Registry & Execution Internals

State hooks in MiniReact are stored directly on the active fiber. A component can have multiple states, which are stored sequentially in a `hooks` array.

### Strict Hook Ordering
Because hooks are accessed sequentially during a component's render execution, **you cannot call hooks inside loops, conditions, or nested functions**. If the order of hook calls changes, the index pointing to the hook shifts, causing state variables to load incorrect values.

```javascript
export function useState(initialState) {
  const wipFiber = getWipFiber();
  const hookIndex = getHookIndex();

  const oldHook = wipFiber.alternate?.hooks?.[hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initialState,
    queue: []
  };

  // Run all queued state update actions
  const actions = oldHook ? oldHook.queue : [];
  actions.forEach(action => {
    hook.state = typeof action === "function" ? action(hook.state) : action;
  });

  const setState = action => {
    hook.queue.push(action);
    scheduleUpdate(); // Trigger a re-render from the root
  };

  wipFiber.hooks.push(hook);
  setHookIndex(hookIndex + 1);
  return [hook.state, setState];
}
```

### Side Effect Management (`useEffect`)
Side effects are registered during the reconciliation phase and executed after the DOM is committed.
If the dependency array (`deps`) changes (checked using `dep !== oldHook.deps[i]`), we trigger the effect callback. We capture the returned cleanup function and store it in the hook.
Before the next execution, or when the component unmounts (during `commitDeletion`), we run the stored cleanups to prevent memory leaks.

---

## 6. Framework Visualizer: Proving the Concept

To visually demonstrate and debug our engine, we built a **Fiber Tree Visualizer** directly into our dashboard. By recursively traversing the `currentRoot` fiber tree structure and outputting it as a formatted diagram, we can witness:
- Exactly which nodes are HTML Host nodes vs. Custom Function Components.
- The active count of state hooks on each component fiber.
- How changes in states update existing nodes in-place (diffing) instead of tearing down the document tree.
