(() => {
  const ATTR_TEXT = "data-chatmask-original";
  const ATTR_COVERED = "data-chatmask-covered";
  const ATTR_ARIA = "data-chatmask-aria";
  const ATTR_MARK = "data-chatmask";
  const STYLE_ID = "chatmask-style";

  let enabled = false;
  let providers = { ...(globalThis.Chatmask.DEFAULTS.providers || {}) };
  let observer = null;
  let applyTimer = 0;

  function getAdapter() {
    const host = location.hostname;
    return (globalThis.Chatmask.sites || []).find((site) => site.match(host)) || null;
  }

  function shouldCover() {
    const adapter = getAdapter();
    return Boolean(enabled && adapter && providers[adapter.id]);
  }

  function sanitizeAria(original) {
    if (/^pin\b/i.test(original)) return "Pin";
    if (/conversation options/i.test(original)) return "Open conversation options";
    if (/^more options/i.test(original)) return "More options";
    if (original) return "Chat";
    return "";
  }

  function coverTextNode(el, id) {
    const current = el.textContent ?? "";
    let original = el.getAttribute(ATTR_TEXT);
    const covered = el.getAttribute(ATTR_COVERED);

    if (!original) {
      original = current;
      el.setAttribute(ATTR_TEXT, original);
    } else if (current !== original && current !== covered) {
      original = current;
      el.setAttribute(ATTR_TEXT, original);
    }

    const next = globalThis.Chatmask.coverText(id, original);
    el.setAttribute(ATTR_COVERED, next);
    if (current !== next) el.textContent = next;
  }

  function coverAria(el, nextLabel) {
    if (!el.hasAttribute(ATTR_ARIA) && el.hasAttribute("aria-label")) {
      el.setAttribute(ATTR_ARIA, el.getAttribute("aria-label") || "");
    }
    if (nextLabel && el.getAttribute("aria-label") !== nextLabel) {
      el.setAttribute("aria-label", nextLabel);
    }
  }

  function coverLink(adapter, link) {
    const id = adapter.getConversationId(link);
    if (!id) return;

    const titleEl = adapter.getTitleEl(link);
    if (titleEl) coverTextNode(titleEl, id);

    const covered =
      (titleEl && titleEl.getAttribute(ATTR_COVERED)) ||
      globalThis.Chatmask.coverText(id, "Chat");

    if (link.hasAttribute("aria-label") || link.hasAttribute(ATTR_ARIA)) {
      coverAria(link, covered);
    }

    for (const target of adapter.getAriaTargets(link)) {
      const original =
        target.getAttribute(ATTR_ARIA) || target.getAttribute("aria-label") || "";
      coverAria(target, sanitizeAria(original));
    }

    link.setAttribute(ATTR_MARK, "1");
  }

  function applyCover() {
    const adapter = getAdapter();
    if (!adapter) return;
    for (const link of adapter.findLinks()) {
      coverLink(adapter, link);
    }
  }

  function restoreAll() {
    document.querySelectorAll(`[${ATTR_TEXT}]`).forEach((el) => {
      const original = el.getAttribute(ATTR_TEXT);
      if (original != null) el.textContent = original;
      el.removeAttribute(ATTR_TEXT);
      el.removeAttribute(ATTR_COVERED);
    });
    document.querySelectorAll(`[${ATTR_ARIA}]`).forEach((el) => {
      const original = el.getAttribute(ATTR_ARIA);
      if (original) el.setAttribute("aria-label", original);
      else el.removeAttribute("aria-label");
      el.removeAttribute(ATTR_ARIA);
    });
    document.querySelectorAll(`[${ATTR_MARK}]`).forEach((el) => {
      el.removeAttribute(ATTR_MARK);
    });
  }

  function ensureStyle(adapter, cover) {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(style);
    }
    style.textContent = cover ? adapter.coverCss || "" : "";
  }

  function scheduleApply() {
    if (applyTimer) return;
    applyTimer = globalThis.requestAnimationFrame(() => {
      applyTimer = 0;
      if (shouldCover()) applyCover();
    });
  }

  function startObserver() {
    if (observer) return;
    observer = new MutationObserver(scheduleApply);
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
    });
  }

  function stopObserver() {
    if (!observer) return;
    observer.disconnect();
    observer = null;
  }

  function applyState() {
    const adapter = getAdapter();
    const cover = shouldCover();
    document.documentElement.classList.toggle("chatmask-enabled", cover);
    if (adapter) ensureStyle(adapter, cover);

    if (cover) {
      applyCover();
      startObserver();
      return;
    }

    stopObserver();
    restoreAll();
  }

  function readState(stored) {
    const defaults = globalThis.Chatmask.DEFAULTS;
    enabled = Boolean(stored.enabled);
    providers = { ...defaults.providers, ...(stored.providers || {}) };
    applyState();
  }

  chrome.storage.local.get(globalThis.Chatmask.DEFAULTS, readState);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local") return;
    if (!changes.enabled && !changes.providers) return;
    chrome.storage.local.get(globalThis.Chatmask.DEFAULTS, readState);
  });
})();
