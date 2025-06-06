import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private sounds: { [key: string]: HTMLAudioElement } = {};

  constructor() {
    // Initialize sound effects
    this.sounds = {
      playerBlackMove: new Audio('assets/sounds/click-124467.mp3'),
      playerWhiteMove: new Audio('assets/sounds/click-21156.mp3'),
      gameWin: new Audio('assets/sounds/game-win.mp3'),
      sweep: new Audio('assets/sounds/sweep-2637.mp3')
    };

    // Preload all sounds
    Object.values(this.sounds).forEach(sound => {
      sound.load();
    });
  }

  playSound(soundName: string): void {
    const sound = this.sounds[soundName];
    if (sound) {
      // Reset the sound to the beginning if it's already playing
      sound.currentTime = 0;
      sound.play().catch(error => {
        console.warn('Error playing sound:', error);
      });
    }
  }

  stopSound(soundName: string): void {
    const sound = this.sounds[soundName];
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }

  stopAllSounds(): void {
    Object.values(this.sounds).forEach(sound => {
      sound.pause();
      sound.currentTime = 0;
    });
  }
} 