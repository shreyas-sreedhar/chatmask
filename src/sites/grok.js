(() => {
  const root = (globalThis.Chatmask = globalThis.Chatmask || {});
  root.sites = root.sites || [];

  root.sites.push({
    id: "grok",
    match(host) {
      return host === "grok.com" || host.endsWith(".grok.com") || host === "grok.x.ai";
    },
    coverCss: `
html.chatmask-enabled [data-sidebar="menu"] a[href^="/c/"]:not([data-chatmask]) > span {
  visibility: hidden;
}
`,
    findLinks() {
      return document.querySelectorAll('[data-sidebar="menu"] a[href^="/c/"]');
    },
    getTitleEl(link) {
      return link.querySelector(":scope > span");
    },
    getConversationId(link) {
      const href = link.getAttribute("href") || "";
      const match = href.match(/\/c\/([a-z0-9-]+)/i);
      return match ? match[1] : "";
    },
    getAriaTargets() {
      return [];
    },
  });
})();
