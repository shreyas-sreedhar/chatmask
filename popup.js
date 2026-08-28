const toggle = document.getElementById("toggle");
const statusEl = document.querySelector(".status");
const statusLabel = statusEl.querySelector(".label");
const providerInputs = [...document.querySelectorAll('input[name="provider"]')];
const defaults = globalThis.Chatmask.DEFAULTS;

function mergeProviders(stored) {
  return { ...defaults.providers, ...(stored || {}) };
}

function render(enabled, providers) {
  statusEl.dataset.on = String(enabled);
  statusEl.title = enabled ? "Active" : "Inactive";
  statusLabel.textContent = enabled ? "Active" : "Inactive";
  toggle.setAttribute("aria-checked", String(enabled));
  toggle.setAttribute("aria-label", enabled ? "Masks on" : "Masks off");
  providerInputs.forEach((input) => {
    input.checked = providers[input.value] !== false;
  });
}

async function loadState() {
  const stored = await chrome.storage.local.get(defaults);
  return {
    enabled: Boolean(stored.enabled),
    providers: mergeProviders(stored.providers),
  };
}

async function persistAndSync(patch) {
  await chrome.storage.local.set(patch);
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id == null) return;
  const sent = chrome.tabs.sendMessage(tab.id, { type: "chatmask:sync" });
  if (sent && typeof sent.catch === "function") sent.catch(() => {});
}

chrome.storage.local.get(defaults, (stored) => {
  render(Boolean(stored.enabled), mergeProviders(stored.providers));
});

toggle.addEventListener("click", async () => {
  const state = await loadState();
  const enabled = !state.enabled;
  await persistAndSync({ enabled });
  render(enabled, state.providers);
});

providerInputs.forEach((input) => {
  input.addEventListener("change", async () => {
    const providers = { ...defaults.providers };
    providerInputs.forEach((el) => {
      providers[el.value] = el.checked;
    });
    await persistAndSync({ providers });
  });
});

document.querySelector(".github")?.addEventListener("click", (event) => {
  event.preventDefault();
  chrome.tabs.create({ url: event.currentTarget.href });
});
