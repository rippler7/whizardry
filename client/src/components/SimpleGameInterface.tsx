import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { LoadingScreen } from './LoadingScreen';
import PhaserGame from '../game/PhaserGame';

export const SimpleGameInterface: React.FC = () => {
  const [gameState, setGameState] = useState<'menu' | 'loading' | 'playing'>('menu');
  const [playerName, setPlayerName] = useState('Player');

  const handleStartGame = () => {
    setGameState('loading');
  };

  const handleLoadComplete = () => {
    setGameState('playing');
  };

  const handleExitGame = () => {
    setGameState('menu');
  };

  if (gameState === 'loading') {
    return <LoadingScreen onLoadComplete={handleLoadComplete} />;
  }

  if (gameState === 'playing') {
    return (
      <div className="w-full h-screen bg-black relative">
        <PhaserGame playerName={playerName} onGameEvent={(event, data) => {
          console.log('Game event:', event, data);
          if (event === 'exitToMenu') {
            handleExitGame();
          }
        }} />
        
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 font-serif flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-stone-800/95 border-2 border-amber-700/60 shadow-[0_0_30px_rgba(180,83,9,0.3)] rounded-xl">
        <CardHeader className="text-center">
          <CardTitle className="flex justify-center mb-2">
            <img src="assets/sprites/logo.png" alt="Dungeon Quest" className="h-32 object-contain drop-shadow-[0_0_10px_rgba(251,191,36,0.2)]" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium mb-2 text-amber-200/90 tracking-wide">
              Player Name
            </label>
            <Input
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="bg-stone-950 border-amber-700/50 text-amber-100 focus-visible:ring-amber-600 placeholder:text-stone-600"
              placeholder="Enter your name"
              maxLength={20}
            />
          </div>

          <div className="space-y-2">
            <Button onClick={handleStartGame} className="w-full bg-gradient-to-b from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-amber-50 border border-amber-500/50 shadow-md uppercase tracking-widest font-bold" size="lg">
              Start Game
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};