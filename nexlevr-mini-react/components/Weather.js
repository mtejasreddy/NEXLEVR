import { createElement, useState, useEffect } from "../framework/index.js";

const cities = ["New York", "London", "Tokyo", "Sydney"];

export function Weather() {
  const [selectedCity, setSelectedCity] = useState("New York");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setWeatherData(null);

    const timer = setTimeout(() => {
      const mockDb = {
        "New York": { temp: 24, cond: "Sunny", wind: "14 km/h", humidity: "45%" },
        "London": { temp: 16, cond: "Rainy", wind: "22 km/h", humidity: "85%" },
        "Tokyo": { temp: 28, cond: "Humid", wind: "8 km/h", humidity: "70%" },
        "Sydney": { temp: 19, cond: "Windy", wind: "29 km/h", humidity: "50%" }
      };

      setWeatherData(mockDb[selectedCity] || mockDb["New York"]);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [selectedCity]);

  return createElement(
    "div",
    { className: "card fade-in" },
    createElement("h2", { className: "card-title" }, "Async Weather API"),
    createElement(
      "p",
      { className: "card-desc" },
      "Demonstrates side-effect execution, cleanup, and dependency tracking via the custom useEffect hook."
    ),

    // Selector
    createElement(
      "div",
      { className: "weather-selector" },
      createElement("span", {}, "Select Location: "),
      ...cities.map(city =>
        createElement(
          "button",
          {
            className: `city-btn ${selectedCity === city ? "active" : ""}`,
            onClick: () => setSelectedCity(city)
          },
          city
        )
      )
    ),

    // Details Panel
    createElement(
      "div",
      { className: "weather-panel" },
      loading && createElement("div", { className: "loading-text animate-pulse" }, "Fetching report..."),
      weatherData &&
      createElement(
        "div",
        { className: "weather-info fade-in" },
        createElement(
          "div",
          { className: "weather-main" },
          createElement("span", { className: "weather-temp" }, `${weatherData.temp}°C`),
          createElement("span", { className: "weather-cond" }, weatherData.cond)
        ),
        createElement(
          "div",
          { className: "weather-details" },
          createElement("div", { className: "detail-item" }, `Humidity: ${weatherData.humidity}`),
          createElement("div", { className: "detail-item" }, `Wind: ${weatherData.wind}`)
        )
      )
    )
  );
}
