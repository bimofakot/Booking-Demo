import { SOUND_STORAGE_KEY } from './constants';

let audioContext: AudioContext | null = null;

export function isSoundEnabled(): boolean {
  try {
    return localStorage.getItem(SOUND_STORAGE_KEY) !== 'off';
  } catch {
    return true;
  }
}

export function setSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'on' : 'off');
  } catch {
    // Preferensi suara tetap berlaku untuk sesi ini walau gagal disimpan.
  }
}

export function playBookingChime(): void {
  try {
    const AudioCtor = window.AudioContext;
    if (!AudioCtor) return;

    const context = audioContext ?? new AudioCtor();
    audioContext = context;
    if (context.state === 'suspended') void context.resume();

    const startTime = context.currentTime;
    [880, 1174.66].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const noteStart = startTime + index * 0.16;

      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.16, noteStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.28);

      oscillator.connect(gain).connect(context.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + 0.3);
    });
  } catch {
    // Browser bisa menolak AudioContext sebelum ada interaksi pengguna.
  }
}
