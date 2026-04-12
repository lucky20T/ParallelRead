'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { translateBatch } from '@/lib/api';
import { Loader2, ArrowLeft, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReaderViewProps {
  originalSentences: string[];
  targetLang: string;
  onBack: () => void;
}

const BATCH_SIZE = 20; // How many sentences to translate at once

export default function ReaderView({ originalSentences, targetLang, onBack }: ReaderViewProps) {
  const [translations, setTranslations] = useState<string[]>(new Array(originalSentences.length).fill(''));
  const [isTranslating, setIsTranslating] = useState<boolean[]>(new Array(originalSentences.length).fill(false));
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Translate in batches
  useEffect(() => {
    let active = true;

    const translateAll = async () => {
      // Create batches
      const batches = [];
      for (let i = 0; i < originalSentences.length; i += BATCH_SIZE) {
        batches.push({
          indices: Array.from({ length: Math.min(BATCH_SIZE, originalSentences.length - i) }, (_, j) => i + j),
          sentences: originalSentences.slice(i, i + BATCH_SIZE)
        });
      }

      for (const batch of batches) {
        if (!active) break;
        
        // Mark as translating
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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full flex flex-col pt-6 pb-20 px-4 md:px-12 max-w-[1600px] mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10 shrink-0">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">ParallelRead</h1>
        </div>
        <div className="px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium">
          {targetLang}
        </div>
      </div>

      {/* Reader Layout */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-transparent scroll-smooth rounded-2xl border border-white/10 shadow-2xl relative">
        <div className="flex flex-col">
          {/* Header row */}
          <div className="sticky top-0 z-20 flex bg-black/60 backdrop-blur-xl border-b border-white/10 p-4 md:px-10 shadow-lg">
            <div className="flex-1 font-bold tracking-[0.2em] text-gray-400 uppercase text-[10px] pl-4">Original Text</div>
            <div className="hidden md:block w-12 shrink-0"></div>
            <div className="flex-1 font-bold tracking-[0.2em] bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 uppercase text-[10px] pl-4">{targetLang} Translation</div>
          </div>

          <div className="p-4 md:p-10 space-y-4 max-w-[1400px] w-full mx-auto pb-40">
            {originalSentences.map((sent, idx) => {
              const isReady = !!translations[idx];
              const isError = translations[idx]?.includes('Error');
              const translating = isTranslating[idx];
              
              return (
              <motion.div 
                key={`row-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.05, 1) }} // Staggered entrance
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={cn(
                  "flex flex-col md:flex-row gap-6 p-6 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden group",
                  hoveredIdx === idx 
                    ? "bg-white/[0.08] border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-cyan-500/10 scale-[1.01]" 
                    : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                )}
              >
                {/* Active Indicator Line */}
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1 transition-all duration-300",
                  hoveredIdx === idx ? "bg-gradient-to-b from-cyan-400 to-blue-500 opacity-100" : "opacity-0"
                )} />

                {/* Left Side: Original */}
                <div className="flex-1">
                  <p className={cn(
                    "text-[1.1rem] leading-[1.8] font-medium transition-colors duration-300",
                    hoveredIdx === idx ? "text-white" : "text-gray-300"
                  )}>
                    {sent}
                  </p>
                </div>

                {/* Right Side: Translation */}
                <div className="flex-1 relative">
                  <div className={cn(
                    "text-[1.1rem] leading-[1.8] font-medium transition-colors duration-300",
                    hoveredIdx === idx ? "text-cyan-50" : "text-cyan-100/70",
                    isError && "text-red-400"
                  )}>
                    {translating ? (
                      <div className="flex items-center gap-3 h-full">
                        <div className="flex gap-1.5 items-center px-4 py-2 rounded-lg bg-white/5 border border-white/10 w-fit">
                          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                          <span className="text-xs font-semibold tracking-wider uppercase text-cyan-400/80">Translating</span>
                        </div>
                      </div>
                    ) : isReady ? (
                      <p>{translations[idx]}</p>
                    ) : (
                      <div className="flex items-center gap-2 opacity-50 h-full">
                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse" />
                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse delay-75" />
                        <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse delay-150" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )})}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
