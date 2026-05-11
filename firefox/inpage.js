const languages = [
    { code: "af", name: "Afrikaans" }, { code: "sq", name: "Albanian" }, { code: "am", name: "Amharic" },
    { code: "ar", name: "Arabic" }, { code: "hy", name: "Armenian" }, { code: "az", name: "Azerbaijani" },
    { code: "eu", name: "Basque" }, { code: "be", name: "Belarusian" }, { code: "bn", name: "Bengali" },
    { code: "bs", name: "Bosnian" }, { code: "bg", name: "Bulgarian" }, { code: "ca", name: "Catalan" },
    { code: "ceb", name: "Cebuano" }, { code: "zh-CN", name: "Chinese (Simplified)" }, { code: "zh-TW", name: "Chinese (Traditional)" },
    { code: "co", name: "Corsican" }, { code: "hr", name: "Croatian" }, { code: "cs", name: "Czech" },
    { code: "da", name: "Danish" }, { code: "nl", name: "Dutch" }, { code: "en", name: "English" },
    { code: "eo", name: "Esperanto" }, { code: "et", name: "Estonian" }, { code: "fi", name: "Finnish" },
    { code: "fr", name: "French" }, { code: "fy", name: "Frisian" }, { code: "gl", name: "Galician" },
    { code: "ka", name: "Georgian" }, { code: "de", name: "German" }, { code: "el", name: "Greek" },
    { code: "gu", name: "Gujarati" }, { code: "ht", name: "Haitian Creole" }, { code: "ha", name: "Hausa" },
    { code: "haw", name: "Hawaiian" }, { code: "he", name: "Hebrew" }, { code: "hi", name: "Hindi" },
    { code: "hmn", name: "Hmong" }, { code: "hu", name: "Hungarian" }, { code: "is", name: "Icelandic" },
    { code: "ig", name: "Igbo" }, { code: "id", name: "Indonesian" }, { code: "ga", name: "Irish" },
    { code: "it", name: "Italian" }, { code: "ja", name: "Japanese" }, { code: "jv", name: "Javanese" },
    { code: "kn", name: "Kannada" }, { code: "kk", name: "Kazakh" }, { code: "km", name: "Khmer" },
    { code: "rw", name: "Kinyarwanda" }, { code: "ko", name: "Korean" }, { code: "ku", name: "Kurdish" },
    { code: "ky", name: "Kyrgyz" }, { code: "lo", name: "Lao" }, { code: "la", name: "Latin" },
    { code: "lv", name: "Latvian" }, { code: "lt", name: "Lithuanian" }, { code: "lb", name: "Luxembourgish" },
    { code: "mk", name: "Macedonian" }, { code: "mg", name: "Malagasy" }, { code: "ms", name: "Malay" },
    { code: "ml", name: "Malayalam" }, { code: "mt", name: "Maltese" }, { code: "mi", name: "Maori" },
    { code: "mr", name: "Marathi" }, { code: "mn", name: "Mongolian" }, { code: "my", name: "Myanmar (Burmese)" },
    { code: "ne", name: "Nepali" }, { code: "no", name: "Norwegian" }, { code: "ny", name: "Nyanja" },
    { code: "or", name: "Odia" }, { code: "ps", name: "Pashto" }, { code: "fa", name: "Persian" },
    { code: "pl", name: "Polish" }, { code: "pt", name: "Portuguese" }, { code: "pa", name: "Punjabi" },
    { code: "ro", name: "Romanian" }, { code: "ru", name: "Russian" }, { code: "sm", name: "Samoan" },
    { code: "gd", name: "Scots Gaelic" }, { code: "sr", name: "Serbian" }, { code: "st", name: "Sesotho" },
    { code: "sn", name: "Shona" }, { code: "sd", name: "Sindhi" }, { code: "si", name: "Sinhala" },
    { code: "sk", name: "Slovak" }, { code: "sl", name: "Slovenian" }, { code: "so", name: "Somali" },
    { code: "es", name: "Spanish" }, { code: "su", name: "Sundanese" }, { code: "sw", name: "Swahili" },
    { code: "sv", name: "Swedish" }, { code: "tl", name: "Tagalog" }, { code: "tg", name: "Tajik" },
    { code: "ta", name: "Tamil" }, { code: "tt", name: "Tatar" }, { code: "te", name: "Telugu" },
    { code: "th", name: "Thai" }, { code: "tr", name: "Turkish" }, { code: "tk", name: "Turkmen" },
    { code: "uk", name: "Ukrainian" }, { code: "ur", name: "Urdu" }, { code: "ug", name: "Uyghur" },
    { code: "uz", name: "Uzbek" }, { code: "vi", name: "Vietnamese" }, { code: "cy", name: "Welsh" },
    { code: "xh", name: "Xhosa" }, { code: "yi", name: "Yiddish" }, { code: "yo", name: "Yoruba" },
    { code: "zu", name: "Zulu" },
];

