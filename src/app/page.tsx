'use client';
import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import ReaderView from '@/components/ReaderView';
import { uploadFile } from '@/lib/api';
import { Loader2, Settings, Upload, Globe2, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';
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
  };

  return (
    <main className="min-h-screen bg-[#0B0B1A] text-white flex flex-col font-sans overflow-x-hidden">
      
      {sentences.length === 0 ? (
        <div className="flex flex-col min-h-screen w-full relative z-10 selection:bg-[#6366F1] selection:text-white">
          
          {/* Top Navigation */}
          <header className="w-full flex items-center justify-between px-8 py-6 border-b border-white/5 bg-[#0B0B1A]/80 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <span className="text-[22px] font-black tracking-tight text-[#818cf8]">ParallelRead</span>
            </div>
            <div className="hidden md:flex items-center gap-10 text-[13px] font-bold text-[#8b91c1]">
              <button className="text-white border-b-2 border-[#6366F1] pb-1">Library</button>
              <button className="hover:text-white transition-colors">Current Read</button>
              <button className="hover:text-white transition-colors">Discover</button>
            </div>
            <div className="flex items-center gap-6 text-[#9CA3AF]">
              <Settings className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
            </div>
          </header>

          <AnimatePresence mode="wait">
            {isUploading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 flex flex-col items-center justify-center gap-6 py-40"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-[#6366F1] blur-2xl opacity-20 rounded-full" />
                  <Loader2 className="w-16 h-16 text-[#818cf8] animate-spin relative z-10" />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Processing your document</h2>
                <p className="text-[#8b91c1] font-medium max-w-sm text-center">Parsing structure and initiating AI-powered translation sequence.</p>
              </motion.div>
            ) : (
              <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center pt-24 pb-32 px-6"
              >
                {/* Hero Title */}
                <div className="text-center max-w-4xl mx-auto mb-16">
                  <h1 className="text-5xl md:text-[72px] leading-[1.1] font-bold mb-6 tracking-tight">
                    Transform your <span className="text-[#a5abe0]">reading <br/>experience.</span>
                  </h1>
                  <p className="text-lg md:text-xl text-[#8b91c1] max-w-2xl mx-auto leading-relaxed font-medium">
                    Upload your documents and start reading in two languages side-by-side with AI-powered synchronization.
                  </p>
                </div>

                {/* Mode Toggle */}
                <div className="flex bg-[#14152e] rounded-full p-1.5 mb-8 border border-white/5 relative z-20">
                  <button 
                    onClick={() => setInputMode('file')}
                    className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${inputMode === 'file' ? 'bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/25' : 'text-[#8b91c1] hover:text-white'}`}
                  >
                    Upload Document
                  </button>
                  <button 
                    onClick={() => setInputMode('text')}
                    className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${inputMode === 'text' ? 'bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/25' : 'text-[#8b91c1] hover:text-white'}`}
                  >
                    Paste Text
                  </button>
                </div>

                {/* Upload or Text Area */}
                <div className="w-full max-w-3xl relative z-10">
                  {inputMode === 'file' ? (
                    <FileUpload onUpload={handleUpload} />
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      className="w-full p-8 rounded-2xl bg-[#0f0f23] border border-[#2d2e46] shadow-2xl flex flex-col gap-6"
                    >
                       <textarea 
                         className="w-full h-64 bg-[#0B0B1A] border border-[#2d2e46] rounded-xl p-6 text-white leading-relaxed focus:outline-none focus:border-[#6366F1] resize-none custom-scrollbar"
                         placeholder="Type or paste your text here to begin parallel reading..."
                         value={rawText}
                         onChange={e => setRawText(e.target.value)}
                       />

                       <div className="flex flex-col md:flex-row items-end gap-6">
                         <div className="w-full md:flex-1">
                           <label className="text-xs font-bold tracking-widest text-[#7a7ea7] uppercase mb-2 block">Target Language</label>
                           <select 
                             className="w-full px-5 py-3.5 rounded-xl bg-[#0B0B1A] border border-[#2d2e46] text-white text-sm font-bold focus:outline-none focus:border-[#6366F1] appearance-none"
                             value={targetLang}
                             onChange={(e) => setTargetLang(e.target.value)}
                             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237a7ea7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                           >
                              <option value="Hindi">Hindi</option>
                              <option value="Japanese">Japanese</option>
                              <option value="Spanish">Spanish</option>
                              <option value="French">French</option>
                           </select>
                         </div>
                         <button 
                           onClick={submitText}
                           className="w-full md:flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-sm transition-colors shadow-lg active:scale-[0.98]"
                         >
                           Start Reading
                           <ChevronRight className="w-4 h-4" />
                         </button>
                       </div>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm font-bold"
                    >
                      {error}
                    </motion.div>
                  )}
                </div>

                {/* Getting Started Cards */}
                <div className="w-full max-w-5xl mt-24">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Getting Started</h2>
                    <p className="text-[#8b91c1] text-sm">Three simple steps to literary mastery.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#14152e] rounded-xl p-8 border border-[#2d2e46] hover:border-[#4f5288] transition-colors relative overflow-hidden group">
                      <div className="text-[#2d2e46] text-6xl font-black absolute top-4 right-6 uppercase">01</div>
                      <div className="relative z-10">
                        <Upload className="w-5 h-5 text-[#818cf8] mb-4" />
                        <h3 className="text-white font-bold text-lg mb-3">Upload</h3>
                        <p className="text-[#8b91c1] text-sm leading-relaxed">Drag and drop your favorite book or document. We handle the heavy lifting of parsing the structure.</p>
                      </div>
                    </div>
                    <div className="bg-[#14152e] rounded-xl p-8 border border-[#2d2e46] hover:border-[#4f5288] transition-colors relative overflow-hidden group">
                      <div className="text-[#2d2e46] text-6xl font-black absolute top-4 right-6 uppercase">02</div>
                      <div className="relative z-10">
                        <Globe2 className="w-5 h-5 text-[#818cf8] mb-4" />
                        <h3 className="text-white font-bold text-lg mb-3">Select Language</h3>
                        <p className="text-[#8b91c1] text-sm leading-relaxed">Choose your target language. Our AI aligns sentences with surgical precision for side-by-side reading.</p>
                      </div>
                    </div>
                    <div className="bg-[#14152e] rounded-xl p-8 border border-[#2d2e46] hover:border-[#4f5288] transition-colors relative overflow-hidden group">
                      <div className="text-[#2d2e46] text-6xl font-black absolute top-4 right-6 uppercase">03</div>
                      <div className="relative z-10">
                        <BookOpen className="w-5 h-5 text-[#818cf8] mb-4" />
                        <h3 className="text-white font-bold text-lg mb-3">Read</h3>
                        <p className="text-[#8b91c1] text-sm leading-relaxed">Dive into a seamless experience where every scroll and tap is synchronized across both languages.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature Cards Bottom */}
                <div className="w-full max-w-5xl mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 relative rounded-2xl bg-[#14152e] border border-[#2d2e46] overflow-hidden flex flex-col justify-end min-h-[360px] group">
                    <img src="/hero_plant.png" alt="Smart Context Alignment" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B1A] via-[#0B0B1A]/80 to-transparent" />
                    
                    <div className="relative z-10 p-10 mt-auto">
                      <span className="inline-block px-3 py-1 bg-[#6366F1]/20 text-[#818cf8] text-[10px] font-bold tracking-widest uppercase rounded-full mb-4 backdrop-blur-sm border border-[#6366F1]/30">
                        AI Powered
                      </span>
                      <h3 className="text-3xl font-bold text-white mb-3">Smart Context Alignment</h3>
                      <p className="text-[#8b91c1] max-w-md text-sm leading-relaxed">
                        Our neural engine doesn't just translate; it understands the flow of prose to keep your place across languages perfectly aligned.
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#1c1c38] rounded-2xl border border-[#2d2e46] p-10 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#6366F1] rounded-full blur-[100px] opacity-10" />
                    <div className="w-12 h-12 bg-[#6366F1]/20 rounded-xl flex items-center justify-center mb-6 border border-[#6366F1]/30">
                      <CheckCircle2 className="w-6 h-6 text-[#818cf8]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 relative z-10">Read Anywhere</h3>
                    <p className="text-[#8b91c1] text-sm leading-relaxed mb-6 relative z-10">
                      Download your synced collections for offline study. Your library follows you even when the signal doesn't.
                    </p>
                    <button className="flex items-center gap-2 text-[#818cf8] font-bold text-sm group transition-colors relative z-10">
                      Explore Collections <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          {!isUploading && sentences.length === 0 && (
            <footer className="w-full border-t border-[#2d2e46] py-8 px-12 mt-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                  <span className="text-base font-black tracking-tight text-[#818cf8]">ParallelRead</span>
                  <div className="w-px h-4 bg-[#2d2e46] mx-2" />
                  <span className="text-xs text-[#7a7ea7]">The Digital Curator</span>
                </div>
                <div className="flex gap-8 text-[11px] font-bold text-[#7a7ea7] uppercase tracking-wider">
                  <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                  <a href="#" className="hover:text-white transition-colors">Help Center</a>
                </div>
                <div className="text-[#4f5288] text-[11px]">
                  © 2026 ParallelRead. All rights reserved.
                </div>
              </div>
            </footer>
          )}

        </div>
      ) : (
        <ReaderView 
          originalSentences={sentences} 
          targetLang={targetLang} 
          onBack={handleBack} 
          onChangeLanguage={setTargetLang}
        />
      )}
    </main>
  );
}
