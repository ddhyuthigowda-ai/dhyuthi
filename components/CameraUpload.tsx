import React, { useRef, useState } from 'react';
import { Camera, AlertCircle } from 'lucide-react';
import { Mood } from '../types';

interface CameraUploadProps {
  onImageSelected: (base64: string, mood: Mood) => void;
}

const moods: { id: Mood; label: string; emoji: string; desc: string }[] = [
  { id: 'judgmental', label: 'Judgmental', emoji: '🧐', desc: 'Prepare to be roasted.' },
  { id: 'stressed', label: 'Stressed', emoji: '😫', desc: 'Your mess is causing panic.' },
  { id: 'bored', label: 'Bored', emoji: '😑', desc: 'Unimpressed by your existence.' },
  { id: 'inspired', label: 'Inspired', emoji: '🤩', desc: 'Seeing art in the chaos.' },
];

const CameraUpload: React.FC<CameraUploadProps> = ({ onImageSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<Mood>('judgmental');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Image is too large. Please try a smaller one (under 5MB).");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Extract base64 part
      const base64 = result.split(',')[1];
      onImageSelected(base64, selectedMood);
    };
    reader.onerror = () => {
      setError("Failed to read file.");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-900">
      <div className="w-full max-w-md space-y-8">
        
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">Select Desk Mood</h2>
          <p className="text-slate-400">How is your desk feeling today?</p>
        </div>

        {/* Mood Selector */}
        <div className="grid grid-cols-2 gap-4">
          {moods.map((m) => {
            const isSelected = selectedMood === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMood(m.id)}
                className={`relative p-4 rounded-xl border-2 text-left transition-all duration-300 group outline-none ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_25px_rgba(99,102,241,0.5)] scale-[1.03] z-10 ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-750 hover:border-slate-600 hover:scale-[1.01]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-3xl transition-transform duration-300 ${
                    isSelected ? 'animate-pulse scale-110 drop-shadow-md' : 'grayscale-[0.5] group-hover:grayscale-0 group-hover:scale-110'
                  }`}>
                    {m.emoji}
                  </span>
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_white]" />
                  )}
                </div>
                <div className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                  {m.label}
                </div>
                <div className={`text-xs mt-1 leading-tight ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {m.desc}
                </div>
              </button>
            );
          })}
        </div>

        <div className="h-px bg-slate-800 w-full" />

        <div className="space-y-4">
          <p className="text-center text-slate-400 text-sm">Now, capture the chaos.</p>
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative group cursor-pointer border-2 border-dashed border-slate-600 rounded-3xl p-8 transition-all duration-300 hover:border-indigo-400 hover:bg-slate-800/50 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] text-center"
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="p-4 bg-slate-800 rounded-full group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300">
                <Camera size={32} className="text-indigo-400 group-hover:text-indigo-300" />
              </div>
              <span className="text-lg font-medium text-slate-300 group-hover:text-white transition-colors">
                Take Photo or Upload
              </span>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center justify-center text-red-400 space-x-2 bg-red-900/20 p-3 rounded-lg border border-red-900/50">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraUpload;