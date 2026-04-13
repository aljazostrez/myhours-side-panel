// Toggle the side panel when the toolbar icon is clicked (Chrome only).
if (typeof chrome.sidePanel !== 'undefined') {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
}

