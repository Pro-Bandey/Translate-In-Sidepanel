
window.UniversalToasterConfig = {
    // COLORS
    // Set to null to allow Auto-Contrast (Recommended)
    backgroundColor: "var(--bg-color)",   // e.g. "#333"
    textColor: "var(--primary-color)",   // e.g. "#fff"

    // TYPOGRAPHY
    fontFamily: "inherit", // Uses page font
    fontSize: "13px",
    fontWeight: "500",

    // SHAPE
    borderRadius: "6px",
    padding: "8px 12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
};



/**
 * Universal Toaster (v3.1 - Mobile Viewport Fix)
 * ------------------------------------------------------------------
 * Fixes: Tooltips getting cut off on small mobile screens.
 * Features:
 * - New Mobile-Aware Positioning: Centers the tooltip on mobile and 
 *   clamps it to the screen edges for full visibility.
 * ------------------------------------------------------------------
 */

(function () {
    // --- 1. SETUP (No changes here) ---
    const userConfig = window.UniversalToasterConfig || {};

    const settings = {
        bg: userConfig.backgroundColor || null,
        text: userConfig.textColor || null,
        font: userConfig.fontFamily || 'inherit',
        size: userConfig.fontSize || '13px',
        radius: userConfig.borderRadius || '6px',
        padding: userConfig.padding || '8px 12px',
        shadow: userConfig.boxShadow || '0 4px 12px rgba(0,0,0,0.2)'
    };

    const css = `
        .universal-toaster-popup {
            position: fixed;
            z-index: 2147483647;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.1s ease-out, transform 0.1s ease-out; /* Added transform for smoother mobile positioning */
            visibility: hidden;
            border-radius: ${settings.radius};
            font-size: ${settings.size};
            font-family: ${settings.font};
            padding: ${settings.padding};
            box-shadow: ${settings.shadow};
            border: 1px solid rgba(255,255,255,0.1);
            white-space: pre-wrap;
            max-width: 95vw;
            line-height: 1.4;
        }
        .universal-toaster-popup.visible {
            opacity: 1;
            visibility: visible;
        }
        .universal-toaster-popup span {
            display: inline-block;
        }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.textContent = css;
    document.head.appendChild(styleSheet);

    const tooltip = document.createElement('div');
    tooltip.className = 'universal-toaster-popup';
    document.body.appendChild(tooltip);

    // --- 2. HELPERS & PARSERS (No changes here) ---
    let activeElement = null;
    const loadedFonts = new Set();

    function escapeHtml(text) { if (!text) return ""; return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"); }
    function loadGoogleFont(fontName) { if (!fontName || loadedFonts.has(fontName)) return; const link = document.createElement('link'); link.href = `https://fonts.googleapis.com/css?family=${fontName.replace(/\s+/g, '+')}&display=swap`; link.rel = 'stylesheet'; document.head.appendChild(link); loadedFonts.add(fontName); }
    function parseCustomSyntax(rawText) { let text = escapeHtml(rawText); text = text.replace(/&amp;(cl|bgcl|fw|fn|chr)=/g, "&$1=").replace(/&amp;(cl|bgcl|fw|fn|chr);/g, "&$1;"); text = text.replace(/&chr=(\d+);(.*?)&chr;/g, (m, l, c) => (c.length > parseInt(l) ? c.substring(0, parseInt(l)) + '...' : c)); text = text.replace(/&fn=(.*?);/g, (m, f) => { loadGoogleFont(f); return `<span style="font-family:'${f}', sans-serif">`; }); text = text.replace(/&fn;/g, '</span>');[{ tag: 'cl', css: 'color' }, { tag: 'bgcl', css: 'background-color' }, { tag: 'fw', css: 'font-weight' }].forEach(i => { text = text.replace(new RegExp(`&${i.tag}=(.*?);`, 'g'), `<span style="${i.css}:$1">`).replace(new RegExp(`&${i.tag};`, 'g'), '</span>'); }); return text; }
    function applyTheme() { if (settings.bg && settings.text) { tooltip.style.backgroundColor = settings.bg; tooltip.style.color = settings.text; return; } let s = window.getComputedStyle(document.body); let c = s.backgroundColor; if (c === 'rgba(0, 0, 0, 0)' || c === 'transparent') c = 'rgb(255, 255, 255)'; const r = c.match(/\d+/g); let i = true; if (r) { const b = Math.round(((parseInt(r[0]) * 299) + (parseInt(r[1]) * 587) + (parseInt(r[2]) * 114)) / 1000); if (b < 125) i = false; } if (i) { tooltip.style.backgroundColor = '#222222'; tooltip.style.color = '#ffffff'; } else { tooltip.style.backgroundColor = '#ffffff'; tooltip.style.color = '#000000'; } }

    // --- 3. EVENT LISTENERS ---
    const hideTooltip = () => { if (activeElement) { tooltip.classList.remove('visible'); activeElement = null; } };

    document.addEventListener('mouseover', (e) => {
        const target = e.target.closest('[title], [data-toaster-title]');
        if (target) {
            if (target.hasAttribute('title')) { const raw = target.getAttribute('title'); if (raw && raw.trim()) { target.setAttribute('data-toaster-title', raw); target.removeAttribute('title'); } }
            const rawText = target.getAttribute('data-toaster-title');
            if (rawText) { activeElement = target; tooltip.innerHTML = parseCustomSyntax(rawText); applyTheme(); tooltip.classList.add('visible'); }
        }
    });

    // ###############################################################
    // ###   POSITIONING LOGIC - UPDATED FOR MOBILE AWARENESS      ###
    // ###############################################################
    document.addEventListener('mousemove', (e) => {
        if (!activeElement || !activeElement.isConnected) { hideTooltip(); return; }
        if (!tooltip.classList.contains('visible')) return;

        const rect = tooltip.getBoundingClientRect();
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        const offset = 15; // Vertical offset on mobile, cursor offset on desktop
        const mobileBreakpoint = 768; // The screen width to switch to mobile logic
        const mobileEdgePadding = 10; // Space from the screen edge on mobile

        let x, y;

        // --- Vertical Positioning (same for both) ---
        // Position below the cursor/finger, but flip above if it overflows the bottom
        y = e.clientY + offset;
        if (y + rect.height > winH) {
            y = e.clientY - rect.height - offset;
        }

        // --- Horizontal Positioning (DIFFERENT for mobile vs desktop) ---
        if (winW <= mobileBreakpoint) {
            // MOBILE LOGIC: Center it, then clamp it to screen edges.
            x = e.clientX - (rect.width / 2); // Center under the finger

            // Clamp to left edge
            if (x < mobileEdgePadding) {
                x = mobileEdgePadding;
            }
            // Clamp to right edge
            if (x + rect.width > winW - mobileEdgePadding) {
                x = winW - rect.width - mobileEdgePadding;
            }

        } else {
            // DESKTOP LOGIC: Position to the right of cursor, but flip left if it overflows.
            x = e.clientX + offset;
            if (x + rect.width > winW) {
                x = e.clientX - rect.width - offset;
            }
        }

        tooltip.style.transform = `translate(${x}px, ${y}px)`; // Use transform for better performance
        // Clear old left/top styles if they exist
        tooltip.style.left = '0';
        tooltip.style.top = '0';
    });

    document.addEventListener('mouseout', (e) => {
        const target = e.target.closest('[data-toaster-title]');
        if (target && target === activeElement) { hideTooltip(); }
    });

    // Safety Triggers (no changes)
    window.addEventListener('mousedown', hideTooltip);
    window.addEventListener('scroll', hideTooltip, true);
    window.addEventListener('blur', hideTooltip);
})();