const fontMap = {
    arabic: ["ar", "ur", "fa", "ku", "ps", "sd", "ug", "yi"],
    hindi: ["hi", "mr", "ne", "sa", "bh"],
    latin: ["en", "es", "de", "fr", "it", "pt", "nl", "af", "sq", "ca", "da", "fi", "sv", "no", "is", "ga", "cy", "eu", "gl", "mt", "ro", "hu", "pl", "cs", "sk", "sl", "hr", "bs", "sr-Latn", "et", "lv", "lt", "tr", "az", "uz", "tk", "sw", "yo", "zu", "xh", "st", "tn", "ts", "ve", "ss", "nr", "id", "ms", "tl", "ceb", "la"]
};

function getFontClass(langCode) {
    if (fontMap.arabic.includes(langCode)) return 'font-arabic';
    if (fontMap.hindi.includes(langCode)) return 'font-hindi';
    return 'font-latin';
}

function getLangName(code) {
    if (code === 'auto') return 'Detect Language';
    const lang = languages.find(l => l.code === code);
    return lang ? lang.name : code;
}

/* =========================================================
   1. ORIGINAL DOUBLE CLICK LOGIC (Tooltip)
   ========================================================= */
let tooltip = null;

const handleDblClick = async (e) => {
    try {
        if (!chrome.runtime?.id) { document.removeEventListener('dblclick', handleDblClick); return; }
        if (e.target.closest('#trans-inline-popup')) return;

        const selection = window.getSelection().toString().trim();
        if (!selection || selection.split(/\s+/).length > 1) return;

        const res = await chrome.storage.sync.get(['tooltipEnabled', 'targetLang']);
        if (res.tooltipEnabled === false) return;

        const lang = res.targetLang || 'en';
        const translation = await chrome.runtime.sendMessage({
            action: 'translateWord', text: selection, lang: lang, srcLang: 'auto'
        });

        if (translation) showTooltip(e.clientX, e.clientY, translation, lang);
    } catch (error) {
        if (error.message.includes('Extension context invalidated')) document.removeEventListener('dblclick', handleDblClick);
    }
};

document.addEventListener('dblclick', handleDblClick);

function showTooltip(x, y, text, lang) {
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'trans-tooltip';
        document.body.appendChild(tooltip);
    }
    tooltip.className = '';
    tooltip.classList.add(getFontClass(lang), 'show');
    tooltip.textContent = text;

    let topPos = y + window.scrollY - 40;
    let leftPos = x + window.scrollX;

    if (topPos < window.scrollY + 5) topPos = y + window.scrollY + 20;

    tooltip.style.left = leftPos + 'px';
    tooltip.style.top = topPos + 'px';

    setTimeout(() => { if (tooltip) tooltip.classList.remove('show'); }, 3000);
}


/* =========================================================
   2. INLINE TRANSLATE ICON & ADVANCED POPUP LOGIC
   ========================================================= */
let selectionIcon = null;
let inlinePopup = null;
let translateDebounce = null;
let ignoreNextMouseUp = false;

document.addEventListener('click', (e) => {
    if (!e.target.closest('.trans-custom-select')) {
        document.querySelectorAll('.trans-custom-select').forEach(el => el.classList.remove('active'));
    }
});

document.addEventListener('mousedown', (e) => {
    if (!chrome.runtime?.id) return;
    if (e.target.closest('#trans-selection-icon') || e.target.closest('#trans-inline-popup')) return;

    removeIcon();
    removeInlinePopup();
});

document.addEventListener("mouseup", (e) => {
    if (!chrome.runtime?.id) return;

    if (ignoreNextMouseUp) return;

    if (e.target.closest('#trans-selection-icon') || e.target.closest('#trans-inline-popup')) return;

    setTimeout(() => {
        const selection = window.getSelection();
        const text = selection.toString().trim();

        if (text.length > 0 && text.split(/\s+/).length > 1) {
            const rect = selection.getRangeAt(0).getBoundingClientRect();
            createSelectionIcon(text, rect);
        }
    }, 10);
});

