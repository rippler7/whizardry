import React, { useState, useEffect } from 'react';
import PhaserGame from '../game/PhaserGame';
import { GameStateManager } from '../game/managers/GameStateManager';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';

interface GameStats {
  level: number;
  health: number;
  maxHealth: number;
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
}

export const GameInterface: React.FC = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [playerName, setPlayerName] = useState('Player');
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);
  const gameManager = GameStateManager.getInstance();

  useEffect(() => {
    // Check for existing save
    const saves = gameManager.getAllSaves();
    if (saves.length > 0) {
      const lastSave = saves[saves.length - 1];
      setPlayerName(lastSave.playerName);
    }
  }, []);

  const handleGameEvent = (event: string, data: any) => {
    switch (event) {
      case 'playerStatsUpdate':
        setGameStats(data);
        gameManager.updateCurrentSave(data);
        break;
      case 'dungeonComplete':
        gameManager.completeDungeon(data.dungeonId);
        break;
      case 'gameComplete':
        gameManager.addHighScore({
          id: Date.now().toString(),
          playerName: playerName,
          score: data.score,
          level: data.level,
          enemiesKilled: data.enemiesKilled || 0,
          difficulty: data.difficulty || 'easy',
          questionsAnswered: data.questionsAnswered,
          accuracy: data.questionsAnswered > 0 ? Math.round((data.correctAnswers / data.questionsAnswered) * 100) : 0,
          completionTime: Date.now(),
          date: new Date().toISOString()
        });
        break;
      case 'highScoreAdded':
        gameManager.addHighScore(data);
        break;
    }
  };

  const startNewGame = () => {
    gameManager.createNewSave(playerName);
    setGameStarted(true);
  };

  const loadGame = (saveId: string) => {
    const save = gameManager.loadSave(saveId);
    if (save) {
      setPlayerName(save.playerName);
      setGameStarted(true);
    }
  };

  const SaveMenu = () => {
    const saves = gameManager.getAllSaves();
    
    return (
      <Card className="w-full max-w-2xl mx-auto bg-stone-800/95 border-2 border-amber-700/60 text-stone-200 shadow-[0_0_30px_rgba(180,83,9,0.3)] font-serif">
        <CardHeader>
          <CardTitle className="text-amber-500 text-2xl">Load Game</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {saves.length === 0 ? (
              <p className="text-center text-amber-200/60">No saved games found</p>
            ) : (
              saves.map((save) => (
                <div key={save.id} className="flex items-center justify-between p-4 border border-amber-900/50 bg-stone-900/50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-amber-300">{save.playerName}</h3>
                    <p className="text-sm text-amber-200/70">
                      Level {save.stats.level} • Score: {save.stats.score}
                    </p>
                    <p className="text-xs text-amber-200/50">
                      Last played: {new Date(save.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => loadGame(save.id)} size="sm" className="bg-amber-700 hover:bg-amber-600 text-amber-50 border border-amber-500/50">
                      Load
                    </Button>
                    <Button 
                      onClick={() => gameManager.deleteSave(save.id)} 
                      className="bg-red-900 hover:bg-red-800 text-red-100 border border-red-700/50" 
                      size="sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
            <Button onClick={() => setShowSaveMenu(false)} className="w-full bg-stone-900 hover:bg-stone-800 text-amber-200 border border-amber-700/50 uppercase tracking-widest">
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const HighScoresMenu = () => {
    const highScores = gameManager.getHighScores(10);
    const stats = gameManager.getGameStatistics();
    
    return (
      <Card className="w-full max-w-2xl mx-auto bg-stone-800/95 border-2 border-amber-700/60 text-stone-200 shadow-[0_0_30px_rgba(180,83,9,0.3)] font-serif">
        <CardHeader>
          <CardTitle className="text-amber-500 text-2xl">High Scores & Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Game Statistics */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-amber-400">Game Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-500">{stats.totalPlayers}</div>
                  <div className="text-sm text-amber-200/60">Total Players</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">{stats.totalGamesCompleted}</div>
                  <div className="text-sm text-amber-200/60">Games Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400">{stats.averageScore}</div>
                  <div className="text-sm text-amber-200/60">Avg Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.completionRate}%</div>
                  <div className="text-sm text-amber-200/60">Completion Rate</div>
                </div>
              </div>
            </div>

            {/* High Scores */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-amber-400">Top Scores</h3>
              {highScores.length === 0 ? (
                <p className="text-center text-amber-200/60">No high scores yet</p>
              ) : (
                <div className="space-y-2">
                  {highScores.map((score, index) => (
                    <div key={score.id} className="flex items-center justify-between p-3 border border-amber-900/50 bg-stone-900/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={index < 3 ? 'bg-amber-600 hover:bg-amber-500 text-stone-900' : 'bg-stone-700 text-amber-200'}>
                          #{index + 1}
                        </Badge>
                        <div>
                          <div className="font-semibold text-amber-300">{score.playerName}</div>
                          <div className="text-sm text-amber-200/70">
                            Level {score.level} • {score.accuracy}% accuracy
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-amber-400">{score.score.toLocaleString()}</div>
                        <div className="text-xs text-amber-200/50">
                          {new Date(score.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={() => setShowHighScores(false)} className="w-full bg-stone-900 hover:bg-stone-800 text-amber-200 border border-amber-700/50 uppercase tracking-widest">
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (gameStarted) {
    return (
      <div className="w-full h-screen bg-black">
        <PhaserGame playerName={playerName} onGameEvent={handleGameEvent} />
        
        {/* Game Stats Overlay */}
        {gameStats && (
          <div className="absolute top-4 right-4 bg-stone-900/95 border-2 border-amber-700/50 text-amber-100 p-4 rounded-lg font-serif shadow-[0_0_15px_rgba(180,83,9,0.3)]">
            <div className="text-sm space-y-1">
              <div>Level: {gameStats.level}</div>
              <div>Score: {gameStats.score.toLocaleString()}</div>
              <div>Health: {gameStats.health}/{gameStats.maxHealth}</div>
              <div>
                Accuracy: {gameStats.questionsAnswered > 0 
                  ? Math.round((gameStats.correctAnswers / gameStats.questionsAnswered) * 100)
                  : 0}%
              </div>
            </div>
          </div>
        )}
        
        {/* Exit Game Button */}
        <Button 
          onClick={() => setGameStarted(false)}
          className="absolute top-4 left-4 bg-stone-900/90 hover:bg-stone-800 text-amber-200 border-2 border-amber-700/50 font-serif shadow-md"
          size="sm"
        >
          Exit Game
        </Button>
      </div>
    );
  }

  if (showSaveMenu) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 flex items-center justify-center p-4">
        <SaveMenu />
      </div>
    );
  }

  if (showHighScores) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 flex items-center justify-center p-4">
        <HighScoresMenu />
      </div>
    );
  }

  // Main Menu
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 font-serif flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-stone-800/95 border-2 border-amber-700/60 shadow-[0_0_30px_rgba(180,83,9,0.3)]">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-700 bg-clip-text text-transparent drop-shadow-sm mb-2">
            Dungeon Quest
          </CardTitle>
          <p className="text-amber-200/80 italic">Educational RPG Adventure</p>
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

          <div className="space-y-4 pt-2">
            <Button onClick={startNewGame} className="w-full bg-gradient-to-b from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-amber-50 border border-amber-500/50 shadow-md uppercase tracking-widest font-bold" size="lg">
              New Game
            </Button>
            
            <Button 
              onClick={() => setShowSaveMenu(true)} 
              className="w-full bg-stone-900 hover:bg-stone-800 text-amber-200 border border-amber-700/50 uppercase tracking-widest"
            >
              Load Game
            </Button>
            
            <Button 
              onClick={() => setShowHighScores(true)} 
              className="w-full bg-stone-900 hover:bg-stone-800 text-amber-200 border border-amber-700/50 uppercase tracking-widest"
            >
              High Scores
            </Button>
          </div>

          <div className="pt-5 mt-5 border-t border-amber-900/50">
            <h3 className="text-sm font-semibold mb-3 text-amber-400">How to Play</h3>
            <ul className="text-xs text-amber-200/70 space-y-2">
              <li>• Use WASD or arrow keys to move</li>
              <li>• SPACE to shoot, mouse to aim</li>
              <li>• Answer questions to unlock chests</li>
              <li>• Defeat enemies to gain experience</li>
              <li>• Reach the exit to advance to next dungeon</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};