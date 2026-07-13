import {
  getWipFiber,
  getHookIndex,
  setHookIndex,
  scheduleUpdate
} from "./scheduler.js";

export function useState(initialState) {
  const wipFiber = getWipFiber();
  const hookIndex = getHookIndex();

  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  const queue = oldHook ? oldHook.queue : [];

  const hook = {
    state: oldHook ? oldHook.state : (typeof initialState === "function" ? initialState() : initialState),
    queue,
  };

  const actions = [...queue];
  actions.forEach(action => {
    hook.state = typeof action === "function" ? action(hook.state) : action;
  });

  queue.length = 0;

  const setState = action => {
    queue.push(action);
    scheduleUpdate();
  };

  wipFiber.hooks.push(hook);
  setHookIndex(hookIndex + 1);
  return [hook.state, setState];
}

export function useEffect(callback, deps) {
  const wipFiber = getWipFiber();
  const hookIndex = getHookIndex();

  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  const hasChangedDeps = oldHook
    ? !deps || deps.some((dep, i) => dep !== oldHook.deps[i])
    : true;

  const hook = {
    deps,
    cleanup: oldHook ? oldHook.cleanup : null,
  };

  wipFiber.hooks.push(hook);
  setHookIndex(hookIndex + 1);

  wipFiber.effects.push({
    callback,
    shouldRun: hasChangedDeps,
    hook,
  });
}
