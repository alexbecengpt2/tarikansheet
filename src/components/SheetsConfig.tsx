import React, { useState, useEffect } from 'react';
import { Settings, Save, Eye, EyeOff, CheckCircle, TestTube, Loader2, Plus, Trash2, Edit3, AlertCircle, ExternalLink, Copy, Link } from 'lucide-react';
import { SheetsConfig as SheetsConfigType, SheetInfo } from '../types';
import { testSheetsConnection, getSheetsList, extractSpreadsheetId, validateApiKey } from '../utils/sheetsIntegration';

interface SheetsConfigProps {
  config: SheetsConfigType;
  onSave: (config: SheetsConfigType) => void;
}

const SheetsConfig: React.FC<SheetsConfigProps> = ({ config, onSave }) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [availableSheets, setAvailableSheets] = useState<SheetInfo[]>([]);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState<SheetsConfigType[]>([]);
  const [showConfigManager, setShowConfigManager] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('text-to-sheets-configs');
    if (saved) {
      setSavedConfigs(JSON.parse(saved));
    }
  }, []);

  const handleSave = () => {
    onSave(localConfig);
    
    // Save to multiple configs
    const existingIndex = savedConfigs.findIndex(c => c.sheetName === localConfig.sheetName);
    let updatedConfigs;
    
    if (existingIndex >= 0) {
      updatedConfigs = [...savedConfigs];
      updatedConfigs[existingIndex] = localConfig;
    } else {
      updatedConfigs = [...savedConfigs, localConfig];
    }
    
    setSavedConfigs(updatedConfigs);
    localStorage.setItem('text-to-sheets-configs', JSON.stringify(updatedConfigs));
  };

  const handleChange = (field: keyof SheetsConfigType, value: string) => {
    // If changing spreadsheetId, check if it's a URL and extract ID
    if (field === 'spreadsheetId') {
      const extractedId = extractSpreadsheetId(value);
      if (extractedId && extractedId !== value) {
        // It was a URL, use the extracted ID
        value = extractedId;
        setTestResult({ success: true, message: `✅ Spreadsheet ID berhasil diekstrak dari URL: ${extractedId}` });
      }
    }
    
    setLocalConfig(prev => ({ ...prev, [field]: value }));
    
    if (field !== 'spreadsheetId') {
      setTestResult(null);
    }
    
    // Update range when sheet name or columns change
    if (field === 'sheetName' || field === 'columns') {
      const newSheetName = field === 'sheetName' ? value : localConfig.sheetName;
      const newColumns = field === 'columns' ? value : localConfig.columns;
      setLocalConfig(prev => ({ 
        ...prev, 
        [field]: value,
        range: `${newSheetName}!${newColumns}`
      }));
    }
  };

  const handleUrlExtract = () => {
    const extractedId = extractSpreadsheetId(urlInput);
    if (extractedId) {
      setLocalConfig(prev => ({ ...prev, spreadsheetId: extractedId }));
      setUrlInput('');
      setTestResult({ success: true, message: `✅ Spreadsheet ID berhasil diekstrak: ${extractedId}` });
    } else {
      setTestResult({ success: false, message: 'URL tidak valid. Pastikan URL adalah link Google Sheets yang benar.' });
    }
  };

  const handleTestConnection = async () => {
    if (!localConfig.spreadsheetId) {
      setTestResult({ success: false, message: 'Harap isi Spreadsheet ID terlebih dahulu' });
      return;
    }

    if (localConfig.apiKey && !validateApiKey(localConfig.apiKey)) {
      setTestResult({ success: false, message: 'Format API Key tidak valid. API Key harus dimulai dengan "AIza"' });
      return;
    }

    setIsTestingConnection(true);
    setTestResult(null);
    
    try {
      console.log('Starting connection test...');
      const result = await testSheetsConnection(localConfig);
      console.log('Test result:', result);
      setTestResult(result);
      
      if (result.success) {
        loadAvailableSheets();
      }
    } catch (error) {
      console.error('Test connection error:', error);
      setTestResult({ success: false, message: 'Error saat testing koneksi: ' + (error as Error).message });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const loadAvailableSheets = async () => {
    setIsLoadingSheets(true);
    try {
      const sheets = await getSheetsList(localConfig);
      setAvailableSheets(sheets);
    } catch (error) {
      console.error('Failed to load sheets:', error);
    } finally {
      setIsLoadingSheets(false);
    }
  };

  const selectSheet = (sheet: SheetInfo) => {
    setLocalConfig(prev => ({
      ...prev,
      sheetName: sheet.name,
      range: `${sheet.name}!${prev.columns}`
    }));
  };

  const loadConfig = (configToLoad: SheetsConfigType) => {
    setLocalConfig(configToLoad);
    onSave(configToLoad);
  };

  const deleteConfig = (configToDelete: SheetsConfigType) => {
    const updatedConfigs = savedConfigs.filter(c => c.sheetName !== configToDelete.sheetName);
    setSavedConfigs(updatedConfigs);
    localStorage.setItem('text-to-sheets-configs', JSON.stringify(updatedConfigs));
  };

  const copyExampleUrl = () => {
    navigator.clipboard.writeText('https://docs.google.com/spreadsheets/d/1zcsm2DPVccpnOGz_9HkVotn9M9f6KRiA_-C2CNld6_c/edit');
  };

  const isConfigured = config.spreadsheetId;

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/30 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Google Sheets Setup</h3>
            <p className="text-sm text-gray-600">Konfigurasi koneksi ke spreadsheet</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowConfigManager(!showConfigManager)}
            className="text-sm text-purple-600 hover:text-purple-700 transition-colors font-medium"
          >
            {showConfigManager ? 'Tutup Manager' : 'Config Manager'}
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
          >
            {isExpanded ? 'Tutup' : 'Setup'}
          </button>
        </div>
      </div>

      {/* Quick Setup Guide */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          Setup Cepat (3 Langkah)
        </h4>
        <div className="text-sm text-blue-700 space-y-2">
          <div className="flex items-start space-x-2">
            <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
            <div>
              <p><strong>Buat/Buka Google Sheets:</strong></p>
              <button 
                onClick={copyExampleUrl}
                className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Copy className="h-3 w-3" />
                <span>Copy contoh spreadsheet</span>
              </button>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
            <div>
              <p><strong>Share spreadsheet:</strong> Klik "Share" → "Anyone with the link" → "Editor"</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
            <div>
              <p><strong>Dapatkan API Key (opsional):</strong></p>
              <a 
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium"
              >
                <ExternalLink className="h-3 w-3" />
                <span>Google Cloud Console</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Config Manager */}
      {showConfigManager && (
        <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
            <Edit3 className="h-4 w-4 mr-2" />
            Saved Configurations
          </h4>
          {savedConfigs.length === 0 ? (
            <p className="text-purple-600 text-sm">Belum ada konfigurasi tersimpan</p>
          ) : (
            <div className="space-y-2">
              {savedConfigs.map((savedConfig, index) => (
                <div key={index} className="flex items-center justify-between bg-white/80 rounded-lg p-3">
                  <div>
                    <p className="font-medium text-gray-800">{savedConfig.sheetName}</p>
                    <p className="text-xs text-gray-600">{savedConfig.columns}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => loadConfig(savedConfig)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs transition-colors"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deleteConfig(savedConfig)}
                      className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {isExpanded && (
        <div className="space-y-6">
          {/* URL Input for easy ID extraction */}
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
              <Link className="h-4 w-4 mr-2" />
              Paste URL Spreadsheet (Opsional)
            </h4>
            <div className="flex space-x-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="flex-1 px-3 py-2 bg-white border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <button
                onClick={handleUrlExtract}
                disabled={!urlInput}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Extract ID
              </button>
            </div>
            <p className="text-xs text-yellow-700 mt-2">
              💡 Tip: Paste URL lengkap Google Sheets untuk otomatis extract Spreadsheet ID
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spreadsheet ID *
              </label>
              <input
                type="text"
                value={localConfig.spreadsheetId}
                onChange={(e) => handleChange('spreadsheetId', e.target.value)}
                placeholder="1zcsm2DPVccpnOGz_9HkVotn9M9f6KRiA_-C2CNld6_c"
                className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                ID dari URL spreadsheet atau paste URL lengkap di atas
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key (Opsional)
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={localConfig.apiKey || ''}
                  onChange={(e) => handleChange('apiKey', e.target.value)}
                  placeholder="AIzaSy... (opsional untuk public sheets)"
                  className="w-full px-3 py-2 pr-10 bg-white/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Hanya diperlukan untuk private sheets atau rate limiting
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Sheet
              </label>
              <input
                type="text"
                value={localConfig.sheetName}
                onChange={(e) => handleChange('sheetName', e.target.value)}
                placeholder="Sheet1"
                className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kolom Range
              </label>
              <select
                value={localConfig.columns}
                onChange={(e) => handleChange('columns', e.target.value)}
                className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="A:B">A:B (2 kolom)</option>
                <option value="A:C">A:C (3 kolom)</option>
                <option value="A:D">A:D (4 kolom)</option>
                <option value="A:E">A:E (5 kolom)</option>
                <option value="A:F">A:F (6 kolom)</option>
              </select>
            </div>
          </div>

          {/* Test Connection */}
          <div className="flex space-x-3">
            <button
              onClick={handleTestConnection}
              disabled={isTestingConnection}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              {isTestingConnection ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4" />
              )}
              <span>{isTestingConnection ? 'Testing...' : 'Test Koneksi'}</span>
            </button>

            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Config</span>
            </button>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`p-4 rounded-lg text-sm ${
              testResult.success 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <div className="flex items-start space-x-2">
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 mt-0.5 text-red-600" />
                )}
                <div>
                  <p className="font-medium">
                    {testResult.success ? 'Koneksi Berhasil!' : 'Koneksi Gagal'}
                  </p>
                  <pre className="mt-1 whitespace-pre-wrap">{testResult.message}</pre>
                </div>
              </div>
            </div>
          )}

          {/* Available Sheets */}
          {availableSheets.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                {isLoadingSheets && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Sheet yang Tersedia
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableSheets.map((sheet) => (
                  <button
                    key={sheet.id}
                    onClick={() => selectSheet(sheet)}
                    className={`p-3 rounded-lg text-left transition-colors ${
                      localConfig.sheetName === sheet.name
                        ? 'bg-blue-500 text-white'
                        : 'bg-white hover:bg-blue-100 text-blue-800'
                    }`}
                  >
                    <p className="font-medium">{sheet.name}</p>
                    <p className="text-xs opacity-75">ID: {sheet.id}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {!isExpanded && (
        <div className="text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isConfigured ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-700 font-medium">Terkonfigurasi</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                  <span>Belum dikonfigurasi</span>
                </>
              )}
            </div>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              {savedConfigs.length} configs
            </span>
          </div>
          {isConfigured && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-800">Current: {config.sheetName}</p>
              <p className="text-xs text-gray-600">Range: {config.columns}</p>
              <p className="text-xs text-gray-500">ID: {config.spreadsheetId.substring(0, 20)}...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SheetsConfig;