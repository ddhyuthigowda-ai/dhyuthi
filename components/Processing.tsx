import React, { useEffect, useState } from 'react';
import { BrainCircuit, Sparkles, Coffee } from 'lucide-react';

const steps = [
  "Scanning clutter levels...",
  "Identifying questionable stains...",
  "Judging your cable management...",
  "Consulting the furniture council...",
  "Formulating the roast...",
  "Synthesizing voice box..."
];

const Processing: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % steps.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 p-8 text-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500 rounded-full filter blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full filter blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-12">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
          <BrainCircuit size={80} className="text-indigo-400 animate-pulse" />
          <Sparkles size={32} className="absolute -top-4 -right-4 text-yellow-400 animate-bounce" style={{ animationDuration: '2s' }} />
          <Coffee size={24} className="absolute -bottom-2 -left-4 text-amber-600 animate-bounce" style={{ animationDuration: '3s' }} />
        </div>

        <div className="space-y-4 max-w-sm">
          <h2 className="text-2xl font-bold text-white">
            Desk is Thinking...
          </h2>
          <div className="h-8 flex items-center justify-center">
             <p key={currentStepIndex} className="text-indigo-300 text-lg font-medium animate-[slideUpFade_0.5s_ease-out_forwards]">
               {steps[currentStepIndex]}
             </p>
          </div>
        </div>

        <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 rounded-full animate-[loading_12s_ease-in-out_infinite] w-full origin-left"></div>
        </div>
      </div>
      
      <style>{`
        @keyframes loading {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.7); }
          100% { transform: scaleX(1); }
        }
        @keyframes slideUpFade {
          0% { 
            opacity: 0; 
            transform: translateY(10px);
            filter: blur(4px);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0);
            filter: blur(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Processing;