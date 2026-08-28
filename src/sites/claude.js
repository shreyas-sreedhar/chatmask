(() => {
  const root = (globalThis.Chatmask = globalThis.Chatmask || {});
  root.sites = root.sites || [];

  function deepestSpan(node) {
    let current = node;
    for (;;) {
      const children = [...current.children].filter((child) => child.tagName === "SPAN");
      if (children.length !== 1) break;
      current = children[0];
    }
    return current;
  }

  root.sites.push({
    id: "claude",
    match(host) {
      return host === "claude.ai" || host.endsWith(".claude.ai");
    },
    coverCss: `
html.chatmask-enabled [data-row-key^="chat:"] a[href^="/chat/"]:not([data-chatmask]) [data-row-label] {
  visibility: hidden;
}
`,
    findLinks() {
      return document.querySelectorAll('[data-row-key^="chat:"] a[href^="/chat/"]');
    },
    getTitleEl(link) {
      const label = link.querySelector("[data-row-label]");
      if (label) return deepestSpan(label);
      return link.querySelector(".dframe-fade-label");
    },
    getConversationId(link) {
      const row = link.closest("[data-row-key^='chat:']");
      const key = row && row.getAttribute("data-row-key");
      const fromKey = key && key.match(/^chat:([a-z0-9-]+)/i);
      if (fromKey) return fromKey[1];

      const href = link.getAttribute("href") || "";
      const fromHref = href.match(/\/chat\/([a-z0-9-]+)/i);
      return fromHref ? fromHref[1] : "";
    },
    getAriaTargets(link) {
      const row = link.closest("[data-row]") || link.closest("[data-row-key^='chat:']");
      if (!row) return [];
      return [
        ...row.querySelectorAll(
          "button[data-row-action][aria-label], button[aria-label^='More options']"
        ),
      ];
    },
  });
})();
