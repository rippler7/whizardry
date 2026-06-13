import React, { useState, useEffect } from 'react';
import { Progress } from './ui/progress';

interface LoadingScreenProps {
  onLoadComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoadComplete }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing game...');

  const loadingSteps = [
    { text: 'Loading game assets...', duration: 1000 },
    { text: 'Setting up Phaser 3 engine...', duration: 800 },
    { text: 'Loading sprites and animations...', duration: 1200 },
    { text: 'Preparing audio files...', duration: 600 },
    { text: 'Loading educational content...', duration: 700 },
    { text: 'Initializing game scenes...', duration: 500 },
    { text: 'Setting up AI systems...', duration: 400 },
    { text: 'Ready to play!', duration: 300 }
  ];

  useEffect(() => {
    let currentStep = 0;
    let currentProgress = 0;

    const loadNext = () => {
      if (currentStep < loadingSteps.length) {
        const step = loadingSteps[currentStep];
        setLoadingText(step.text);
        
        const stepProgress = 100 / loadingSteps.length;
        const targetProgress = (currentStep + 1) * stepProgress;
        
        // Animate progress bar
        const progressInterval = setInterval(() => {
          currentProgress += 2;
          if (currentProgress >= targetProgress) {
            currentProgress = targetProgress;
            clearInterval(progressInterval);
            
            setTimeout(() => {
              currentStep++;
              if (currentStep >= loadingSteps.length) {
                setProgress(100);
                setTimeout(onLoadComplete, 500);
              } else {
                loadNext();
              }
            }, step.duration);
          }
          setProgress(currentProgress);
        }, 50);
      }
    };

    // Start loading sequence
    setTimeout(loadNext, 500);
  }, [onLoadComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 font-serif flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-700 bg-clip-text text-transparent mb-2 drop-shadow-sm">
            Dungeon Quest
          </h1>
          <p className="text-amber-200/80 italic">Educational RPG Adventure</p>
        </div>

        <div className="mb-6">
          <div className="w-32 h-32 mx-auto mb-4 relative">
            {/* Spinning loader */}
            <div className="w-full h-full border-4 border-stone-700 border-t-amber-500 rounded-full animate-spin shadow-[0_0_15px_rgba(245,158,11,0.2)]"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-amber-400 font-bold text-lg">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <Progress value={progress} className="w-full h-3 bg-stone-800 border border-stone-700" />
        </div>

        <p className="text-amber-100/90 text-sm font-medium mb-2">{loadingText}</p>
        
      </div>
    </div>
  );
};