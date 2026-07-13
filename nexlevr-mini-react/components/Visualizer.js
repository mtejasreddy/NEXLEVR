import { createElement, useState, useEffect } from "../framework/index.js";
import { getCurrentRoot } from "../framework/scheduler.js";

export function Visualizer() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const rootFiber = getCurrentRoot();

  // Helper to extract children list from a parent fiber (traversing the sibling chain)
  const getFiberChildren = (fiber) => {
    const children = [];
    if (!fiber) return children;
    let child = fiber.child;
    while (child) {
      children.push(child);
      child = child.sibling;
    }
    return children;
  };

  // Recursively render fiber nodes as hierarchical visual elements
  const renderFiber = (fiber) => {
    if (!fiber) return null;

    let nodeName = "";
    let nodeClass = "fiber-host";
    let detailText = "";

    let isVisualizer = false;

    if (typeof fiber.type === "function") {
      nodeName = fiber.type.name || "Component";
      nodeClass = "fiber-component";
      if (nodeName === "Visualizer") {
        isVisualizer = true;
      }
    } else if (fiber.type === "TEXT_ELEMENT") {
      const text = fiber.props.nodeValue || "";
      nodeName = "TEXT";
      nodeClass = "fiber-text";
      detailText = text.length > 20 ? `"${text.substring(0, 20)}..."` : `"${text}"`;
    } else {
      nodeName = fiber.type;
    }

    const children = getFiberChildren(fiber);

    return createElement(
      "div",
      { className: `fiber-node ${nodeClass}` },
      createElement(
        "div",
        { className: "fiber-info" },
        createElement("span", { className: "fiber-tag" }, nodeName),
        detailText && createElement("span", { className: "fiber-val" }, detailText),
        fiber.hooks && fiber.hooks.length > 0 &&
          createElement(
            "span",
            { className: "fiber-hooks-count" },
            ` Hooks: ${fiber.hooks.length} `
          )
      ),
      children.length > 0 && !isVisualizer &&
        createElement(
          "div",
          { className: "fiber-children" },
          ...children.map(c => renderFiber(c))
        ),
      isVisualizer &&
        createElement(
          "div",
          { className: "fiber-children" },
          createElement(
            "div",
            { className: "fiber-node fiber-text" },
            createElement(
              "div",
              { className: "fiber-info" },
              createElement("span", { className: "fiber-tag" }, "TEXT"),
              createElement("span", { className: "fiber-val" }, '"[Subtree hidden to prevent recursion]"')
            )
          )
        )
    );
  };

  return createElement(
    "div",
    { className: "card fade-in" },
    createElement("h2", { className: "card-title" }, "Fiber Tree Visualizer"),
    createElement(
      "p",
      { className: "card-desc" },
      "Real-time visual diagram of the active Fiber tree. As state changes or tabs switch, notice how nodes are recycled, added, or cleaned up."
    ),
    createElement(
      "div",
      { className: "visualizer-legend" },
      createElement("div", { className: "legend-item" }, createElement("span", { className: "dot dot-component" }), "Component Node"),
      createElement("div", { className: "legend-item" }, createElement("span", { className: "dot dot-host" }), "HTML Node"),
      createElement("div", { className: "legend-item" }, createElement("span", { className: "dot dot-text" }), "Text Node")
    ),
    createElement(
      "div",
      { className: "fiber-tree-container" },
      rootFiber
        ? renderFiber(rootFiber)
        : createElement("div", { className: "loading-text" }, "Loading Fiber structural trace...")
    )
  );
}
