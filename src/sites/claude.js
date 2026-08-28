(() => {
  const root = (globalThis.Chatmask = globalThis.Chatmask || {});
  root.sites = root.sites || [];

  // Stub until Claude sidebar HTML is provided. Same adapter interface as ChatGPT.
  root.sites.push({
    id: "claude",
    match(host) {
      return host === "claude.ai" || host.endsWith(".claude.ai");
    },
    coverCss: "",
    findLinks() {
      return [];
    },
    getTitleEl() {
      return null;
    },
    getConversationId() {
      return "";
    },
    getAriaTargets() {
      return [];
    },
  });
})();
