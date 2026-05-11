
if (window.name === "translateFrame") {
  chrome.storage.sync.get(['theme'], (data) => {
    applyTheme(data.theme);
  });

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.theme) {
      applyTheme(changes.theme.newValue);
    }
  });

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-ext-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-ext-theme');
    }
  }
}