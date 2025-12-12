import React from 'react';
import { ArrowRight, MessageSquareQuote } from 'lucide-react';

interface IntroProps {
  onStart: () => void;
}

const Intro: React.FC<IntroProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-8 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="animate-bounce p-4 bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/50">
        <MessageSquareQuote size={48} className="text-white" />
      </div>
      
      <div className="space-y-4 max-w-lg">
        <h1 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
          Your Desk Has Something To Say
        </h1>
        <p className="text-xl text-slate-400 font-light leading-relaxed">
          It's been watching you work (and procrastinate). Now, with the power of AI, it's finally going to speak up.
        </p>
      </div>

      <button
        onClick={onStart}
        className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-indigo-600 font-lg rounded-full hover:bg-indigo-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 focus:ring-offset-slate-900"
      >
        <span>Hear the Truth</span>
        <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
      </button>
      
      <div className="absolute bottom-6 text-xs text-slate-600 uppercase tracking-widest">
        Sound On 🔊
      </div>
    </div>
  );
};

export default Intro;