function createSelectionIcon(text, rect) {
    if (!selectionIcon) {
        selectionIcon = document.createElement("div");
        selectionIcon.id = "trans-selection-icon";
        selectionIcon.className = "trans-selection-icon";
        selectionIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><path d="M452 480H276.82L221 120.92h231a28.3 28.3 0 0 1 28.29 28.29v302.5A28.3 28.3 0 0 1 452 480" class="cls-1" style="fill:#cfd5da" /><path d="M452 480H276.82L221 120.92h49.51l209.82 208.22v122.57A28.3 28.3 0 0 1 452 480" class="cls-1" style="fill:#cfd5da" /><path d="m276.82 480 77-84.57H247.75z" style="fill: #393a7e;" /><path d="M60 32h176.75l117.07 363.43H60a28.3 28.3 0 0 1-28.29-28.28V60.29A28.3 28.3 0 0 1 60 32" class="cls-3" style="fill: #6366f1;" /><path d="M415.11 243.76H452v-17.29h-84v-27.89h-28.32v28.28h-45.57v16.9h100.57s-6 28.76-30.33 55.33C345.93 277.36 340.86 265 340.86 265h-22.39s4.27 10.48 18.46 31.43c2.6 3.84 7.61 9.78 13.9 16.75-18.58 19-28.83 28.43-28.83 28.43l14.14 11.79s13-11.77 27.45-26.43c23.42 24.78 52.7 53.53 52.7 53.53l13.36-14.53s-17.29-16.5-49.11-49.11q-1.91-1.96-3.7-3.85a250 250 0 0 0 14.31-17c18.46-24.36 23.96-52.25 23.96-52.25" class="cls-3" style="fill: #6366f1;" /><path d="M157 197.75v28.72h40.1a34.6 34.6 0 0 1-14.73 22.73 42 42 0 0 1-16.21 6.4 48 48 0 0 1-17.56 0 43 43 0 0 1-16.39-7.08 45.7 45.7 0 0 1-16.86-22.6 44.6 44.6 0 0 1 0-28.66 46 46 0 0 1 10.68-17.35 43.2 43.2 0 0 1 43.59-11.33 40 40 0 0 1 15.87 9.33c4.52-4.5 9-9 13.54-13.53 2.37-2.43 4.86-4.75 7.15-7.24a71 71 0 0 0-23.68-14.68 73.75 73.75 0 0 0-91.25 36.04A73.66 73.66 0 0 0 138 282.65a78.6 78.6 0 0 0 37.65.4 64.9 64.9 0 0 0 48.75-46.23 86.4 86.4 0 0 0 1.88-39.07Z" style="fill:#fff" /></svg>`;

        selectionIcon.addEventListener("mousedown", (e) => {
            e.preventDefault();
            e.stopPropagation();

            ignoreNextMouseUp = true;

            openInlinePopup(text, rect);
            removeIcon();

            setTimeout(() => { ignoreNextMouseUp = false; }, 200);
        });
        document.body.appendChild(selectionIcon);
    }

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    let iconTop = rect.bottom + scrollY + 5;
    let iconLeft = rect.right + scrollX;

    if (iconLeft + 35 > scrollX + window.innerWidth) {
        iconLeft = scrollX + window.innerWidth - 40;
    }
    if (iconTop + 35 > scrollY + window.innerHeight) {
        iconTop = rect.top + scrollY - 35;
    }

    selectionIcon.style.top = iconTop + "px";
    selectionIcon.style.left = iconLeft + "px";
}

function removeIcon() {
    if (selectionIcon) { selectionIcon.remove(); selectionIcon = null; }
}

function removeInlinePopup() {
    if (inlinePopup) { inlinePopup.remove(); inlinePopup = null; }
}

async function openInlinePopup(text, rect) {
    removeInlinePopup();
    const settings = await chrome.storage.sync.get(['srcLang', 'targetLang']);
    const sl = settings.srcLang || 'auto';
    const tl = settings.targetLang || 'en';

    inlinePopup = document.createElement("div");
    inlinePopup.id = "trans-inline-popup";

    inlinePopup.innerHTML = `
        <div class="trans-inline-header">
            <div class="trans-custom-select" id="trans-inline-src">
                <div class="trans-select-btn"></div>
                <div class="trans-select-dropdown">
                    <input type="text" class="trans-search-box" placeholder="Search language...">
                    <ul class="trans-options-list"></ul>
                </div>
            </div>
            
            <button class="trans-inline-swap" id="trans-inline-swap" title="Swap Languages">⇆</button>
            
            <div class="trans-custom-select" id="trans-inline-tgt">
                <div class="trans-select-btn"></div>
                <div class="trans-select-dropdown alt">
                    <input type="text" class="trans-search-box" placeholder="Search language...">
                    <ul class="trans-options-list"></ul>
                </div>
            </div>
        </div>
        <div class="trans-inline-body">
            <textarea id="trans-inline-source" class="trans-inline-textarea"></textarea>
            <textarea id="trans-inline-target" class="trans-inline-textarea" readonly></textarea>
        </div>
        <div class="trans-inline-footer">
            <button id="trans-inline-copy" class="trans-inline-action-btn" title="Copy translation">
                <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg> 
                Copy
            </button>
            <select id="trans-inline-search" class="trans-inline-action-select">
                <option value="" disabled selected>Search in...</option>
                <option value="https://www.google.com/search?q=">Google</option>
                <option value="https://www.google.com/search?udm=50&aep=11&q=">Google Ai</option>
                <option value="https://www.bing.com/search?q=">Bing</option>
                <option value="https://duckduckgo.com/?q=">DuckDuckGo</option>
                <option value="https://search.yahoo.com/search?p=">Yahoo</option>
            </select>
        </div>
    `;

    document.body.appendChild(inlinePopup);

    const srcBtn = inlinePopup.querySelector("#trans-inline-src .trans-select-btn");
    const tgtBtn = inlinePopup.querySelector("#trans-inline-tgt .trans-select-btn");
    const swapBtn = inlinePopup.querySelector("#trans-inline-swap");
    const sourceText = inlinePopup.querySelector("#trans-inline-source");
    const targetText = inlinePopup.querySelector("#trans-inline-target");
    const copyBtn = inlinePopup.querySelector("#trans-inline-copy");
    const searchSelect = inlinePopup.querySelector("#trans-inline-search");

    const setupBtn = (btn, val) => {
        btn.setAttribute('data-val', val);
        btn.textContent = getLangName(val) + ' ';
        const span = document.createElement('span');
        span.textContent = '▼';
        btn.appendChild(span);
    };

    setupBtn(srcBtn, sl);
    setupBtn(tgtBtn, tl);

    const srcList = inlinePopup.querySelector('#trans-inline-src .trans-options-list');
    const tgtList = inlinePopup.querySelector('#trans-inline-tgt .trans-options-list');

    const createLi = (code, name) => {
        const li = document.createElement('li');
        li.setAttribute('data-val', code);
        li.textContent = name;
        return li;
    };

    srcList.appendChild(createLi('auto', 'Detect Language'));
    languages.forEach(lang => {
        srcList.appendChild(createLi(lang.code, lang.name));
        tgtList.appendChild(createLi(lang.code, lang.name));
    });

    sourceText.value = text;

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    let topPos = rect.bottom + scrollY + 10;
    let leftPos = rect.left + scrollX;

    if (leftPos + 380 > scrollX + window.innerWidth) leftPos = scrollX + window.innerWidth - 380;
    if (leftPos < scrollX + 10) leftPos = scrollX + 10;

    if (topPos + 240 > scrollY + window.innerHeight) {
        topPos = rect.top + scrollY - 240;
        if (topPos < scrollY + 10) topPos = scrollY + 10;
    }

    inlinePopup.style.top = topPos + "px";
    inlinePopup.style.left = leftPos + "px";

    let isCopied = false;
    copyBtn.addEventListener("click", () => {
        const textToCopy = targetText.value;
        if (!textToCopy || textToCopy === "Translating..." || isCopied) return;

        navigator.clipboard.writeText(textToCopy).then(() => {
            isCopied = true;
            const originalChildren = Array.from(copyBtn.childNodes);
            copyBtn.replaceChildren();

            const svgNS = "http://www.w3.org/2000/svg";
            const svg = document.createElementNS(svgNS, "svg");
            svg.setAttribute("viewBox", "0 0 24 24");
            const path = document.createElementNS(svgNS, "path");
            path.setAttribute("d", "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z");
            svg.appendChild(path);

            copyBtn.appendChild(svg);
            copyBtn.appendChild(document.createTextNode(" Copied!"));

            setTimeout(() => {
                copyBtn.replaceChildren(...originalChildren);
                isCopied = false;
            }, 1500);
        });
    });

    searchSelect.addEventListener("change", (e) => {
        const textToSearch = targetText.value;
        if (!e.target.value || !textToSearch || textToSearch === "Translating...") {
            e.target.selectedIndex = 0;
            return;
        }

        const searchUrl = e.target.value + encodeURIComponent(textToSearch);
        window.open(searchUrl, "_blank");
        e.target.selectedIndex = 0;
    });

    const doTranslate = async () => {
        const query = sourceText.value.trim();
        if (!query) { targetText.value = ""; return; }

        targetText.value = "Translating...";
        try {
            const translation = await chrome.runtime.sendMessage({
                action: 'translateWord',
                text: query,
                lang: tgtBtn.getAttribute("data-val"),
                srcLang: srcBtn.getAttribute("data-val")
            });
            targetText.value = translation || "Error translating.";

            targetText.className = "trans-inline-textarea " + getFontClass(tgtBtn.getAttribute("data-val"));
            sourceText.className = "trans-inline-textarea " + getFontClass(srcBtn.getAttribute("data-val"));

            chrome.storage.sync.set({ srcLang: srcBtn.getAttribute("data-val"), targetLang: tgtBtn.getAttribute("data-val") });
        } catch (e) {
            targetText.value = "Context invalidated. Please refresh page.";
        }
    };

    const bindDropdown = (containerId) => {
        const container = inlinePopup.querySelector(`#${containerId}`);
        const btn = container.querySelector('.trans-select-btn');
        const search = container.querySelector('.trans-search-box');
        const list = container.querySelector('.trans-options-list');

        btn.onclick = (e) => {
            e.stopPropagation();
            inlinePopup.querySelectorAll('.trans-custom-select').forEach(el => {
                if (el !== container) el.classList.remove('active');
            });
            container.classList.toggle('active');
            if (container.classList.contains('active')) {
                search.value = '';
                Array.from(list.children).forEach(li => li.style.display = 'block');
                setTimeout(() => search.focus(), 50);
            }
        };

        search.oninput = (e) => {
            const term = e.target.value.toLowerCase();
            Array.from(list.children).forEach(li => {
                li.style.display = li.textContent.toLowerCase().includes(term) ? 'block' : 'none';
            });
        };

        list.onclick = (e) => {
            if (e.target.tagName === 'LI') {
                const val = e.target.getAttribute('data-val');
                btn.textContent = `${e.target.textContent} `;
                const span = document.createElement('span');
                span.textContent = '▼';
                btn.appendChild(span);
                btn.setAttribute('data-val', val);
                container.classList.remove('active');
                doTranslate();
            }
        };
    };

    bindDropdown("trans-inline-src");
    bindDropdown("trans-inline-tgt");

    swapBtn.addEventListener("click", () => {
        const srcVal = srcBtn.getAttribute('data-val');
        if (srcVal === "auto") {
            const oldVal = targetText.value;
            targetText.value = "Cannot swap 'Detect Language'";
            setTimeout(() => { targetText.value = oldVal; }, 1500);
            return;
        }

        const tgtVal = tgtBtn.getAttribute('data-val');
        const srcTextStr = srcBtn.textContent.replace("▼", "").trim();
        const tgtTextStr = tgtBtn.textContent.replace("▼", "").trim();

        srcBtn.textContent = `${tgtTextStr} `;
        const span1 = document.createElement('span');
        span1.textContent = '▼';
        srcBtn.appendChild(span1);
        srcBtn.setAttribute('data-val', tgtVal);

        tgtBtn.textContent = `${srcTextStr} `;
        const span2 = document.createElement('span');
        span2.textContent = '▼';
        tgtBtn.appendChild(span2);
        tgtBtn.setAttribute('data-val', srcVal);

        const tempText = sourceText.value;
        sourceText.value = targetText.value;
        targetText.value = tempText;

        doTranslate();
    });

    sourceText.addEventListener("input", () => {
        clearTimeout(translateDebounce);
        translateDebounce = setTimeout(doTranslate, 600);
    });

    setTimeout(doTranslate, 50);
}