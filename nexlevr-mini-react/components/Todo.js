import { createElement, useState } from "../framework/index.js";

export function Todo() {
  const [todos, setTodos] = useState([
    { id: 1, text: "Explore MiniReact core scheduler", completed: true },
    { id: 2, text: "Build a custom diffing engine", completed: true },
    { id: 3, text: "Create stateful glassmorphic interface", completed: false }
  ]);
  const [filter, setFilter] = useState("all");

  const handleAddTodo = e => {
    e.preventDefault();
    const input = e.target.elements.todoText;
    const text = input.value.trim();
    if (!text) return;

    setTodos([
      ...todos,
      { id: Date.now(), text, completed: false }
    ]);
    input.value = "";
  };

  const toggleTodo = id => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = id => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  return createElement(
    "div",
    { className: "card fade-in" },
    createElement("h2", { className: "card-title" }, "Todo Planner"),
    createElement(
      "p",
      { className: "card-desc" },
      "Demonstrates multi-state management, event handling, list rendering, and differential DOM updates."
    ),

    // Add Todo Form
    createElement(
      "form",
      { className: "todo-form", onSubmit: handleAddTodo },
      createElement("input", {
        type: "text",
        name: "todoText",
        placeholder: "What needs to be done?",
        className: "todo-input",
        autoComplete: "off"
      }),
      createElement("button", { type: "submit", className: "btn btn-primary" }, "Add")
    ),

    // Filter Buttons
    createElement(
      "div",
      { className: "todo-filters" },
      createElement(
        "button",
        {
          className: `filter-btn ${filter === "all" ? "active" : ""}`,
          onClick: () => setFilter("all")
        },
        "All"
      ),
      createElement(
        "button",
        {
          className: `filter-btn ${filter === "active" ? "active" : ""}`,
          onClick: () => setFilter("active")
        },
        "Active"
      ),
      createElement(
        "button",
        {
          className: `filter-btn ${filter === "completed" ? "active" : ""}`,
          onClick: () => setFilter("completed")
        },
        "Completed"
      )
    ),

    // Todo List
    createElement(
      "ul",
      { className: "todo-list" },
      ...filteredTodos.map(todo =>
        createElement(
          "li",
          { className: `todo-item ${todo.completed ? "completed" : ""}` },
          createElement(
            "span",
            { className: "todo-text", onClick: () => toggleTodo(todo.id) },
            todo.completed ? "✓ " : "○ ",
            todo.text
          ),
          createElement(
            "button",
            { className: "todo-delete", onClick: () => deleteTodo(todo.id) },
            "✕"
          )
        )
      )
    ),

    // Footer 
    createElement(
      "div",
      { className: "todo-footer" },
      `${todos.filter(t => !t.completed).length} items remaining`
    )
  );
}
