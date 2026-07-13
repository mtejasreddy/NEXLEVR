import { createElement } from "../framework/index.js";

export function Navbar({ currentView, setView }) {
  const tabs = [
    { id: "counter", label: "Counter" },
    { id: "todo", label: "Todo Application" },
    { id: "weather", label: "Weather API" },
    { id: "visualizer", label: "Fiber Visualizer" }
  ];

  return createElement(
    "nav",
    { className: "navbar" },
    createElement(
      "div",
      { className: "nav-logo" },
      createElement("span", { className: "logo-icon" }, "⚡"),
      "MiniReact"
    ),
    createElement(
      "div",
      { className: "nav-links" },
      ...tabs.map(tab =>
        createElement(
          "button",
          {
            className: `nav-btn ${currentView === tab.id ? "active" : ""}`,
            onClick: () => setView(tab.id)
          },
          tab.label
        )
      )
    )
  );
}
