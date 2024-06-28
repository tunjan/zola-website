document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;
  const themeToggle = document.getElementById("theme-toggle");
  const fontToggle = document.getElementById("font-toggle");
  const nav = document.querySelector('nav ul');
  const dropdown = document.getElementById('dropdown');

  const storageKeys = {
      darkMode: "darkMode",
      theme: "theme",
      fontFamily: "fontFamily"
  };

  const themes = {
      dark: "dark",
      light: "light"
  };

  const fonts = {
      primary: 'Lexend, sans-serif',
      secondary: 'Bitter, serif'
  };

  /**
   * Retrieves the dark mode status from local storage.
   * @returns {boolean} True if dark mode is enabled, otherwise false.
   */
  const getDarkModeStatus = () => localStorage.getItem(storageKeys.darkMode) === "true";

  /**
   * Retrieves the stored theme from local storage or determines it based on dark mode status.
   * @returns {string} The current theme ("dark" or "light").
   */
  const getStoredTheme = () => localStorage.getItem(storageKeys.theme) || (getDarkModeStatus() ? themes.dark : themes.light);

  /**
   * Retrieves the stored font family from local storage.
   * @returns {string} The stored font family.
   */
  const getStoredFontFamily = () => localStorage.getItem(storageKeys.fontFamily);

  /**
   * Applies the dark mode filter to specified elements.
   * @param {boolean} isDarkMode - The current dark mode status.
   */
  function updateElementFilters(isDarkMode) {
    [dropdown.querySelector('img')].forEach(element => {
      if (element) {
        element.style.filter = isDarkMode ? 'invert(0)' : 'invert(1)';
      }
    });
  }

  /**
   * Initializes the theme based on the stored settings.
   */
  function initializeTheme() {
    const isDarkMode = getDarkModeStatus();
    html.classList.toggle("dark-mode", isDarkMode);
    updateElementFilters(isDarkMode);
  }

  /**
   * Initializes the font family based on the stored settings.
   */
  function initializeFontFamily() {
    const storedFont = getStoredFontFamily();
    if (storedFont) {
      html.style.fontFamily = storedFont;
    }
  }

  /**
   * Toggles the theme between dark and light modes.
   */
  function toggleTheme() {
    const isDarkMode = html.classList.toggle("dark-mode");
    localStorage.setItem(storageKeys.darkMode, isDarkMode);
    localStorage.setItem(storageKeys.theme, isDarkMode ? themes.dark : themes.light);
    updateElementFilters(isDarkMode);
    window.REMARK42.changeTheme(isDarkMode ? themes.dark : themes.light);
  }

  /**
   * Toggles the font family between primary and secondary options.
   */
  function toggleFontFamily() {
    const currentFont = getComputedStyle(html).fontFamily;
    const newFont = currentFont.includes('Lexend') ? fonts.secondary : fonts.primary;
    html.style.fontFamily = newFont;
    localStorage.setItem(storageKeys.fontFamily, newFont);
  }

  /**
   * Toggles the navigation display and updates the dropdown icon.
   */
  function toggleNavigationDisplay() {
    const img = dropdown.querySelector('img');
    const isNavHidden = nav.style.display === 'none' || nav.style.display === '';
    nav.style.display = isNavHidden ? 'block' : 'none';
    if (img) {
      img.src = isNavHidden ? "/cross.svg" : "/hamburger.svg";
    }
  }

  /**
   * Initializes event listeners for theme, font, and navigation toggles.
   */
  function initializeEventListeners() {
    // themeToggle.addEventListener("click", toggleTheme);
    // fontToggle.addEventListener("click", toggleFontFamily);
    dropdown.addEventListener("click", toggleNavigationDisplay);
  }

  window.addEventListener("load", () => {
    initializeTheme();
  });

  initializeEventListeners();
});
