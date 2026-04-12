'use client';
import { useState, useRef } from 'react';
import { UploadCloud, FileText, ChevronRight, FilePlus2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FileUpload({ onUpload }: { onUpload: (file: File, lang: string) => void }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [targetLang, setTargetLang] = useState('Hindi');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.match(/\.(txt|pdf|docx)$/i)) {
        setFile(droppedFile);
      } else {
        alert('Please drop a .txt, .pdf, or .docx file.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full flex justify-center mt-12 mb-20 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative"
      >
        <div 
          className={`relative flex flex-col items-center justify-center py-16 px-6 border-[1.5px] border-dashed rounded-xl transition-all duration-300 ease-out ${
            dragActive ? 'border-[#6366F1] bg-[#6366F1]/5' : 'border-[#2d2e46] bg-[#0f0f23] hover:border-[#4f5288] hover:bg-[#14152e]'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input 
            ref={inputRef}
            type="file" 
            accept=".txt,.pdf,.docx" 
            onChange={handleChange} 
            className="hidden" 
          />
          
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div 
                key="upload"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="flex flex-col items-center"
              >
                <div className="w-14 h-14 rounded-full bg-[#1e1c3e] flex items-center justify-center mb-6">
                  <UploadCloud className="w-6 h-6 text-[#9498d0]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Drop your file here</h3>
                <p className="text-sm font-medium text-[#7a7ea7] mb-8">Supports PDF, EPUB, and TXT files up to 50MB.</p>
                
                <button 
                  onClick={() => inputRef.current?.click()}
                  className="flex items-center gap-2 bg-[#b3b9ff] text-[#1c1c46] hover:bg-[#a0a8ff] px-6 py-2.5 rounded-md font-bold text-sm transition-colors shadow-[0_0_15px_rgba(179,185,255,0.2)]"
                >
                  <FilePlus2 className="w-4 h-4" /> Select File
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="file"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center w-full max-w-md"
              >
                <div className="w-16 h-16 rounded-full bg-[#6366F1]/20 flex items-center justify-center mb-6 border border-[#6366F1]/40">
                  <FileText className="w-8 h-8 text-[#818cf8]" />
                </div>
                <p className="text-xl font-bold text-white text-center w-full truncate mb-2">{file.name}</p>
                <p className="text-sm text-[#818cf8] mb-8 font-medium">Ready to process</p>
                
                <div className="w-full flex items-center justify-center gap-4">
                   <button 
                    onClick={() => { setFile(null); if(inputRef.current) inputRef.current.value=''; }}
                    className="flex-1 py-3 text-sm font-bold text-[#818cf8] border border-[#818cf8] rounded-xl hover:bg-[#818cf8]/10 transition-colors"
                   >
                     Cancel
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Language & Start Reading Block (slides down gracefully) */}
        <AnimatePresence>
          {file && (
            <motion.div 
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 w-full flex flex-col md:flex-row gap-4 items-end"
            >
              <div className="w-full md:flex-1">
                <label className="text-xs font-bold tracking-widest text-[#7a7ea7] uppercase mb-2 block">Target Language</label>
                <div className="relative">
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full px-5 py-3.5 rounded-xl bg-[#0f0f23] border border-[#2d2e46] text-white text-sm font-bold focus:outline-none focus:border-[#6366F1] cursor-pointer appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237a7ea7' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                  >
                    <option value="Hindi">Hindi</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => onUpload(file, targetLang)}
                className="w-full md:flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-bold text-sm transition-colors shadow-lg active:scale-[0.98]"
              >
                Start Reading
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
