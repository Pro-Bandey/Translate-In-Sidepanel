
function updateTranslation(queryText = null) {
    chrome.storage.sync.get(["srcLang", "targetLang", "provider"], (settings) => {
        const processText = (text) => {
            const sl = settings.srcLang || "auto";
            const tl = settings.targetLang || "en";
            const provider = settings.provider || "google";
            let url = "";

            if (provider === "deepl") {
                url = `https://www.deepl.com/translator#${sl}/${tl}/${encodeURIComponent(text)}`;
            } else if (provider === "bing") {
                const bsl = sl === "auto" ? "auto-detect" : sl;
                url = `https://www.bing.com/translator?from=${bsl}&to=${tl}&text=${encodeURIComponent(text)}`;
            } else {
                url = `https://translate.google.com/?sl=${sl}&tl=${tl}&text=${encodeURIComponent(text)}&op=translate`;
            }

            document.getElementById("translateFrame").src = url;
            if (text.trim()) saveToHistory(text, tl);
        };

        if (queryText) {
            processText(queryText);
        } else {
            chrome.storage.local.get("lastQuery", (data) => {
                processText(data.lastQuery?.text || "");
            });
        }
    });
}

// Initial load
updateTranslation();

window.addEventListener("unload", () => {
    chrome.storage.local.set({ lastQuery: { text: "", ts: Date.now() } });
});

// FIX: Combined listener to handle BOTH text drops (local) AND settings changes (sync) instantly.
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.lastQuery) {
        const newText = changes.lastQuery.newValue?.text;
        if (newText) updateTranslation(newText);
    } else if (area === "sync") {
        if (changes.theme) {
            applyTheme(changes.theme.newValue === 'dark');
        }
        // Immediately update iframe when Provider or Languages change from the dropdown
        if (changes.srcLang || changes.targetLang || changes.provider) {
            updateTranslation();
        }
    }
});

// --- Drag & Drop, Modals, and other panel-specific logic ---

const dropOverlay = document.getElementById("dropOverlay");
window.addEventListener("dragover", e => { e.preventDefault(); dropOverlay.classList.add("active"); });
window.addEventListener("dragleave", e => { if (!e.relatedTarget) dropOverlay.classList.remove("active"); });
window.addEventListener("drop", e => {
    e.preventDefault();
    dropOverlay.classList.remove("active");
    const text = e.dataTransfer.getData("text/plain");
    if (text?.trim()) {
        chrome.storage.local.set({ lastQuery: { text: text.trim(), ts: Date.now() } });
    }
});

// Modal Controls
const settingsBtn = document.getElementById("settingsBtn");
const closeSettings = document.getElementById("closeSettings");
const settingsOverlay = document.getElementById("settingsOverlay");
settingsBtn?.addEventListener("click", () => settingsOverlay.classList.add("show"));
closeSettings?.addEventListener("click", () => settingsOverlay.classList.remove("show"));

// Theme and Tooltip Toggles
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

setupToggle("themeTogglePanel", "theme", true);
setupToggle("tooltipTogglePanel", "tooltipEnabled");

// Dropdowns Initialization
function setDropdownValue(id, value) {
    const list = document.querySelector(`#${id} .options-list`);
    const button = document.querySelector(`#${id} .select-button`);
    const option = list?.querySelector(`li[data-val="${value}"]`);
    if (option) setButtonText(button, option.textContent, value);
}

function loadSettings() {
    chrome.storage.sync.get(["srcLang", "targetLang", "provider"], data => {
        if (data.srcLang) setDropdownValue("srcSelect", data.srcLang);
        if (data.targetLang) setDropdownValue("targetSelect", data.targetLang);
        if (data.provider) setDropdownValue("providerSelect", data.provider);
    });
}

setupDropdown("providerSelect", false,[
    { val: "google", name: "Google Translate" }, { val: "deepl", name: "DeepL" }, { val: "bing", name: "Bing Translator" }
]);
setupDropdown("srcSelect", true);
setupDropdown("targetSelect", false);
loadSettings();

