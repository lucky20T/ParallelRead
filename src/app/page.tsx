'use client';
import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ReaderView from '@/components/ReaderView';
import { uploadFile } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [sentences, setSentences] = useState<string[]>([]);
  const [targetLang, setTargetLang] = useState<string>('Hindi');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  const [rawText, setRawText] = useState('');

  const handleProcess = async (dataFn: () => Promise<any>) => {
    setIsUploading(true);
    setError('');
    try {
      const data = await dataFn();
      if (data.sentences && data.sentences.length > 0) {
        setSentences(data.sentences);
      } else {
        setError('No text could be extracted.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to process the content.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = (file: File, lang: string) => {
    setTargetLang(lang);
    handleProcess(() => uploadFile(file, lang));
  };

  const submitText = () => {
    if (!rawText.trim()) return setError('Please enter some text.');
    handleProcess(() => require('@/lib/api').uploadText(rawText, targetLang));
  };

  const handleBack = () => {
    setSentences([]);
    // keep targetLang
  };

  return (
    <main className="min-h-screen bg-black text-white relative flex flex-col font-sans overflow-hidden">
      {/* ... previous background effects ... */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[60%] w-[20%] h-[20%] rounded-full bg-purple-900/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {sentences.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 mt-12 md:mt-0">
            
            <AnimatePresence mode="wait">
              {isUploading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center gap-4 py-20"
                >
                  <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                  <p className="text-xl font-medium text-gray-300">Processing content...</p>
                  <p className="text-sm text-gray-500">Extracting sentences & fetching limits</p>
                </motion.div>
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full max-w-xl flex flex-col items-center"
                >
                  <div className="text-center mb-8">
                    <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Parallel</span>Read
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 max-w-lg mx-auto leading-relaxed">
                      Transform any document or text block into an AI-powered bilingual reading experience.
                    </p>
                  </div>

                  {/* Toggle Input Mode */}
                  <div className="flex bg-white/5 rounded-xl border border-white/10 p-1 mb-6">
                    <button 
                      onClick={() => setInputMode('file')}
                      className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${inputMode === 'file' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                      File Document
                    </button>
                    <button 
                      onClick={() => setInputMode('text')}
                      className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${inputMode === 'text' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                      Paste Text
                    </button>
                  </div>

                  <div className="w-full relative transition-all">
                    {inputMode === 'file' ? (
                      <FileUpload onUpload={handleUpload} />
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="w-full p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col gap-4"
                      >
                         <textarea 
                           className="w-full h-48 bg-black/40 border border-white/10 rounded-xl p-4 text-gray-300 focus:outline-none focus:border-cyan-500/50 resize-none custom-scrollbar"
                           placeholder="Type or paste your text here..."
                           value={rawText}
                           onChange={e => setRawText(e.target.value)}
                         />

                         <div className="flex items-center gap-4">
                           <div className="flex-1">
                             <label className="text-xs font-medium text-gray-500 mb-1 block">Language</label>
                             <select 
                               className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-gray-300 focus:outline-none"
                               value={targetLang}
                               onChange={(e) => setTargetLang(e.target.value)}
                             >
                                <option value="Hindi">Hindi</option>
                                <option value="Japanese">Japanese</option>
                                <option value="Spanish">Spanish</option>
                                <option value="French">French</option>
                             </select>
                           </div>
                           <button 
                             onClick={submitText}
                             className="flex-1 mt-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-3 px-4 rounded-lg font-semibold transition-all shadow-lg active:scale-[0.98]"
                           >
                             Translate Text
                           </button>
                         </div>
                      </motion.div>
                    )}
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm font-medium"
                    >
                      {error}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
          </div>
        ) : (
          <ReaderView 
            originalSentences={sentences} 
            targetLang={targetLang} 
            onBack={handleBack} 
          />
        )}
      </div>
    </main>
  );
}
