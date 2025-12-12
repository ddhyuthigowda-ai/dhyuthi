import React, { useEffect, useState, useRef } from 'react';
import { AnalysisResult, Mood } from '../types';
import { Play, Pause, Volume2, VolumeX, Share2, RefreshCw, Zap, Search, MessageCircleWarning, Heart } from 'lucide-react';

interface ResultsProps {
  result: AnalysisResult;
  audioBuffer: AudioBuffer | null;
  mood: Mood;
  onRestart: () => void;
}

const Results: React.FC<ResultsProps> = ({ result, audioBuffer, mood, onRestart }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const [activeTab, setActiveTab] = useState<'roast' | 'thoughts' | 'pep' | 'personality'>('roast');

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  const toggleVoice = () => {
    const newState = !voiceEnabled;
    setVoiceEnabled(newState);
    if (!newState && isPlaying) {
      stopAudio();
    }
  };

  const playAudio = async () => {
    if (!audioBuffer) return;

    if (isPlaying) {
      stopAudio();
      return;
    }

    // Initialize AudioContext if needed
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Resume context if suspended (browser policy)
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => setIsPlaying(false);
    
    sourceNodeRef.current = source;
    source.start();
    setIsPlaying(true);
  };

  const shareResult = async () => {
    const text = `My ${mood} desk just said this to me:\n\n"${result.roast}"\n\nBuilt with Gemini 3 Pro Preview.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Desk Has Something To Say',
          text: text,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  };

  const tabs = [
    { id: 'roast', icon: Zap, label: 'The Roast', color: 'text-red-400', bg: 'bg-red-500/10' },
    { id: 'thoughts', icon: MessageCircleWarning, label: 'Honest Thoughts', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { id: 'pep', icon: Heart, label: 'Pep Talk', color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { id: 'personality', icon: Search, label: 'Analysis', color: 'text-green-400', bg: 'bg-green-500/10' },
  ] as const;

  const moodLabels: Record<Mood, {label: string, emoji: string, color: string}> = {
    judgmental: { label: 'Judgmental', emoji: '🧐', color: 'bg-purple-500/20 text-purple-300 border-purple-500/50' },
    stressed: { label: 'Stressed', emoji: '😫', color: 'bg-orange-500/20 text-orange-300 border-orange-500/50' },
    bored: { label: 'Bored', emoji: '😑', color: 'bg-slate-500/20 text-slate-300 border-slate-500/50' },
    inspired: { label: 'Inspired', emoji: '🤩', color: 'bg-pink-500/20 text-pink-300 border-pink-500/50' }
  };

  const currentMoodStyle = moodLabels[mood];

  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100">
      <div className="flex-1 p-6 max-w-2xl mx-auto w-full flex flex-col space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-3 pt-8">
          <div className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border text-sm font-medium ${currentMoodStyle.color}`}>
            <span>{currentMoodStyle.emoji}</span>
            <span>Mood: {currentMoodStyle.label}</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
            The Desk Has Spoken
          </h2>
        </div>

        {/* Voice Toggle */}
        <div className="flex justify-center">
          <button 
            onClick={toggleVoice}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-full border text-xs font-semibold transition-all duration-300 ${
              voiceEnabled 
              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
              : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'
            }`}
          >
            {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span>Voiceover: {voiceEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Audio Player Card - Only visible when voice is enabled */}
        {voiceEnabled && (
          <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700 flex items-center justify-between animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full transition-colors duration-300 ${isPlaying ? 'bg-green-500/20 text-green-400 animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
                <Volume2 size={24} />
              </div>
              <div>
                <p className="font-bold text-white">Audio Report</p>
                <p className="text-xs text-slate-400">Gemini 2.5 TTS ({currentMoodStyle.label} Voice)</p>
              </div>
            </div>
            <button 
              onClick={playAudio}
              className="flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-full hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/30 text-white"
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-200 ${
                  isActive 
                    ? `border-indigo-500 bg-indigo-500/20 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]` 
                    : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-750'
                }`}
              >
                <Icon size={16} />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-slate-800/50 rounded-3xl p-6 border border-slate-700 min-h-[300px] relative overflow-hidden">
           {tabs.map((tab) => {
             if (activeTab !== tab.id) return null;
             const content = 
                tab.id === 'roast' ? result.roast :
                tab.id === 'thoughts' ? result.honestThoughts :
                tab.id === 'pep' ? result.pepTalk :
                result.personality;
             
             return (
               <div key={tab.id} className="animate-[fadeIn_0.3s_ease-out]">
                 <div className={`inline-flex items-center space-x-2 mb-4 ${tab.color}`}>
                   <tab.icon size={24} />
                   <h3 className="text-xl font-bold uppercase tracking-wide">{tab.label}</h3>
                 </div>
                 <p className="text-lg leading-relaxed text-slate-200 font-light whitespace-pre-line">
                   {content}
                 </p>
               </div>
             )
           })}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pb-8">
          <button 
            onClick={shareResult}
            className="flex items-center justify-center space-x-2 py-4 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors text-white font-semibold"
          >
            <Share2 size={20} />
            <span>Share</span>
          </button>
          <button 
            onClick={onRestart}
            className="flex items-center justify-center space-x-2 py-4 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-colors text-white font-semibold"
          >
            <RefreshCw size={20} />
            <span>New Desk</span>
          </button>
        </div>
      </div>

      {/* Outro Footer */}
      <div className="bg-slate-950 py-6 px-6 text-center border-t border-slate-900">
        <p className="text-slate-500 text-sm">
          Built with <span className="text-indigo-400 font-semibold">Gemini 3 Pro Preview</span>
        </p>
        <p className="text-slate-600 text-xs mt-1">Giving furniture a voice since 2025.</p>
      </div>
    </div>
  );
};

export default Results;