// Tiny synthesized sound engine (Web Audio). No audio files, fails silently if unsupported.
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
let ambient: { stop: () => void } | null = null;
const listeners = new Set<(m: boolean) => void>();

function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  dur: number,
  opts: { type?: OscillatorType; vol?: number; delay?: number; slideTo?: number } = {},
) {
  const c = ac();
  if (!c || !master || muted) return;
  const t = c.currentTime + (opts.delay ?? 0);
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = opts.type ?? "sine";
  o.frequency.setValueAtTime(freq, t);
  if (opts.slideTo) o.frequency.exponentialRampToValueAtTime(opts.slideTo, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(opts.vol ?? 0.15, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function noise(dur: number, vol = 0.08, filterFrom = 400, filterTo = 3000) {
  const c = ac();
  if (!c || !master || muted) return;
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.setValueAtTime(filterFrom, c.currentTime);
  f.frequency.exponentialRampToValueAtTime(filterTo, c.currentTime + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(vol, c.currentTime + dur * 0.4);
  g.gain.linearRampToValueAtTime(0, c.currentTime + dur);
  src.connect(f).connect(g).connect(master);
  src.start();
}

let lastTick = 0;
export const sfx = {
  unlock: () => void ac(),
  key: () => {
    const now = performance.now();
    if (now - lastTick < 35) return;
    lastTick = now;
    tone(1800 + Math.random() * 600, 0.025, { type: "square", vol: 0.025 });
  },
  click: () => tone(660, 0.08, { type: "triangle", vol: 0.12, slideTo: 990 }),
  whoosh: () => noise(0.6, 0.07, 300, 2500),
  check: () => {
    tone(880, 0.12, { vol: 0.1 });
    tone(1320, 0.18, { vol: 0.08, delay: 0.06 });
  },
  alert: () => {
    tone(220, 0.25, { type: "sawtooth", vol: 0.08 });
    tone(220, 0.25, { type: "sawtooth", vol: 0.08, delay: 0.32 });
  },
  send: () => tone(520, 0.1, { type: "sine", vol: 0.1, slideTo: 880 }),
  blip: () => tone(700 + Math.random() * 300, 0.03, { type: "sine", vol: 0.03 }),
  boing: () => tone(300, 0.35, { type: "triangle", vol: 0.12, slideTo: 900 }),
  error: () => {
    tone(160, 0.5, { type: "square", vol: 0.07 });
    tone(120, 0.6, { type: "square", vol: 0.06, delay: 0.2 });
  },
  warm: () =>
    [261.6, 329.6, 392, 523.3].forEach((f, i) => tone(f, 3, { vol: 0.06, delay: i * 0.15 })),
  chime: () =>
    [523.3, 659.3, 784, 1046.5, 1318.5].forEach((f, i) =>
      tone(f, 1.6, { type: "triangle", vol: 0.08, delay: i * 0.12 }),
    ),
  startAmbient: () => {
    const c = ac();
    if (!c || !master || ambient) return;
    // Generative lo-fi loop: soft pad chords + gentle arpeggio, loops forever.
    const bus = c.createGain();
    bus.gain.value = 0;
    bus.gain.linearRampToValueAtTime(1, c.currentTime + 4);
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1800;
    bus.connect(lp).connect(master);
    const chords = [
      [220, 261.6, 329.6], // Am
      [174.6, 220, 261.6], // F
      [261.6, 329.6, 392], // C
      [196, 246.9, 293.7], // G
    ];
    const beat = 60 / 72;
    let step = 0;
    let nextTime = c.currentTime + 0.1;
    const note = (f: number, t: number, dur: number, vol: number, type: OscillatorType) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = type;
      o.frequency.value = f;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + Math.min(0.8, dur / 3));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(bus);
      o.start(t);
      o.stop(t + dur + 0.1);
    };
    const schedule = () => {
      while (nextTime < c.currentTime + 1.5) {
        const chord = chords[Math.floor(step / 8) % chords.length]!;
        if (step % 8 === 0) {
          chord.forEach((f) => note(f / 2, nextTime, beat * 8.5, 0.035, "sine"));
          note(chord[0]! / 4, nextTime, beat * 8, 0.05, "triangle");
        }
        const arp = [0, 1, 2, 1, 2, 0, 1, 2][step % 8]!;
        note(chord[arp]! * 2, nextTime, beat * 1.4, 0.022, "triangle");
        step++;
        nextTime += beat / 2;
      }
    };
    schedule();
    const id = setInterval(schedule, 400);
    ambient = {
      stop: () => {
        clearInterval(id);
        bus.gain.linearRampToValueAtTime(0, c.currentTime + 1);
        ambient = null;
      },
    };
  },
  stopAmbient: () => ambient?.stop(),
};

export function isMuted() {
  return muted;
}
export function setMuted(m: boolean) {
  muted = m;
  if (master && ctx) master.gain.setTargetAtTime(m ? 0 : 0.5, ctx.currentTime, 0.05);
  listeners.forEach((l) => l(m));
}
export function onMute(l: (m: boolean) => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
