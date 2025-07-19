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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">
            Dungeon Quest
          </h1>
          <p className="text-white/80">Educational RPG Adventure</p>
        </div>

        <div className="mb-6">
          <div className="w-32 h-32 mx-auto mb-4 relative">
            {/* Spinning loader */}
            <div className="w-full h-full border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-lg">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <Progress value={progress} className="w-full h-3" />
        </div>

        <p className="text-white/90 text-sm font-medium mb-2">{loadingText}</p>
        
        <div className="text-xs text-white/60 space-y-1">
          <p>✓ Modernized from PHP/SQL to React/JSON</p>
          <p>✓ Enhanced AI and dungeon progression</p>
          <p>✓ 20+ educational questions across subjects</p>
        </div>
      </div>
    </div>
  );
};