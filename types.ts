export type Mood = 'judgmental' | 'stressed' | 'bored' | 'inspired';

export interface AnalysisResult {
  honestThoughts: string;
  roast: string;
  pepTalk: string;
  personality: string;
}

export type AppStep = 'intro' | 'upload' | 'processing' | 'results' | 'outro';
