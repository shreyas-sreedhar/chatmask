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
    id: "chatgpt",
    match(host) {
      return (
        host === "chatgpt.com" ||
        host.endsWith(".chatgpt.com") ||
        host === "chat.openai.com"
      );
    },
    coverCss: `
html.chatmask-enabled #history a[href^="/c/"]:not([data-chatmask]) [data-marquee-text],
html.chatmask-enabled #history a[href^="/c/"]:not([data-chatmask]) .truncate {
  visibility: hidden;
}
`,
    findLinks() {
      return document.querySelectorAll('#history a[href^="/c/"]');
    },
    getTitleEl(link) {
      const marquee = link.querySelector("[data-marquee-text]");
      if (marquee) return deepestSpan(marquee);
      return link.querySelector(".truncate");
    },
    getConversationId(link) {
      const href = link.getAttribute("href") || "";
      const match = href.match(/\/c\/([a-z0-9-]+)/i);
      return match ? match[1] : "";
    },
    getAriaTargets(link) {
      return [...link.querySelectorAll("button[aria-label]")];
    },
  });
})();
