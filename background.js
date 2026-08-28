// Register this event so storage changes reach content scripts in MV3.
chrome.storage.local.onChanged.addListener(() => {});
