'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { translateBatch } from '@/lib/api';
import { Loader2, BookMarked, BookOpen, Quote, Glasses, Lightbulb, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReaderViewProps {
  originalSentences: string[];
  targetLang: string;
  onBack: () => void;
  onChangeLanguage: (lang: string) => void;
}

const BATCH_SIZE = 20;

export default function ReaderView({ originalSentences, targetLang, onBack, onChangeLanguage }: ReaderViewProps) {
  const [translations, setTranslations] = useState<string[]>(new Array(originalSentences.length).fill(''));
  const [isTranslating, setIsTranslating] = useState<boolean[]>(new Array(originalSentences.length).fill(false));
  
  // Usable feature states
  const [zoom, setZoom] = useState(100);
  const [isParallel, setIsParallel] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    
    setTranslations(new Array(originalSentences.length).fill(''));
    setIsTranslating(new Array(originalSentences.length).fill(false));

    const translateAll = async () => {
      const batches = [];
      for (let i = 0; i < originalSentences.length; i += BATCH_SIZE) {
        batches.push({
          indices: Array.from({ length: Math.min(BATCH_SIZE, originalSentences.length - i) }, (_, j) => i + j),
          sentences: originalSentences.slice(i, i + BATCH_SIZE)
        });
      }

      for (const batch of batches) {
        if (!active) break;
        
        setIsTranslating(prev => {
          const next = [...prev];
          batch.indices.forEach(idx => next[idx] = true);
          return next;
        });

        try {
          const res = await translateBatch(batch.sentences, targetLang);
          const translatedBatch = res.translations;

          setTranslations(prev => {
            const next = [...prev];
            batch.indices.forEach((idx, offset) => {
              next[idx] = translatedBatch[offset];
            });
            return next;
          });
        } catch (err) {
          console.error("Batch translation failed:", err);
          setTranslations(prev => {
            const next = [...prev];
            batch.indices.forEach((idx) => {
              if (!next[idx]) next[idx] = "[Translation Failed]";
            });
            return next;
          });
        } finally {
          setIsTranslating(prev => {
            const next = [...prev];
            batch.indices.forEach(idx => next[idx] = false);
            return next;
          });
        }
      }
    };

    translateAll();
    return () => { active = false; };
  }, [originalSentences, targetLang]);

  const handleExportPDF = async () => {
    if (typeof window === 'undefined' || !contentRef.current) return;
    setIsExporting(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin:       15,
        filename:     'ParallelRead_Export.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#090916' }, // capture dark theme perfectly
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      await html2pdf().from(contentRef.current).set(opt).save();
    } catch (error) {
      console.error("Failed to generate PDF", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F8F9FA] text-black font-sans">
      
      {/* Top Navigation Bar */}
      <div className="h-16 border-b border-[#E5E7EB] bg-white flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[22px] font-black tracking-tight text-[#6366F1]">ParallelRead</span>
        </div>
        <div className="hidden md:flex items-center gap-10 text-[13px] font-semibold text-[#6B7280]">
          <button onClick={onBack} className="hover:text-[#111827] transition-colors">Library</button>
          <button className="hover:text-[#111827] transition-colors">Sync Settings</button>
          <button className="hover:text-[#111827] transition-colors">History</button>
        </div>
        {/* Removed User profile login entirely */}
        <div className="flex items-center gap-6 text-[#9CA3AF] w-[22px]">
          {/* Placeholder for alignment */}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar */}
        <div className="w-[280px] bg-white flex flex-col justify-between py-8 z-10 shadow-sm relative">
          <div>
            <div className="px-8 mb-8">
              <h2 className="font-bold text-[#111827] text-sm">Focus Mode</h2>
              <p className="text-[10px] font-bold text-[#9CA3AF] tracking-[0.1em] mt-1">DEEP READING ACTIVE</p>
            </div>
            
            <nav className="flex flex-col gap-2 px-4">
              <button className="flex items-center gap-4 px-4 py-3.5 bg-[#4F46E5] text-white rounded-xl font-bold text-xs tracking-wide shadow-[0_4px_14px_rgba(79,70,229,0.39)] hover:bg-[#4338CA] transition-all">
                <BookOpen className="w-5 h-5" /> READER
              </button>
              <button className="flex items-center gap-4 px-4 py-3.5 text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] rounded-xl font-bold text-xs tracking-wide transition-all">
                <Quote className="w-5 h-5" /> GRAMMAR
              </button>
              <button className="flex items-center gap-4 px-4 py-3.5 text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] rounded-xl font-bold text-xs tracking-wide transition-all">
                <Glasses className="w-5 h-5" /> VOCABULARY
              </button>
              <button className="flex items-center gap-4 px-4 py-3.5 text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] rounded-xl font-bold text-xs tracking-wide transition-all">
                <Lightbulb className="w-5 h-5" /> INSIGHTS
              </button>
            </nav>
          </div>

          <div className="px-6">
            <button 
              onClick={handleExportPDF}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 py-4 bg-[#6366F1] text-white font-bold text-sm rounded-xl hover:bg-[#4F46E5] transition-colors shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isExporting ? "Generating PDF..." : "Export to PDF"}
            </button>
          </div>
        </div>

        {/* Main Reading Canvas */}
        <div className="flex-1 bg-[#090916] flex flex-col relative overflow-hidden rounded-tl-3xl shadow-[-10px_0_30px_rgba(0,0,0,0.1)]">
          
          {/* Language Selector Overlay */}
          <div className="absolute top-6 right-8 z-20">
            <select
              value={targetLang}
              onChange={(e) => onChangeLanguage(e.target.value)}
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#8b91c1] text-xs font-bold tracking-wider uppercase focus:outline-none focus:border-[#4F46E5] hover:bg-white/10 transition-colors cursor-pointer appearance-none pr-10 relative backdrop-blur-md"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238b91c1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
            >
              <option value="Hindi" className="bg-[#111827] text-white">Hindi</option>
              <option value="Japanese" className="bg-[#111827] text-white">Japanese</option>
              <option value="Spanish" className="bg-[#111827] text-white">Spanish</option>
              <option value="French" className="bg-[#111827] text-white">French</option>
            </select>
          </div>

          {/* Scrollable Text Area */}
          <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
            {/* The wrapper bound to PDF export ref */}
            <div ref={contentRef} className="px-8 py-16 pb-40" style={{ fontSize: `${zoom}%`, transition: 'font-size 0.3s' }}>
              
              <div className="max-w-[1000px] mx-auto">
                {/* Document Header */}
                <div className="text-center mb-20 flex flex-col items-center">
                  <span className="px-4 py-1.5 rounded-full bg-[#1e1b4b] text-[#818cf8] text-[9px] font-black tracking-[0.25em] uppercase mb-6 shadow-[0_0_15px_rgba(49,46,129,0.5)]">
                    BILINGUAL MODE
                  </span>
                  <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight">
                    ParallelRead Document
                  </h1>
                </div>
                
                <div className="space-y-12 md:space-y-16 relative">
                  {originalSentences.map((sent, idx) => {
                    const isReady = !!translations[idx];
                    const isError = translations[idx]?.includes('Error');
                    const translating = isTranslating[idx];
                    
                    return (
                      <motion.div 
                        key={`row-${idx}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(idx * 0.02, 0.5) }} 
                        className={cn(
                          "flex gap-8 group",
                          isParallel ? "flex-col md:flex-row md:gap-16" : "flex-col"
                        )}
                      >
                        {/* Original */}
                        <div className={cn(
                          "flex-1 text-white/80 group-hover:text-white leading-[1.9] font-medium transition-colors duration-300",
                          !isParallel && "hidden md:block" // In non-parallel, original can be hidden or stacked. We will stack them if it is single col, but let's just make it stacked clean.
                        )}>
                          <div className={cn(!isParallel && "text-center")}>
                            {sent}
                          </div>
                        </div>

                        {/* Translation */}
                        <div className={cn(
                          "flex-1 text-[#6b7596] italic leading-[1.9] font-medium transition-colors duration-300",
                          "group-hover:text-[#a5abe0]",
                          isError && "text-red-400 group-hover:text-red-300",
                          !isParallel && "text-center text-white/90 pb-8 border-b border-white/5" // Stacked visual divider
                        )}>
                          {translating ? (
                            <div className={cn("flex items-center gap-2 opacity-60 h-full py-1", !isParallel && "justify-center")}>
                              <Loader2 className="w-4 h-4 animate-spin text-[#8b91c1]" />
                              <span className="text-xs font-semibold tracking-wider uppercase text-[#8b91c1]">Processing</span>
                            </div>
                          ) : isReady ? (
                            <span>{translations[idx]}</span>
                          ) : (
                            <div className={cn("flex items-center gap-2 opacity-30 h-full py-2", !isParallel && "justify-center")}>
                              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse delay-75" />
                              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse delay-150" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* Floating Bottom Navigation */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 gap-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-20">
            
            {/* Functional Zoom */}
            <div className="flex items-center gap-4 text-white font-medium text-sm">
              <button onClick={() => setZoom(z => Math.max(z - 10, 60))} className="hover:text-[#818cf8] transition-colors font-bold px-2">A-</button>
              <span className="text-[11px] font-bold text-white/50 w-10 text-center">{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(z + 10, 160))} className="hover:text-[#818cf8] transition-colors font-bold px-2">A+</button>
            </div>
            
            <div className="w-px h-6 bg-white/10" />
            
            {/* Functional Parallel Toggle */}
            <div className="flex items-center gap-4 text-[10px] tracking-[0.15em] text-[#8b91c1] font-bold uppercase transition-all duration-300">
              PARALLEL
              <div 
                onClick={() => setIsParallel(!isParallel)}
                className={cn(
                  "w-11 h-[22px] rounded-full flex items-center p-0.5 cursor-pointer shadow-inner transition-colors duration-300",
                  isParallel ? "bg-[#4F46E5]" : "bg-white/20"
                )}
              >
                 <div className={cn(
                   "w-[18px] h-[18px] rounded-full shadow-sm transition-transform duration-300",
                   isParallel ? "bg-white transform translate-x-5" : "bg-gray-300 transform translate-x-0"
                 )} />
              </div>
            </div>
            
            <div className="w-px h-6 bg-white/10" />
            
            {/* Save Button */}
            <button className="flex items-center gap-2 text-[10px] font-bold tracking-wider text-[#8b91c1] hover:text-white transition-colors uppercase pl-2 pr-1">
              <BookMarked className="w-3.5 h-3.5 mb-0.5" /> SAVE PROGRESS
            </button>
            
          </div>
          
        </div>
      </div>
    </div>
  );
}
