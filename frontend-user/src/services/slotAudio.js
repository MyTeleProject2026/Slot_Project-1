let ctx = null;
let master = null;
let musicTimer = null;
let muted = false;

function getContext() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function tone(frequency, duration = 0.08, gain = 0.035, type = 'sine', delay = 0, slideTo = null) {
  const audio = getContext();
  if (!audio || muted) return;
  const start = audio.currentTime + delay;
  const oscillator = audio.createOscillator();
  const envelope = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(Math.max(1, frequency), start);
  if (slideTo) oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), start + duration);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(Math.max(0.0001, gain), start + Math.min(0.015, duration * 0.25));
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(envelope);
  envelope.connect(master || audio.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
}

function noise(duration = 0.06, gain = 0.015, delay = 0) {
  const audio = getContext();
  if (!audio || muted) return;
  const size = Math.max(1, Math.ceil(audio.sampleRate * duration));
  const buffer = audio.createBuffer(1, size, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < size; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / size);
  const source = audio.createBufferSource();
  const envelope = audio.createGain();
  const start = audio.currentTime + delay;
  envelope.gain.setValueAtTime(gain, start);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.buffer = buffer;
  source.connect(envelope);
  envelope.connect(master || audio.destination);
  source.start(start);
}

function stopMusic() {
  if (musicTimer) clearInterval(musicTimer);
  musicTimer = null;
}

export const slotAudio = {
  unlock: () => getContext(),
  setMuted: (value) => { muted = Boolean(value); if (muted) stopMusic(); },
  spinStart: () => {
    noise(0.12, 0.012);
    [110, 130, 155, 185, 220].forEach((n, i) => tone(n, 0.09, 0.018, 'triangle', i * 0.045, n * 1.35));
  },
  reelStop: (index = 0) => {
    noise(0.035, 0.018);
    tone(190 + index * 28, 0.06, 0.025, 'square', 0, 145 + index * 18);
  },
  win: (amount = 1) => {
    const notes = amount >= 20 ? [392, 494, 587, 784, 988] : [392, 494, 587];
    notes.forEach((n, i) => tone(n, 0.18, amount >= 20 ? 0.045 : 0.03, 'sine', i * 0.085));
  },
  nearWin: () => [220, 277, 330].forEach((n, i) => tone(n, 0.12, 0.025, 'triangle', i * 0.06)),
  freeSpins: () => [523, 659, 784, 1047, 1319].forEach((n, i) => tone(n, 0.24, 0.045, 'triangle', i * 0.09)),
  bonus: () => [196, 247, 294, 392, 494, 587, 784].forEach((n, i) => tone(n, 0.16, 0.05, 'sawtooth', i * 0.07)),
  bigWin: () => [392, 494, 587, 659, 784, 988, 1175].forEach((n, i) => tone(n, 0.22, 0.055, 'sawtooth', i * 0.075)),
  startMusic: () => {
    if (musicTimer || muted) return;
    let step = 0;
    const notes = [110, 130.81, 164.81, 196, 164.81, 146.83];
    const play = () => { const n = notes[step % notes.length]; tone(n, 0.34, 0.012, 'sine'); tone(n * 2, 0.16, 0.006, 'triangle', 0.08); step += 1; };
    play();
    musicTimer = setInterval(play, 780);
  },
  stopMusic,
};

export default slotAudio;