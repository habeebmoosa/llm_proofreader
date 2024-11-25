chrome.runtime.onInstalled.addListener(() => {
    if (chrome.contextMenus) {
      chrome.contextMenus.create({
        id: 'proofread-text',
        title: 'Proofread with AI',
        contexts: ['selection']
      });
    }
  });
  if (chrome.contextMenus && chrome.contextMenus.onClicked) {
    chrome.contextMenus.onClicked.addListener((info, tab) => {
      if (info.menuItemId === 'proofread-text') {
        chrome.tabs.sendMessage(tab.id, {
          action: 'proofread',
          text: info.selectionText
        });
      }
    });
  }