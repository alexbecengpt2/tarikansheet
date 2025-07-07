import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TextInput from './components/TextInput';
import PreviewTable from './components/PreviewTable';
import SheetsConfig from './components/SheetsConfig';
import HistoryPanel from './components/HistoryPanel';
import ExtensionPanel from './components/ExtensionPanel';
import QuickSendButton from './components/QuickSendButton';
import { parseTextToColumns } from './utils/textParser';
import { sendToGoogleSheets } from './utils/sheetsIntegration';
import { HistoryEntry, SheetsConfig as SheetsConfigType } from './types';

function App() {
  const [inputText, setInputText] = useState('');
  const [parsedData, setParsedData] = useState<string[][]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [sheetsConfig, setSheetsConfig] = useState<SheetsConfigType>({
    spreadsheetId: '1zcsm2DPVccpnOGz_9HkVotn9M9f6KRiA_-C2CNld6_c',
    apiKey: '',
    range: 'Sheet1!A:B',
    sheetName: 'Sheet1',
    columns: 'A:B'
  });
  const [showHistory, setShowHistory] = useState(false);
  const [showExtension, setShowExtension] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('text-to-sheets-history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    
    const savedConfig = localStorage.getItem('text-to-sheets-config');
    if (savedConfig) {
      setSheetsConfig(JSON.parse(savedConfig));
    }

    // Listen for text selection events
    const handleTextSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        setSelectedText(selection.toString().trim());
      }
    };

    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('keyup', handleTextSelection);

    // Listen for messages from browser extension
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SELECTED_TEXT') {
        setInputText(event.data.text);
        showNotification('Teks berhasil diterima dari extension!', 'info');
      }
    };

    // Listen for custom events from extension content script
    const handleExtensionText = (event: CustomEvent) => {
      console.log('Extension text received:', event.detail);
      setInputText(event.detail.text);
      showNotification('Teks berhasil diterima dari extension!', 'success');
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('extensionTextReceived', handleExtensionText as EventListener);

    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('keyup', handleTextSelection);
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('extensionTextReceived', handleExtensionText as EventListener);
    };
  }, []);

  useEffect(() => {
    if (inputText.trim()) {
      const parsed = parseTextToColumns(inputText);
      setParsedData(parsed);
    } else {
      setParsedData([]);
    }
  }, [inputText]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSendToSheets = async (customConfig?: SheetsConfigType) => {
    const configToUse = customConfig || sheetsConfig;
    
    if (!parsedData.length) {
      showNotification('Silakan masukkan teks terlebih dahulu', 'error');
      return;
    }

    if (!configToUse.spreadsheetId) {
      showNotification('Silakan konfigurasi Google Sheets terlebih dahulu', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      await sendToGoogleSheets(parsedData, configToUse);
      
      const newEntry: HistoryEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        originalText: inputText,
        parsedData: parsedData,
        success: true,
        sheetName: configToUse.sheetName
      };
      
      const updatedHistory = [newEntry, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('text-to-sheets-history', JSON.stringify(updatedHistory));
      
      setInputText('');
      setSelectedText('');
      showNotification(`Data berhasil dikirim ke sheet "${configToUse.sheetName}"!`, 'success');
    } catch (error) {
      const newEntry: HistoryEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        originalText: inputText,
        parsedData: parsedData,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        sheetName: configToUse.sheetName
      };
      
      const updatedHistory = [newEntry, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('text-to-sheets-history', JSON.stringify(updatedHistory));
      
      showNotification('Gagal mengirim data ke Google Sheets. Coba gunakan metode alternatif.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickSend = async (text: string) => {
    const parsed = parseTextToColumns(text);
    if (parsed.length === 0) {
      showNotification('Tidak ada data yang dapat diparse dari teks yang dipilih', 'error');
      return;
    }

    setIsProcessing(true);
    try {
      await sendToGoogleSheets(parsed, sheetsConfig);
      
      const newEntry: HistoryEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        originalText: text,
        parsedData: parsed,
        success: true,
        sheetName: sheetsConfig.sheetName
      };
      
      const updatedHistory = [newEntry, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('text-to-sheets-history', JSON.stringify(updatedHistory));
      
      setSelectedText('');
      showNotification(`Quick send berhasil ke sheet "${sheetsConfig.sheetName}"!`, 'success');
    } catch (error) {
      showNotification('Gagal mengirim data dengan quick send. Coba gunakan metode alternatif.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfigSave = (config: SheetsConfigType) => {
    setSheetsConfig(config);
    localStorage.setItem('text-to-sheets-config', JSON.stringify(config));
    showNotification('Konfigurasi Google Sheets tersimpan', 'success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative z-10">
        <Header 
          onShowHistory={() => setShowHistory(!showHistory)}
          onShowExtension={() => setShowExtension(!showExtension)}
        />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Input Section */}
              <div className="xl:col-span-2 space-y-6">
                <TextInput
                  value={inputText}
                  onChange={setInputText}
                  placeholder="Teks dari extension akan muncul di sini secara otomatis..."
                />
                
                {parsedData.length > 0 && (
                  <PreviewTable
                    data={parsedData}
                    onSendToSheets={handleSendToSheets}
                    isProcessing={isProcessing}
                    config={sheetsConfig}
                  />
                )}
              </div>
              
              {/* Configuration Section */}
              <div className="xl:col-span-2 space-y-6">
                <SheetsConfig
                  config={sheetsConfig}
                  onSave={handleConfigSave}
                />
                
                {showExtension && (
                  <ExtensionPanel
                    onClose={() => setShowExtension(false)}
                  />
                )}
                
                {showHistory && (
                  <HistoryPanel
                    history={history}
                    onClose={() => setShowHistory(false)}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      {/* Quick Send Button */}
      {selectedText && (
        <QuickSendButton
          selectedText={selectedText}
          onQuickSend={handleQuickSend}
          onClose={() => setSelectedText('')}
          isProcessing={isProcessing}
        />
      )}
      
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-xl shadow-2xl transform transition-all duration-300 z-50 backdrop-blur-sm border ${
          notification.type === 'success' 
            ? 'bg-green-500/90 text-white border-green-400' 
            : notification.type === 'error'
            ? 'bg-red-500/90 text-white border-red-400'
            : 'bg-blue-500/90 text-white border-blue-400'
        }`}>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              notification.type === 'success' ? 'bg-green-300' :
              notification.type === 'error' ? 'bg-red-300' : 'bg-blue-300'
            }`}></div>
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default App;