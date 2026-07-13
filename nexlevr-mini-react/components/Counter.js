import { createElement, useState } from "../framework/index.js";

export function Counter() {
  const [count, setCount] = useState(0);

  return createElement(
    "div",
    { className: "card fade-in" },
    createElement("h2", { className: "card-title" }, "Stateful Counter"),
    createElement(
      "p",
      { className: "card-desc" },
      "Demonstrates fundamental local state tracking via our custom useState hook."
    ),
    createElement(
      "div",
      { className: "counter-container" },
      createElement("div", { className: "counter-value" }, count),
      createElement(
        "div",
        { className: "counter-actions" },
        createElement(
          "button",
          { className: "btn btn-danger", onClick: () => setCount(count - 1) },
          "-"
        ),
        createElement(
          "button",
          { className: "btn btn-secondary", onClick: () => setCount(0) },
          "Reset"
        ),
        createElement(
          "button",
          { className: "btn btn-success", onClick: () => setCount(count + 1) },
          "+"
        )
      )
    )
  );
}
