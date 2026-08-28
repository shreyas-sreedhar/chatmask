const toggle = document.getElementById("toggle");
const statusEl = document.querySelector(".status");
const statusLabel = statusEl.querySelector(".label");

function render(enabled) {
  statusEl.dataset.on = String(enabled);
  statusLabel.textContent = enabled ? "Active" : "Inactive";
  toggle.setAttribute("aria-pressed", String(enabled));
  toggle.textContent = enabled ? "Deactivate" : "Activate";
}

chrome.storage.local.get({ enabled: false }, ({ enabled }) => {
  render(Boolean(enabled));
});

toggle.addEventListener("click", async () => {
  const { enabled } = await chrome.storage.local.get({ enabled: false });
  const next = !enabled;
  await chrome.storage.local.set({ enabled: next });
  render(next);
});
