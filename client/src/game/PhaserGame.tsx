import React, { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { MainMenuScene } from './scenes/MainMenuScene';
import { GameScene } from './scenes/GameScene';
import { DungeonScene } from './scenes/DungeonScene';
import { BossScene } from './scenes/BossScene';
import { PauseScene } from './scenes/PauseScene';
import { GameOverScene } from './scenes/GameOverScene';

interface PhaserGameProps {
  onGameEvent?: (event: string, data: any) => void;
}

export const PhaserGame: React.FC<PhaserGameProps> = ({ onGameEvent }) => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!parentRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 1024,
      height: 768,
      parent: parentRef.current,
      backgroundColor: '#000000',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0, x: 0 },
          debug: false
        }
      },
      scene: [
        MainMenuScene,
        GameScene,
        DungeonScene,
        BossScene,
        PauseScene,
        GameOverScene
      ],
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    gameRef.current = new Phaser.Game(config);

    // Global game event emitter
    window.gameEventEmitter = onGameEvent;

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [onGameEvent]);

  return (
    <div 
      ref={parentRef} 
      className="w-full h-full flex items-center justify-center bg-black"
      style={{ minHeight: '600px' }}
    />
  );
};

export default PhaserGame;