import React, { useState } from 'react';
import { Chrome, X, Download, Copy, CheckCircle, Code, Globe } from 'lucide-react';

interface ExtensionPanelProps {
  onClose: () => void;
}

const ExtensionPanel: React.FC<ExtensionPanelProps> = ({ onClose }) => {
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  const manifestJson = `{
  "manifest_version": 3,
  "name": "Smart Sheets Extension",
  "version": "1.0",
  "description": "Kirim teks terpilih langsung ke Google Sheets",
  "permissions": ["activeTab", "contextMenus"],
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_title": "Smart Sheets"
  }
}`;

  const contentScript = `// content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSelectedText") {
    const selectedText = window.getSelection().toString();
    sendResponse({text: selectedText, url: window.location.href});
  }
});

// Context menu untuk kirim teks terpilih
document.addEventListener('mouseup', () => {
  const selectedText = window.getSelection().toString().trim();
  if (selectedText) {
    chrome.runtime.sendMessage({
      action: "textSelected",
      text: selectedText,
      url: window.location.href
    });
  }
});`;

  const backgroundScript = `// background.js
chrome.contextMenus.create({
  id: "sendToSheets",
  title: "Kirim ke Smart Sheets",
  contexts: ["selection"]
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "sendToSheets") {
    // Buka Smart Sheets app dengan teks terpilih
    const appUrl = "${window.location.origin}";
    chrome.tabs.create({
      url: appUrl
    }, (newTab) => {
      // Kirim pesan ke tab baru setelah loaded
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === newTab.id && info.status === 'complete') {
          chrome.tabs.sendMessage(tabId, {
            type: 'SELECTED_TEXT',
            text: info.selectionText,
            url: tab.url
          });
          chrome.tabs.onUpdated.removeListener(listener);
        }
      });
    });
  }
});`;

  const popupHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { width: 300px; padding: 20px; font-family: Arial, sans-serif; }
    .header { text-align: center; margin-bottom: 20px; }
    .btn { width: 100%; padding: 10px; margin: 5px 0; border: none; border-radius: 5px; cursor: pointer; }
    .primary { background: #4F46E5; color: white; }
    .secondary { background: #E5E7EB; color: #374151; }
  </style>
</head>
<body>
  <div class="header">
    <h3>Smart Sheets</h3>
    <p>Kirim teks terpilih ke spreadsheet</p>
  </div>
  <button class="btn primary" id="openApp">Buka Smart Sheets</button>
  <button class="btn secondary" id="sendSelected">Kirim Teks Terpilih</button>
  
  <script>
    document.getElementById('openApp').onclick = () => {
      chrome.tabs.create({url: '${window.location.origin}'});
    };
    
    document.getElementById('sendSelected').onclick = () => {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: "getSelectedText"}, (response) => {
          if (response && response.text) {
            chrome.tabs.create({url: '${window.location.origin}'}, (newTab) => {
              setTimeout(() => {
                chrome.tabs.sendMessage(newTab.id, {
                  type: 'SELECTED_TEXT',
                  text: response.text,
                  url: response.url
                });
              }, 1000);
            });
          }
        });
      });
    };
  </script>
</body>
</html>`;

  const copyToClipboard = async (text: string, type: 'manifest' | 'script') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'manifest') {
        setCopiedManifest(true);
        setTimeout(() => setCopiedManifest(false), 2000);
      } else {
        setCopiedScript(true);
        setTimeout(() => setCopiedScript(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/30 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl">
            <Chrome className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Browser Extension</h3>
            <p className="text-sm text-gray-600">Buat extension untuk quick send</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors p-1"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
            <Globe className="h-4 w-4 mr-2" />
            Cara Membuat Extension
          </h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Buat folder baru untuk extension</li>
            <li>Copy semua file di bawah ke folder tersebut</li>
            <li>Buka Chrome → Extensions → Developer mode</li>
            <li>Klik "Load unpacked" dan pilih folder extension</li>
            <li>Extension siap digunakan!</li>
          </ol>
        </div>

        {/* Manifest.json */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800 flex items-center">
              <Code className="h-4 w-4 mr-2 text-purple-600" />
              manifest.json
            </h4>
            <button
              onClick={() => copyToClipboard(manifestJson, 'manifest')}
              className="flex items-center space-x-1 px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors text-sm"
            >
              {copiedManifest ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copiedManifest ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto max-h-40">
            {manifestJson}
          </pre>
        </div>

        {/* Content Script */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800 flex items-center">
              <Code className="h-4 w-4 mr-2 text-green-600" />
              content.js
            </h4>
            <button
              onClick={() => copyToClipboard(contentScript, 'script')}
              className="flex items-center space-x-1 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors text-sm"
            >
              {copiedScript ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copiedScript ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto max-h-40">
            {contentScript}
          </pre>
        </div>

        {/* Additional Files */}
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <h4 className="font-semibold text-yellow-800 mb-2">File Tambahan</h4>
          <div className="text-sm text-yellow-700 space-y-2">
            <p><strong>background.js:</strong> Copy script di atas</p>
            <p><strong>popup.html:</strong> Copy HTML di atas</p>
            <p><strong>icons/:</strong> Tambahkan icon 16x16, 48x48, 128x128 px</p>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <h4 className="font-semibold text-green-800 mb-2">✨ Fitur Extension</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Klik kanan pada teks terpilih → "Kirim ke Smart Sheets"</li>
            <li>• Popup extension untuk akses cepat</li>
            <li>• Auto-detect teks terpilih di halaman web</li>
            <li>• Integrasi langsung dengan aplikasi ini</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExtensionPanel;