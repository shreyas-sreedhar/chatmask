(() => {
  const root = (globalThis.Chatmask = globalThis.Chatmask || {});
  root.DEFAULTS = {
    enabled: false,
    providers: {
      chatgpt: true,
      claude: true,
      grok: true,
      gemini: true,
    },
  };
})();
