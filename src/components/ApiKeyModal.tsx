'use client';
import { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Check, X, ExternalLink } from 'lucide-react';
import { getStoredApiKey, setStoredApiKey } from '@/lib/api';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (key: string) => void;
}

export default function ApiKeyModal({ isOpen, onClose, onSaved }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKey(getStoredApiKey());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setStoredApiKey(apiKey);
    setSavedSuccess(true);
    if (onSaved) onSaved(apiKey);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleClear = () => {
    setApiKey('');
    setStoredApiKey('');
    if (onSaved) onSaved('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#121329] border border-[#2d2e46] rounded-2xl p-6 md:p-8 shadow-2xl text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6366F1]/15 border border-[#6366F1]/30 flex items-center justify-center text-[#818cf8]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Gemini API Key</h3>
              <p className="text-xs text-[#8b91c1]">Bring your own Google Gemini key</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8b91c1] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="mt-5 space-y-4">
          <p className="text-xs text-[#8b91c1] leading-relaxed">
            Your API key is stored securely in your browser's local storage and passed directly for translation requests. It is never exposed publicly.
          </p>

          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-[#0B0B1A] border border-[#2d2e46] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4f5288] focus:outline-none focus:border-[#6366F1] pr-12 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8b91c1] hover:text-white transition-colors"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#818cf8] hover:underline flex items-center gap-1 font-medium"
            >
              Get a free API key from Google AI Studio <ExternalLink className="w-3 h-3" />
            </a>

            {apiKey && (
              <button
                type="button"
                onClick={handleClear}
                className="text-red-400 hover:text-red-300 font-medium transition-colors"
              >
                Clear Key
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#8b91c1] hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-bold shadow-lg transition-all active:scale-[0.98]"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" /> Saved!
              </>
            ) : (
              'Save Key'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

