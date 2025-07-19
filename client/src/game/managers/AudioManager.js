import { CONSTANTS } from '../config/Constants.js';

export class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
        this.isMuted = false;
    }

    preloadSounds() {
        // In a real game, these would load actual audio files
        // For now we'll create placeholder sounds or use Web Audio API
        console.log('Audio assets would be loaded here');
    }

    playSound(key, config = {}) {
        if (this.isMuted) return;
        
        // For now, just log the sound being played
        console.log(`Playing sound: ${key}`);
        
        // In a real implementation:
        // if (this.sounds[key]) {
        //     this.sounds[key].play(config);
        // }
    }

    playMusic(key, loop = true) {
        if (this.isMuted) return;
        
        console.log(`Playing music: ${key} (loop: ${loop})`);
        
        // In a real implementation:
        // if (this.sounds[key]) {
        //     this.sounds[key].play({ loop, volume: this.musicVolume });
        // }
    }

    stopMusic() {
        console.log('Stopping music');
        // In a real implementation:
        // Object.values(this.sounds).forEach(sound => {
        //     if (sound.isPlaying) sound.stop();
        // });
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        console.log(`Music volume set to: ${this.musicVolume}`);
    }

    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        console.log(`SFX volume set to: ${this.sfxVolume}`);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        console.log(`Audio ${this.isMuted ? 'muted' : 'unmuted'}`);
        return this.isMuted;
    }

    playBulletSound() {
        this.playSound(CONSTANTS.AUDIO_KEYS.BULLET_SOUND);
    }

    playEnemyHitSound() {
        this.playSound(CONSTANTS.AUDIO_KEYS.ENEMY_HIT);
    }

    playPlayerHitSound() {
        this.playSound(CONSTANTS.AUDIO_KEYS.PLAYER_HIT);
    }

    playChestOpenSound() {
        this.playSound(CONSTANTS.AUDIO_KEYS.CHEST_OPEN);
    }

    playDoorOpenSound() {
        this.playSound(CONSTANTS.AUDIO_KEYS.DOOR_OPEN);
    }
}