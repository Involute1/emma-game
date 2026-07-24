const fs = require("fs");
const path = require("path");

const SAMPLE_RATE = 44100;
const DURATION = 0.15;
const START_FREQ = 300;
const PEAK_FREQ = 700;
const SWEEP_TIME = 0.08;
const START_GAIN = 0.2;
const END_GAIN = 0.001;

function buildSamples() {
  const totalSamples = Math.round(DURATION * SAMPLE_RATE);
  const samples = new Int16Array(totalSamples);
  let phase = 0;

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const freq =
      t <= SWEEP_TIME ? START_FREQ * Math.pow(PEAK_FREQ / START_FREQ, t / SWEEP_TIME) : PEAK_FREQ;
    const gain = START_GAIN * Math.pow(END_GAIN / START_GAIN, t / DURATION);
    phase += (2 * Math.PI * freq) / SAMPLE_RATE;
    const value = Math.max(-1, Math.min(1, gain * Math.sin(phase)));
    samples[i] = Math.round(value * 32767);
  }

  return samples;
}

function writeWavFile(filePath, samples, sampleRate) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    buffer.writeInt16LE(samples[i], 44 + i * 2);
  }

  fs.writeFileSync(filePath, buffer);
}

const outPath = path.join(__dirname, "..", "sounds", "jump.wav");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
writeWavFile(outPath, buildSamples(), SAMPLE_RATE);
console.log("Wrote " + outPath);