document.getElementById("swapLang")?.addEventListener("click", () => {
    const srcBtn = document.querySelector("#srcSelect .select-button");
    const targetBtn = document.querySelector("#targetSelect .select-button");
    const srcVal = srcBtn.getAttribute("data-val");
    if (srcVal === "auto") return;
    const targetVal = targetBtn.getAttribute("data-val");
    const srcText = srcBtn.textContent.replace("▼", "").trim();
    const targetText = targetBtn.textContent.replace("▼", "").trim();
    setButtonText(srcBtn, targetText, targetVal);
    setButtonText(targetBtn, srcText, srcVal);
    saveSettings();
});

// --- History & Favorites Logic ---

const historyBtn = document.getElementById("historyBtn");
const closeHistory = document.getElementById("closeHistory");
const historyOverlay = document.getElementById("historyOverlay");
const historyList = document.getElementById("historyList");
const emptyHistoryMsg = document.getElementById("emptyHistoryMsg");

if (historyBtn && closeHistory && historyOverlay) {
    historyBtn.addEventListener("click", () => {
        renderHistory();
        historyOverlay.classList.add("show");
    });
    closeHistory.addEventListener("click", () => {
        historyOverlay.classList.remove("show");
    });
}

function saveToHistory(text, targetLangCode) {
    if (!text || text.trim() === "") return;
    chrome.storage.local.get(["translationHistory"], (data) => {
        let history = data.translationHistory ||[];
        const langObj = languages.find(l => l.code === targetLangCode);
        const targetLangName = langObj ? langObj.name : targetLangCode;
        
        const existingIdx = history.findIndex(h => h.text === text);
        if (existingIdx !== -1) {
            history.splice(existingIdx, 1);
        }

        history.unshift({
            id: Date.now(),
            text: text,
            targetLangCode: targetLangCode,
            targetLangName: targetLangName,
            isFavorite: false,
            date: Date.now(),
        });

        const favorites = history.filter(h => h.isFavorite);
        let nonFavorites = history.filter(h => !h.isFavorite);
        if (nonFavorites.length > 20) {
            nonFavorites = nonFavorites.slice(0, 20);
        }
        
        const newHistory = [...favorites, ...nonFavorites].sort((a, b) => b.date - a.date);
        chrome.storage.local.set({ translationHistory: newHistory });
    });
}

function renderHistory() {
    chrome.storage.local.get(["translationHistory"], (data) => {
        const history = data.translationHistory ||[];
        historyList.innerHTML = "";
        
        emptyHistoryMsg.style.display = history.length === 0 ? "block" : "none";

        history.forEach((item) => {
            const li = document.createElement("li");
            li.className = "history-item";
            const starPath = item.isFavorite ? "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" : "M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z";
            
            li.innerHTML = `
                <div class="history-text-wrap" title="Translate: ${item.text}">
                    <span class="history-text">${item.text}</span>
                    <div class="history-meta"><span class="badge">To: ${item.targetLangName}</span></div>
                </div>
                <button title="Add To Favorite" class="star-btn ${item.isFavorite ? "active" : ""}" data-id="${item.id}">
                    <svg viewBox="0 0 24 24"><path d="${starPath}"/></svg>
                </button>`;
            
            li.querySelector(".history-text-wrap").addEventListener("click", () => {
                chrome.storage.sync.set({ targetLang: item.targetLangCode }, () => {
                    chrome.storage.local.set({ lastQuery: { text: item.text, ts: Date.now() } }, () => {
                        historyOverlay.classList.remove("show");
                    });
                });
            });

            li.querySelector(".star-btn").addEventListener("click", (e) => {
                e.stopPropagation();
                toggleFavorite(item.id);
            });
            historyList.appendChild(li);
        });
    });
}

function toggleFavorite(id) {
    chrome.storage.local.get(["translationHistory"], (data) => {
        let history = data.translationHistory ||[];
        const idx = history.findIndex((h) => h.id === id);
        if (idx > -1) {
            history[idx].isFavorite = !history[idx].isFavorite;
            chrome.storage.local.set({ translationHistory: history }, renderHistory);
        }
    });
}