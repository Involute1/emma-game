const test = require("node:test");
const assert = require("node:assert/strict");
const { CONFETTI_COLORS, createConfettiParticle, updateConfettiParticle, createConfettiBurst } = require("../confetti.js");

function sequenceRng(values) {
  let i = 0;
  return () => values[i++ % values.length];
}

test("createConfettiParticle derives fields from successive rng() calls", () => {
  const rng = sequenceRng([0.5, 0.5, 0.5, 0.5, 0.5, 0.4]);
  const particle = createConfettiParticle(600, rng);
  assert.deepEqual(particle, {
    x: 300,
    y: -10,
    vx: 0,
    vy: 2,
    rotation: 180,
    rotationSpeed: 0,
    color: CONFETTI_COLORS[Math.floor(0.4 * CONFETTI_COLORS.length)],
  });
});

test("updateConfettiParticle advances position and rotation by velocity", () => {
  const particle = { x: 10, y: 20, vx: 2, vy: 3, rotation: 90, rotationSpeed: 5, color: "#fff" };
  const result = updateConfettiParticle(particle);
  assert.deepEqual(result, { x: 12, y: 23, vx: 2, vy: 3, rotation: 95, rotationSpeed: 5, color: "#fff" });
});

test("createConfettiBurst creates the requested number of particles", () => {
  const rng = () => 0.5;
  const burst = createConfettiBurst(80, 600, rng);
  assert.equal(burst.length, 80);
});
