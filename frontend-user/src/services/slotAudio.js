let ctx = null;

function getContext() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    ctx = new AudioContext();
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone(frequency, duration = 0.08, gain = 0.035, type = 'sine', delay = 0) {
  const audio = getContext();
  if (!audio) return;
  const start = audio.currentTime + delay;
  const oscillator = audio.createOscillator();
  const envelope = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(gain, start + 0.008);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(envelope);
  envelope.connect(audio.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

export const slotAudio = {
  unlock: () => getContext(),
  spinStart: () => {
    for (let i = 0; i < 4; i += 1) tone(150 + i * 35, 0.05, 0.02, 'triangle', i * 0.035);
  },
  reelStop: (index = 0) => tone(220 + index * 25, 0.055, 0.018, 'square'),
  win: (amount = 1) => {
    const notes = amount >= 10 ? [392, 494, 587, 784, 988] : [392, 494, 587];
    notes.forEach((n, i) => tone(n, 0.16, amount >= 10 ? 0.045 : 0.03, 'sine', i * 0.08));
  },
  freeSpins: () => [523, 659, 784, 1047].forEach((n, i) => tone(n, 0.22, 0.045, 'triangle', i * 0.1)),
  bigWin: () => [392, 494, 587, 659, 784, 988, 1175].forEach((n, i) => tone(n, 0.2, 0.055, 'sawtooth', i * 0.075)),
};

export default slotAudio;
