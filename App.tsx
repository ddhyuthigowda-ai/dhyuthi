import React, { useState } from 'react';
import Intro from './components/Intro';
import CameraUpload from './components/CameraUpload';
import Processing from './components/Processing';
import Results from './components/Results';
import { analyzeDeskImage, generateDeskVoice } from './services/geminiService';
import { AnalysisResult, AppStep, Mood } from './types';
import { AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('intro');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentMood, setCurrentMood] = useState<Mood>('judgmental');

  const handleStart = () => {
    setStep('upload');
  };

  const handleImageSelected = async (base64: string, mood: Mood) => {
    setCurrentMood(mood);
    setStep('processing');
    setError(null);
    try {
      // 1. Analyze the image with the selected mood
      const result = await analyzeDeskImage(base64, mood);
      setAnalysisResult(result);

      // 2. Generate Audio 
      // We construct a script based on the result. The mood will also influence the voice choice in the service.
      try {
        const audioScript = `
          Okay, let's take a look. ${result.honestThoughts}
          
          And to be honest? ${result.roast}
        `;
        const audio = await generateDeskVoice(audioScript, mood);
        setAudioBuffer(audio);
      } catch (audioError) {
        console.error("Audio generation failed, but continuing with text results", audioError);
      }

      setStep('results');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong analyzing your desk. Maybe it's too messy even for AI?");
      setStep('upload');
    }
  };

  const handleRestart = () => {
    setAnalysisResult(null);
    setAudioBuffer(null);
    setError(null);
    setStep('intro');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-indigo-500 selection:text-white">
      {step === 'intro' && <Intro onStart={handleStart} />}
      
      {step === 'upload' && (
        <>
          <CameraUpload onImageSelected={handleImageSelected} />
          {error && (
            <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-6 py-3 rounded-full flex items-center shadow-2xl animate-bounce z-50">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}
        </>
      )}
      
      {step === 'processing' && <Processing />}
      
      {step === 'results' && analysisResult && (
        <Results 
          result={analysisResult} 
          audioBuffer={audioBuffer} 
          mood={currentMood}
          onRestart={handleRestart} 
        />
      )}
    </div>
  );
};

export default App;