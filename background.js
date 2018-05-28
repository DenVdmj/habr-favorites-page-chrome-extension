
chrome.browserAction.onClicked.addListener(
  tab => chrome.tabs.create({
    url: 'popup/popup.html'
  })
);
