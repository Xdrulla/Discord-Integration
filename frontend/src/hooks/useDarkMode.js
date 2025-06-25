import { useEffect, useState } from "react";

const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    const className = "dark";
    if (darkMode) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return [darkMode, setDarkMode];
};

export default useDarkMode;
