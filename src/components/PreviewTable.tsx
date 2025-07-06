import React, { useState } from 'react';
import { Send, Eye, Loader2, Settings, ChevronDown } from 'lucide-react';
import { SheetsConfig } from '../types';

interface PreviewTableProps {
  data: string[][];
  onSendToSheets: (config?: SheetsConfig) => void;
  isProcessing: boolean;
  config: SheetsConfig;
}

const PreviewTable: React.FC<PreviewTableProps> = ({ data, onSendToSheets, isProcessing, config }) => {
  const [showQuickConfigs, setShowQuickConfigs] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState<SheetsConfig[]>([]);

  React.useEffect(() => {
    const saved = localStorage.getItem('text-to-sheets-configs');
    if (saved) {
      setSavedConfigs(JSON.parse(saved));
    }
  }, []);

  const handleQuickSend = (targetConfig?: SheetsConfig) => {
    onSendToSheets(targetConfig);
    setShowQuickConfigs(false);
  };

  const getColumnHeaders = () => {
    const columnCount = config.columns.split(':')[1].charCodeAt(0) - config.columns.split(':')[0].charCodeAt(0) + 1;
    return Array.from({ length: columnCount }, (_, i) => 
      String.fromCharCode(65 + i) // A, B, C, etc.
    );
  };

  const columnHeaders = getColumnHeaders();

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/30 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
            <Eye className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Preview Data</h3>
            <p className="text-sm text-gray-600">Target: {config.sheetName}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {savedConfigs.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setShowQuickConfigs(!showQuickConfigs)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
              >
                <Settings className="h-4 w-4" />
                <span>Quick Send</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {showQuickConfigs && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-10">
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Kirim ke sheet lain:</p>
                    <div className="space-y-2">
                      {savedConfigs.map((savedConfig, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickSend(savedConfig)}
                          disabled={isProcessing}
                          className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <p className="font-medium text-gray-800">{savedConfig.sheetName}</p>
                          <p className="text-xs text-gray-600">{savedConfig.columns}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <button
            onClick={() => handleQuickSend()}
            disabled={isProcessing}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            <span className="font-medium">{isProcessing ? 'Mengirim...' : 'Kirim ke Sheets'}</span>
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
              {columnHeaders.map((header, index) => (
                <th key={index} className="px-4 py-3 text-left text-sm font-medium text-gray-700 border border-gray-200 rounded-tl-lg rounded-tr-lg">
                  Kolom {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr 
                key={index} 
                className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-150"
              >
                {columnHeaders.map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-3 text-sm text-gray-800 border border-gray-200">
                    {row[colIndex] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-blue-800">
              Data siap dikirim ke "{config.sheetName}"
            </p>
            <p className="text-sm text-blue-600 mt-1">
              {data.length} baris × {columnHeaders.length} kolom ({config.columns})
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-600">Target Range:</p>
            <p className="font-mono text-sm text-blue-800">{config.range}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewTable;