// background.js
console.log('Background script loaded');

// Create context menu when extension is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed, creating context menu');
  
  chrome.contextMenus.create({
    id: "sendToSheets",
    title: "📊 Kirim ke Smart Sheets",
    contexts: ["selection"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Context menu clicked:', info);
  
  if (info.menuItemId === "sendToSheets" && info.selectionText) {
    const appUrl = "https://ex-tarikan.netlify.app/";
    
    // Check if Smart Sheets app is already open
    chrome.tabs.query({ url: appUrl + "*" }, (appTabs) => {
      if (appTabs && appTabs.length > 0) {
        // Found an existing app tab
        const appTabId = appTabs[0].id;
        console.log('Found existing app tab:', appTabId);
        
        // Focus on the app tab
        chrome.tabs.update(appTabId, { active: true });
        chrome.windows.update(appTabs[0].windowId, { focused: true });
        
        // Send text to the app tab
        chrome.tabs.sendMessage(appTabId, {
          type: 'SELECTED_TEXT',
          text: info.selectionText,
          url: tab.url
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error sending message to app tab:', chrome.runtime.lastError);
            // Send error notification to the original tab
            chrome.tabs.sendMessage(tab.id, {
              type: 'SHOW_NOTIFICATION',
              message: 'Gagal mengirim teks: ' + chrome.runtime.lastError.message,
              notificationType: 'error'
            }).catch(err => console.error('Error sending notification:', err));
          } else {
            console.log('Message sent to app tab successfully');
            // Send success notification to the original tab
            chrome.tabs.sendMessage(tab.id, {
              type: 'SHOW_NOTIFICATION',
              message: 'Teks berhasil dikirim ke Smart Sheets! 🎉',
              notificationType: 'success'
            }).catch(err => console.error('Error sending notification:', err));
          }
        });
      } else {
        // No app tab found, send error notification
        chrome.tabs.sendMessage(tab.id, {
          type: 'SHOW_NOTIFICATION',
          message: 'Smart Sheets belum dibuka! Silakan buka aplikasi terlebih dahulu.',
          notificationType: 'error'
        }).catch(err => console.error('Error sending notification:', err));
      }
    });
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  if (request.action === "textSelected") {
    console.log('Text selected on page:', request.text);
  }
  
  return true;
});