// content.js
console.log('Smart Sheets Extension loaded');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);
  
  if (request.action === "getSelectedText") {
    const selectedText = window.getSelection().toString().trim();
    console.log('Selected text:', selectedText);
    sendResponse({
      text: selectedText, 
      url: window.location.href,
      success: true
    });
  } else if (request.type === 'SELECTED_TEXT') {
    // Handle incoming text from extension
    console.log('Received text from extension:', request.text);
    
    // Trigger the input event in the app
    const event = new CustomEvent('extensionTextReceived', {
      detail: {
        text: request.text,
        url: request.url
      }
    });
    window.dispatchEvent(event);
    
    sendResponse({ success: true });
  } else if (request.type === 'SHOW_NOTIFICATION') {
    // Show notification on the current page
    showTemporaryNotification(request.message, request.notificationType);
    sendResponse({ success: true });
  }
  
  return true; // Keep message channel open for async response
});

// Function to display a temporary notification
function showTemporaryNotification(message, type = 'info') {
  // Remove existing notification if any
  const existingNotification = document.getElementById('smart-sheets-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  const notificationDiv = document.createElement('div');
  notificationDiv.id = 'smart-sheets-notification';
  
  // Styling
  Object.assign(notificationDiv.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '15px 20px',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    zIndex: '999999',
    color: 'white',
    fontWeight: '600',
    fontSize: '14px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    opacity: '0',
    transform: 'translateY(-20px) scale(0.9)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    maxWidth: '350px',
    wordWrap: 'break-word',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.2)'
  });

  // Set background color based on type
  if (type === 'success') {
    notificationDiv.style.background = 'linear-gradient(135deg, #10B981, #059669)';
  } else if (type === 'error') {
    notificationDiv.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)';
  } else {
    notificationDiv.style.background = 'linear-gradient(135deg, #3B82F6, #2563EB)';
  }

  // Add icon based on type
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  notificationDiv.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 16px;">${icon}</span>
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(notificationDiv);

  // Show notification with animation
  requestAnimationFrame(() => {
    notificationDiv.style.opacity = '1';
    notificationDiv.style.transform = 'translateY(0) scale(1)';
  });

  // Hide after 4 seconds
  setTimeout(() => {
    notificationDiv.style.opacity = '0';
    notificationDiv.style.transform = 'translateY(-20px) scale(0.9)';
    
    setTimeout(() => {
      if (notificationDiv.parentNode) {
        notificationDiv.parentNode.removeChild(notificationDiv);
      }
    }, 300);
  }, 4000);
}

// Listen for text selection
document.addEventListener('mouseup', () => {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText && selectedText.length > 0) {
    console.log('Text selected:', selectedText);
    chrome.runtime.sendMessage({
      action: "textSelected",
      text: selectedText,
      url: window.location.href
    }).catch(err => console.log('Error sending message:', err));
  }
});

console.log('Content script setup complete');