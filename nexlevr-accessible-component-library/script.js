const themeToggle = document.getElementById("themeToggle");
const waitlistForm = document.querySelector(".form-card");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");

  const isDarkTheme = document.body.classList.contains("dark-theme");

  themeToggle.setAttribute("aria-pressed", isDarkTheme);
  themeToggle.setAttribute(
    "aria-label",
    isDarkTheme ? "Switch to light theme" : "Switch to dark theme",
  );

  themeToggle.textContent = isDarkTheme ? "Light theme" : "Dark theme";
});

waitlistForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const alertBox = document.querySelector(".alert");
  alertBox.innerHTML =
    "<strong>Thanks for joining!</strong> Your email was captured in this demo.";

  alertBox.focus();
});
