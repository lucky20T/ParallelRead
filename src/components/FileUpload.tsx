'use client';
import { useState, useRef } from 'react';
import { UploadCloud, FileText, ChevronRight } from 'lucide-react';
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-xl mx-auto p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden relative"
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
      
      <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 mb-6 text-center tracking-tight">Upload Book</h2>

      <div 
        className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl transition-all duration-300 ease-out cursor-pointer ${
          dragActive ? 'border-cyan-400 bg-cyan-400/5' : 'border-white/20 bg-black/20 hover:border-white/40 hover:bg-black/30'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
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
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <UploadCloud className="w-8 h-8 text-cyan-400" />
              </div>
              <p className="text-lg font-medium text-gray-200">Drag & Drop your document</p>
              <p className="text-sm text-gray-500 mt-2">or click to browse (.txt, .pdf, .docx)</p>
            </motion.div>
          ) : (
            <motion.div 
              key="file"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-cyan-400/10 flex items-center justify-center mb-4 border border-cyan-400/30">
                <FileText className="w-8 h-8 text-cyan-400" />
              </div>
              <p className="text-lg font-medium text-gray-200 text-center max-w-[250px] truncate">{file.name}</p>
              <p className="text-sm text-cyan-400/80 mt-2 font-medium">Ready to process</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {file && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 flex flex-col gap-4 overflow-hidden"
          >
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-400">Target Language</label>
              <div className="flex items-center rounded-xl bg-black/40 border border-white/10 p-1">
                {['Hindi', 'Japanese', 'Spanish', 'French'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setTargetLang(lang)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                      targetLang === lang 
                        ? 'bg-white/10 text-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => onUpload(file, targetLang)}
              className="mt-2 w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-lg hover:from-cyan-400 hover:to-blue-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300 transform active:scale-[0.98]"
            >
              Start Reading
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
