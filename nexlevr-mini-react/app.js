import { createElement, useState, render } from "./framework/index.js";
import { Navbar } from "./components/Navbar.js";
import { Counter } from "./components/Counter.js";
import { Todo } from "./components/Todo.js";
import { Weather } from "./components/Weather.js";
import { Visualizer } from "./components/Visualizer.js";

function App() {
  const [currentView, setView] = useState("counter");

  return createElement(
    "div",
    { className: "app-container" },
    // Navigation bar
    createElement(Navbar, { currentView, setView }),
    
    // Core dashboard content panel
    createElement(
      "main",
      { className: "view-content" },
      currentView === "counter" && createElement(Counter),
      currentView === "todo" && createElement(Todo),
      currentView === "weather" && createElement(Weather),
      currentView === "visualizer" && createElement(Visualizer)
    )
  );
}

const container = document.getElementById("root");
render(createElement(App), container);
