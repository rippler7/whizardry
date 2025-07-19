import { ASSET_KEYS, CONSTANTS } from '../config/Constants.js';

export class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
        this.musicVolume = CONSTANTS.AUDIO_VOLUME.MUSIC;
        this.sfxVolume = CONSTANTS.AUDIO_VOLUME.SFX;
        this.isMuted = false;
    }

    initialize() {
        try {
            // Initialize all sounds
            this.sounds.jungle = this.scene.sound.add(ASSET_KEYS.AUDIO.JUNGLE, { volume: this.musicVolume });
            this.sounds.arcade = this.scene.sound.add(ASSET_KEYS.AUDIO.ARCADE, { volume: this.musicVolume });
            this.sounds.fire = this.scene.sound.add(ASSET_KEYS.AUDIO.FIRE, { volume: this.sfxVolume });
            this.sounds.star = this.scene.sound.add(ASSET_KEYS.AUDIO.STAR, { volume: this.sfxVolume });
            this.sounds.playerHurt = this.scene.sound.add(ASSET_KEYS.AUDIO.PLAYER_HURT, { volume: this.sfxVolume });
            this.sounds.enemyHit = this.scene.sound.add(ASSET_KEYS.AUDIO.ENEMY_HURT, { volume: this.sfxVolume });
            this.sounds.spitting = this.scene.sound.add(ASSET_KEYS.AUDIO.SPITTING, { volume: this.sfxVolume });
            this.sounds.doorLock = this.scene.sound.add(ASSET_KEYS.AUDIO.DOOR_LOCK, { volume: this.sfxVolume });
            this.sounds.doorOpen = this.scene.sound.add(ASSET_KEYS.AUDIO.DOOR_OPEN, { volume: this.sfxVolume });
            this.sounds.doorClose = this.scene.sound.add(ASSET_KEYS.AUDIO.DOOR_CLOSE, { volume: this.sfxVolume });
            this.sounds.bossTheme = this.scene.sound.add(ASSET_KEYS.AUDIO.BOSS_THEME, { volume: this.musicVolume });
            this.sounds.burst = this.scene.sound.add(ASSET_KEYS.AUDIO.BURST, { volume: this.sfxVolume });

            // Start background music
            this.playBackgroundMusic();
        } catch (error) {
            console.warn('Audio initialization error:', error);
        }
    }

    playBackgroundMusic() {
        if (this.sounds.arcade && !this.isMuted) {
            this.sounds.arcade.play({ loop: true });
        }
    }

    playSound(soundKey, config = {}) {
        if (this.isMuted) return;
        
        const sound = this.sounds[soundKey];
        if (sound) {
            try {
                sound.play(config);
            } catch (error) {
                console.warn(`Failed to play sound ${soundKey}:`, error);
            }
        }
    }

    stopSound(soundKey) {
        const sound = this.sounds[soundKey];
        if (sound && sound.isPlaying) {
            sound.stop();
        }
    }

    stopAllSounds() {
        Object.values(this.sounds).forEach(sound => {
            if (sound && sound.isPlaying) {
                sound.stop();
            }
        });
    }

    setMusicVolume(volume) {
        this.musicVolume = Phaser.Math.Clamp(volume, 0, 1);
        if (this.sounds.arcade) this.sounds.arcade.setVolume(this.musicVolume);
        if (this.sounds.jungle) this.sounds.jungle.setVolume(this.musicVolume);
        if (this.sounds.bossTheme) this.sounds.bossTheme.setVolume(this.musicVolume);
    }

    setSFXVolume(volume) {
        this.sfxVolume = Phaser.Math.Clamp(volume, 0, 1);
        Object.entries(this.sounds).forEach(([key, sound]) => {
            if (key !== 'arcade' && key !== 'jungle' && key !== 'bossTheme') {
                sound.setVolume(this.sfxVolume);
            }
        });
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopAllSounds();
        } else {
            this.playBackgroundMusic();
        }
    }

    destroy() {
        this.stopAllSounds();
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.destroy();
            }
        });
        this.sounds = {};
    }
}
