
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "translate-sidepanel",
        title: "Translate '%s' in Side Panel",
        contexts: ["selection"],
    });

    chrome.contextMenus.create({
        id: "read-aloud",
        title: "Listen to '%s'",
        contexts: ["selection"],
    });
});

function requestTranslation(text, tab) {
    const newQuery = {
        text: text,
        ts: Date.now()
    };
    chrome.storage.local.set({ lastQuery: newQuery }, () => {
        chrome.sidePanel.open({ windowId: tab.windowId });
    });
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "translate-sidepanel") {
        requestTranslation(info.selectionText, tab);
    } else if (info.menuItemId === "read-aloud") {
        chrome.tts.stop();
        chrome.tts.speak(info.selectionText, { rate: 0.9 });
    }
});


chrome.commands.onCommand.addListener((command) => {
    if (command === "translate-shortcut") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs[0]) return;
            const tab = tabs[0];

            chrome.sidePanel.open({ windowId: tab.windowId }).then(() => {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => window.getSelection().toString()
                }).then((results) => {
                    const text = results[0]?.result?.trim();
                    if (text) {
                        chrome.storage.local.set({ lastQuery: { text: text, ts: Date.now() } });
                    }
                }).catch(err => { });
            });
        });
    }
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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