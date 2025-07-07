import React from 'react';
import { FileSpreadsheet, History, Sparkles, Zap, Chrome } from 'lucide-react';

interface HeaderProps {
  onShowHistory: () => void;
  onShowExtension: () => void;
}

const Header: React.FC<HeaderProps> = ({ onShowHistory, onShowExtension }) => {
  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40 shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white p-2 rounded-lg">
                <FileSpreadsheet className="h-8 w-8 text-purple-600" />
                <Sparkles className="h-4 w-4 text-pink-500 absolute -top-1 -right-1" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                Smart Sheets
              </h1>
              <p className="text-sm text-gray-600 font-medium">Integrasi data cerdas dengan extension support</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onShowExtension}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white rounded-xl border border-white/20 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <Chrome className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Extension</span>
            </button>
            
            <button
              onClick={onShowHistory}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl border border-white/20 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">History</span>
            <p className="text-sm text-gray-600 font-medium">Universal data integration - bekerja di mana saja</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
  )
}