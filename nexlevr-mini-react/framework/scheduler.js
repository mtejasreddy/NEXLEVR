// Polyfill requestIdleCallback for Safari support
window.requestIdleCallback = window.requestIdleCallback || function (cb) {
  const start = Date.now();
  return setTimeout(function () {
    cb({
      didTimeout: false,
      timeRemaining: function () {
        return Math.max(0, 50 - (Date.now() - start));
      }
    });
  }, 1);
};

window.cancelIdleCallback = window.cancelIdleCallback || function (id) {
  clearTimeout(id);
};

import { reconcileChildren } from "./diff.js";

let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
let deletions = [];
let wipFiber = null;
let hookIndex = null;

export function getWipFiber() {
  return wipFiber;
}

export function setWipFiber(fiber) {
  wipFiber = fiber;
}

export function getHookIndex() {
  return hookIndex;
}

export function setHookIndex(index) {
  hookIndex = index;
}

export function addDeletion(fiber) {
  deletions.push(fiber);
}

export function getCurrentRoot() {
  return currentRoot;
}

export function scheduleUpdate() {
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot,
  };
  nextUnitOfWork = wipRoot;
  deletions = [];
}

export function startRender(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

// DOM manipulation helper functions
export function createDom(fiber) {
  const dom =
    fiber.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);
  return dom;
}

const isEvent = key => key.startsWith("on");
const isProperty = key => key !== "children" && !isEvent(key);
const isNew = (prev, next) => key => prev[key] !== next[key];
const isGone = (prev, next) => key => !(key in next);

export function updateDom(dom, prevProps, nextProps) {
  // Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // Remove old style values or standard properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      dom[name] = "";
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      if (name === "style" && typeof nextProps[name] === "object") {
        if (typeof prevProps.style === "object") {
          // Clear styles that are no longer present
          Object.keys(prevProps.style).forEach(styleKey => {
            if (!nextProps.style[styleKey]) {
              dom.style[styleKey] = "";
            }
          });
        }
        Object.assign(dom.style, nextProps[name]);
      } else {
        dom[name] = nextProps[name];
      }
    });

  // Add new event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
}

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;

  // Run side-effects post-commit
  runEffects();
}

function commitWork(fiber) {
  if (!fiber) return;

  // Walk up to find parent DOM element
  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;

  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber, domParent);
    return;
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }

  // Clean up hooks / side-effects on deletion (unmounting)
  const runCleanups = (f) => {
    if (!f) return;
    if (f.effects) {
      f.effects.forEach(effect => {
        if (typeof effect.cleanup === "function") {
          effect.cleanup();
        }
      });
    }
    runCleanups(f.child);
    runCleanups(f.sibling);
  };
  runCleanups(fiber);
}

function runEffects() {
  const traverseAndRun = (fiber) => {
    if (!fiber) return;
    if (fiber.effects) {
      fiber.effects.forEach(effect => {
        if (effect.shouldRun) {
          if (effect.hook.cleanup) {
            try {
              effect.hook.cleanup();
            } catch (e) {
              console.error("Error running effect cleanup:", e);
            }
            effect.hook.cleanup = null;
          }
          const cleanup = effect.callback();
          if (typeof cleanup === "function") {
            effect.hook.cleanup = cleanup;
          } else {
            effect.hook.cleanup = null;
          }
          effect.shouldRun = false;
        }
      });
    }
    traverseAndRun(fiber.child);
    traverseAndRun(fiber.sibling);
  };
  traverseAndRun(currentRoot);
}

function performUnitOfWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
  return null;
}

function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  wipFiber.effects = [];

  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);
