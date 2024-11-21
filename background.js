// Wait for AI capabilities before setting up
chrome.runtime.onInstalled.addListener(() => {
    // Check if AI is available before setting up context menu
    if (chrome.contextMenus) {
      chrome.contextMenus.create({
        id: 'proofread-text',
        title: 'Proofread with AI',
        contexts: ['selection']
      });
    }
  });
  // Only add click listener if contextMenus exist
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