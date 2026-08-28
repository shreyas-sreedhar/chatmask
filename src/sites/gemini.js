(() => {
  const root = (globalThis.Chatmask = globalThis.Chatmask || {});
  root.sites = root.sites || [];

  root.sites.push({
    id: "gemini",
    match(host) {
      return (
        host === "gemini.google.com" ||
        host.endsWith(".gemini.google.com") ||
        host === "bard.google.com"
      );
    },
    coverCss: `
html.chatmask-enabled conversations-list [data-test-id="conversation"] a[href^="/app/"]:not([data-chatmask]) .title-text {
  visibility: hidden;
}
`,
    findLinks() {
      return document.querySelectorAll(
        'conversations-list [data-test-id="conversation"] a[href^="/app/"]'
      );
    },
    getTitleEl(link) {
      return link.querySelector(".title-text");
    },
    getConversationId(link) {
      const href = link.getAttribute("href") || "";
      const match = href.match(/\/app\/([a-z0-9]+)/i);
      return match ? match[1] : "";
    },
    getAriaTargets(link) {
      const item =
        link.closest('[data-test-id="conversation"]') || link.closest("gem-nav-list-item");
      if (!item) return [];
      return [...item.querySelectorAll("button[aria-label^='More options']")];
    },
  });
})();
