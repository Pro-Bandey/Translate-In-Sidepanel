// UI Initialization & Storage Loading
function setDropdownValue(id, value) {
    const list = document.querySelector(`#${id} .options-list`);
    const button = document.querySelector(`#${id} .select-button`);
    const option = list?.querySelector(`li[data-val="${value}"]`);
    if (option) setButtonText(button, option.textContent, value); // setButtonText is loaded from shared.js
}

function loadSettings() {
    chrome.storage.sync.get(["srcLang", "targetLang", "provider"], data => {
        if (data.srcLang) setDropdownValue("srcSelect", data.srcLang);
        if (data.targetLang) setDropdownValue("targetSelect", data.targetLang);
        if (data.provider) setDropdownValue("providerSelect", data.provider);
    });
}

// Theme & Toggles logic
function applyTheme(isDark) {
    document.documentElement.classList.toggle("dark", isDark);
}

function setupToggle(elementId, storageKey, isTheme = false) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    chrome.storage.sync.get([storageKey], data => {
        const value = isTheme ? data[storageKey] === 'dark' : data[storageKey] !== false;
        el.checked = value;
        if (isTheme) applyTheme(value);
    });
    
    el.addEventListener('change', e => {
        const value = e.target.checked;
        const setting = isTheme ? { theme: value ? 'dark' : 'light' } : { [storageKey]: value };
        chrome.storage.sync.set(setting);
    });
}

// Listen to sync changes (e.g., if settings were changed in the Side Panel)
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
        if (changes.theme) {
            const isDark = changes.theme.newValue === 'dark';
            applyTheme(isDark);
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) themeToggle.checked = isDark;
        }
        if (changes.tooltipEnabled) {
            const tooltipToggle = document.getElementById('tooltipToggle');
            if (tooltipToggle) tooltipToggle.checked = changes.tooltipEnabled.newValue;
        }
    }
});

// Setup Provider & Language Dropdowns (setupDropdown is loaded from shared.js)
setupDropdown("providerSelect", false,[
    { val: "google", name: "Google Translate" }, 
    { val: "deepl", name: "DeepL" }, 
    { val: "bing", name: "Bing Translator" }
]);
setupDropdown("srcSelect", true);
setupDropdown("targetSelect", false);

// Initialize Data and UI Toggles
loadSettings();
setupToggle("themeToggle", "theme", true);
setupToggle("tooltipToggle", "tooltipEnabled");

// Language Swap Button
document.getElementById("swapLang")?.addEventListener("click", () => {
    const srcBtn = document.querySelector("#srcSelect .select-button");
    const targetBtn = document.querySelector("#targetSelect .select-button");
    
    const srcVal = srcBtn.getAttribute("data-val");
    if (srcVal === "auto") return; // Cannot swap 'Detect Language'
    
    const targetVal = targetBtn.getAttribute("data-val");
    const srcText = srcBtn.textContent.replace("▼", "").trim();
    const targetText = targetBtn.textContent.replace("▼", "").trim();
    
    setButtonText(srcBtn, targetText, targetVal);
    setButtonText(targetBtn, srcText, srcVal);
    saveSettings(); // saveSettings is loaded from shared.js
});

// Close dropdowns when clicking anywhere outside of them
document.addEventListener('click', e => {
    if (!e.target.closest('.custom-select')) {
        document.querySelectorAll('.custom-select').forEach(el => el.classList.remove('active'));
    }
});