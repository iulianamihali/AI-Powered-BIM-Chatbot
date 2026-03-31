import { useState, useEffect } from "react";

function Topbar() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const main = document.querySelector(".main-area");
    if (main) {
      if (darkMode) {
        main.classList.remove("light-mode");
      } else {
        main.classList.add("light-mode");
      }
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <div className="topbar">
      <div className="toggle-switch" onClick={toggleTheme}>
        <div className={`switch-circle ${darkMode ? "left" : "right"}`}></div>
      </div>
    </div>
  );
}

export default Topbar;
