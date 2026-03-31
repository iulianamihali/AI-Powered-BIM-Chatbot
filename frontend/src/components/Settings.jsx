import { useState } from "react";
import "../styles/dashboard.css";

function Settings() {
  const [darkMode, setDarkMode] = useState(true);

  const handleToggleTheme = () => {
    setDarkMode((prev) => !prev);
    const main = document.querySelector(".main-area");
    if (main) {
      if (darkMode) {
        main.classList.add("light-mode");
      } else {
        main.classList.remove("light-mode");
      }
    }
  };

  return (
    <div className="page-container">
      <h2>Setări</h2>
      <div className="setting-item">
        <label>Mod întunecat:</label>
        <input type="checkbox" checked={darkMode} onChange={handleToggleTheme} />
      </div>
    </div>
  );
}

export default Settings;
