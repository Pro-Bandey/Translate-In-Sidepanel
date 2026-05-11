browser.runtime.onInstalled.addListener(() => {
    // 1. The Translate Menu (Only shows when text is highlighted)
    browser.contextMenus.create({
        id: "translate-sidepanel",
        title: "Translate '%s' in Side Panel",
        contexts: ["selection"]
    });

    // 2. The Settings Menu (Shows on the Extension Icon AND page background)
    browser.contextMenus.create({
        id: "open-settings",
        title: "Settings",
        contexts: ["action"]
    });
});

browser.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === "translate-sidepanel") {
        // Open the sidebar and translate
        browser.sidebarAction.open().catch(() => { });
        browser.storage.local.set({
            lastQuery: { text: info.selectionText, ts: Date.now() }
        });
    } else if (info.menuItemId === "open-settings") {
        browser.runtime.openOptionsPage();
    }
});

browser.commands.onCommand.addListener((command) => {
    if (command === "translate-shortcut") {
        browser.sidebarAction.open().catch(() => { });

        browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
            if (!tabs[0]) return;
            browser.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: () => window.getSelection().toString()
            }).then((results) => {
                const text = results[0]?.result?.trim();
                if (text) {
                    browser.storage.local.set({ lastQuery: { text: text, ts: Date.now() } });
                }
            }).catch(() => { });
        });
    }
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'translateWord') {
        const sl = request.srcLang || 'auto';
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${request.lang}&dt=t&q=${encodeURIComponent(request.text)}`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                // Combine all translated sentences (Google splits them into an array)
                const translatedText = data[0].map(item => item[0]).join('');
                sendResponse(translatedText);
            })
            .catch(() => sendResponse("Translation error"));
        return true;
    }
});