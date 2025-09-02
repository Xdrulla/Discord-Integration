import { useEffect, useState } from "react";

const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    
    // If no saved preference, check system preference
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const className = "dark";
    const themeChangingClass = "theme-changing";
    
    // Add transition class to prevent flash
    document.body.classList.add(themeChangingClass);
    
    // Apply theme
    if (darkMode) {
      document.body.classList.add(className);
    } else {
      document.body.classList.remove(className);
    }
    
    // Save preference
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    
    // Remove transition class after a short delay
    const timer = setTimeout(() => {
      document.body.classList.remove(themeChangingClass);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [darkMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e) => {
      // Only update if user hasn't set a manual preference
      if (!localStorage.getItem("theme")) {
        setDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener("change", handleChange);
    
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return [darkMode, setDarkMode];
};

export default useDarkMode;
