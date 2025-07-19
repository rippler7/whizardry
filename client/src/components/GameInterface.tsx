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
          questionsAnswered: data.questionsAnswered,
          accuracy: Math.round((data.correctAnswers / data.questionsAnswered) * 100),
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
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Load Game</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {saves.length === 0 ? (
              <p className="text-center text-muted-foreground">No saved games found</p>
            ) : (
              saves.map((save) => (
                <div key={save.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{save.playerName}</h3>
                    <p className="text-sm text-muted-foreground">
                      Level {save.stats.level} • Score: {save.stats.score}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last played: {new Date(save.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => loadGame(save.id)} size="sm">
                      Load
                    </Button>
                    <Button 
                      onClick={() => gameManager.deleteSave(save.id)} 
                      variant="destructive" 
                      size="sm"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
            <Button onClick={() => setShowSaveMenu(false)} variant="outline" className="w-full">
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
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>High Scores & Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Game Statistics */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Game Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalPlayers}</div>
                  <div className="text-sm text-muted-foreground">Total Players</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.totalGamesCompleted}</div>
                  <div className="text-sm text-muted-foreground">Games Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.averageScore}</div>
                  <div className="text-sm text-muted-foreground">Avg Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.completionRate}%</div>
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                </div>
              </div>
            </div>

            {/* High Scores */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Top Scores</h3>
              {highScores.length === 0 ? (
                <p className="text-center text-muted-foreground">No high scores yet</p>
              ) : (
                <div className="space-y-2">
                  {highScores.map((score, index) => (
                    <div key={score.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={index < 3 ? 'default' : 'secondary'}>
                          #{index + 1}
                        </Badge>
                        <div>
                          <div className="font-semibold">{score.playerName}</div>
                          <div className="text-sm text-muted-foreground">
                            Level {score.level} • {score.accuracy}% accuracy
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{score.score.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(score.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button onClick={() => setShowHighScores(false)} variant="outline" className="w-full">
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
        <PhaserGame onGameEvent={handleGameEvent} />
        
        {/* Game Stats Overlay */}
        {gameStats && (
          <div className="absolute top-4 right-4 bg-black/80 text-white p-4 rounded-lg">
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
          className="absolute top-4 left-4"
          variant="secondary"
          size="sm"
        >
          Exit Game
        </Button>
      </div>
    );
  }

  if (showSaveMenu) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <SaveMenu />
      </div>
    );
  }

  if (showHighScores) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <HighScoresMenu />
      </div>
    );
  }

  // Main Menu
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Dungeon Quest
          </CardTitle>
          <p className="text-muted-foreground">Educational RPG Adventure</p>
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
            <Button onClick={startNewGame} className="w-full" size="lg">
              New Game
            </Button>
            
            <Button 
              onClick={() => setShowSaveMenu(true)} 
              variant="outline" 
              className="w-full"
            >
              Load Game
            </Button>
            
            <Button 
              onClick={() => setShowHighScores(true)} 
              variant="outline" 
              className="w-full"
            >
              High Scores
            </Button>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold mb-2">How to Play</h3>
            <ul className="text-xs text-muted-foreground space-y-1">
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