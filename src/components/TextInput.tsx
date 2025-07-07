import React, { useState } from 'react';
import { Clipboard, Type, Zap, Sparkles } from 'lucide-react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const TextInput: React.FC<TextInputProps> = ({ value, onChange, placeholder }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text);
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/30 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="relative p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <Type className="h-6 w-6 text-white" />
            <Sparkles className="h-3 w-3 text-yellow-300 absolute -top-1 -right-1" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Smart Input</h3>
            <p className="text-sm text-gray-600">Universal parsing - bekerja di mana saja</p>
          </div>
        </div>
        <button
          onClick={handlePaste}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl transition-all duration-200 text-sm font-medium shadow-lg hover:scale-105"
        >
          <Clipboard className="h-4 w-4" />
          <span>Paste</span>
        </button>
      </div>
      
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full h-40 px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all duration-200 text-gray-800 placeholder-gray-500"
        />
        
        {isFocused && (
          <div className="absolute top-3 right-3 flex items-center space-x-2 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
            <Zap className="h-3 w-3" />
            <span className="font-medium">Auto-parsing aktif</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-4 text-sm">
        <div className="flex items-center space-x-4 text-gray-600">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>{value.length} karakter</span>
          </span>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
            Universal: Tab, Koma, Spasi, Pipe, Mixed
          </span>
        </div>
        
        {value.length > 0 && (
          <div className="flex items-center space-x-1 text-purple-600">
            <Sparkles className="h-3 w-3" />
            <span className="text-xs font-medium">Parsing otomatis</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TextInput;