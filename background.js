// Opens SimpleCRM in a full-tab window or side panel on extension icon click
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: chrome.runtime.getURL("popup.html") });
});