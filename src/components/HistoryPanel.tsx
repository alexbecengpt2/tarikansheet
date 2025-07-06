import React from 'react';
import { History, X, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { HistoryEntry } from '../types';

interface HistoryPanelProps {
  history: HistoryEntry[];
  onClose: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onClose }) => {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <History className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-800">History</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No history yet</p>
            <p className="text-sm">Your sent data will appear here</p>
          </div>
        ) : (
          history.map((entry) => (
            <div
              key={entry.id}
              className="bg-white/80 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {entry.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-sm font-medium">
                    {entry.success ? 'Sent successfully' : 'Failed to send'}
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(entry.timestamp)}</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 mb-2">
                <p className="font-medium">Original text:</p>
                <p className="text-xs bg-gray-50 rounded p-2 mt-1 truncate">
                  {entry.originalText}
                </p>
              </div>
              
              <div className="text-sm text-gray-600">
                <p className="font-medium">Parsed data:</p>
                <p className="text-xs">
                  {entry.parsedData.length} row{entry.parsedData.length !== 1 ? 's' : ''} processed
                </p>
              </div>
              
              {entry.error && (
                <div className="mt-2 text-xs text-red-600 bg-red-50 rounded p-2">
                  Error: {entry.error}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;