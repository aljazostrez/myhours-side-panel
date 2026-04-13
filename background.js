// Toggle the side panel when the toolbar icon is clicked.
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});

// Build a data: URL from login-help.html and register it as a dynamic DNR redirect rule.
async function setupLoginRedirect() {
  const response = await fetch(chrome.runtime.getURL('login-help.html'));
  const html = await response.text();
  const dataUrl = 'data:text/html,' + encodeURIComponent(html);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [2],
    addRules: [{
      id: 2,
      priority: 2,
      action: {
        type: 'redirect',
        redirect: { url: dataUrl }
      },
      condition: {
        urlFilter: '||login.myhours.com',
        resourceTypes: ['sub_frame']
      }
    }]
  });
}

setupLoginRedirect();

