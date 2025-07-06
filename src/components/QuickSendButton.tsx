import React, { useState } from 'react';
import { Zap, X, Send, Loader2 } from 'lucide-react';

interface QuickSendButtonProps {
  selectedText: string;
  onQuickSend: (text: string) => void;
  onClose: () => void;
  isProcessing: boolean;
}

const QuickSendButton: React.FC<QuickSendButtonProps> = ({ 
  selectedText, 
  onQuickSend, 
  onClose, 
  isProcessing 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleQuickSend = () => {
    onQuickSend(selectedText);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className={`bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 transition-all duration-300 ${
        isExpanded ? 'w-80' : 'w-auto'
      }`}>
        {isExpanded ? (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-gray-800">Quick Send</span>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-3 max-h-24 overflow-y-auto">
              <p className="text-sm text-gray-700 line-clamp-3">
                {selectedText}
              </p>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleQuickSend}
                disabled={isProcessing}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="font-medium">
                  {isProcessing ? 'Mengirim...' : 'Kirim'}
                </span>
              </button>
              
              <button
                onClick={() => setIsExpanded(false)}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-2xl transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <Zap className="h-5 w-5" />
            <span className="font-semibold">Quick Send</span>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </button>
        )}
      </div>
    </div>
  );
};

export default QuickSendButton;