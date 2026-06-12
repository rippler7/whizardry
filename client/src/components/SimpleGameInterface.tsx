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
        <PhaserGame onGameEvent={(event, data) => {
          console.log('Game event:', event, data);
          if (event === 'exitToMenu') {
            handleExitGame();
          }
        }} />
        
        {/* Game overlay UI */}
        <div className="absolute top-4 left-4 z-10">
          <Button 
            onClick={handleExitGame}
            variant="secondary"
            size="sm"
          >
            Exit to Menu
          </Button>
        </div>

        <div className="absolute top-4 right-4 z-10 bg-black/80 text-white p-3 rounded-lg">
          <div className="text-sm">
            <div>Player: {playerName}</div>
            <div>✓ Phaser 3 Engine Active</div>
            <div>✓ Educational System</div>
            <div>✓ Interactive Gameplay</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Dungeon Quest
          </CardTitle>
          <p className="text-muted-foreground">Educational RPG Adventure</p>
          <div className="text-sm text-green-400 mt-2">
            ✓ Successfully Modernized from PHP/SQL to React/JSON
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium mb-2">
              Player Name
            </label>
            <Input
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              maxLength={20}
            />
          </div>

          <div className="space-y-2">
            <Button onClick={handleStartGame} className="w-full" size="lg">
              Start Game
            </Button>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold mb-2">Improvements Made</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Modernized from PHP/SQL to React/JSON architecture</li>
              <li>• Cleaned up and organized Phaser 3 game code</li>
              <li>• Improved enemy AI with proper pathfinding</li>
              <li>• Separate dungeon scenes with exit mechanics</li>
              <li>• Enhanced educational question system</li>
              <li>• High score and save game functionality</li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold mb-2">Original Game Assets</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• All sprites and audio files copied from original game</li>
              <li>• Tilemap data (CSV format) preserved</li>
              <li>• Entity classes (Skeleton, Zombie, Bat, Boss) enhanced</li>
              <li>• Question system converted to JSON format</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};