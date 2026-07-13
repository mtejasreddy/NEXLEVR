import { useTheme } from "../context/ThemeContext";

function Navbar({ searchTerm, setSearchTerm }) {
  const { theme, toggleTheme } = useTheme();
  return (
    <header className="navbar">
      <input
        type="text"
        placeholder="Search challenges..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="nav-right">
        <button onClick={toggleTheme}>{theme === "light" ? "🌙" : "☀️"}</button>

        <img src="https://i.pravatar.cc/40" alt="Profile" />
      </div>
    </header>
  );
}

export default Navbar;
