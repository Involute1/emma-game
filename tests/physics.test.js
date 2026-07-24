const test = require("node:test");
const assert = require("node:assert/strict");
const { stepPlayerPhysics, startJump } = require("../physics.js");

test("startJump sets upward velocity and grounded false when grounded", () => {
  const result = startJump({ y: 90, velocityY: 0, grounded: true }, -11);
  assert.deepEqual(result, { y: 90, velocityY: -11, grounded: false });
});

test("startJump is a no-op when already airborne", () => {
  const airborne = { y: 70, velocityY: -5, grounded: false };
  const result = startJump(airborne, -11);
  assert.deepEqual(result, airborne);
});

test("stepPlayerPhysics applies gravity while airborne", () => {
  const result = stepPlayerPhysics({ y: 50, velocityY: -5, grounded: false }, 0.6, 90);
  assert.deepEqual(result, { y: 45.6, velocityY: -4.4, grounded: false });
});

test("stepPlayerPhysics clamps to ground and zeroes velocity on landing", () => {
  const result = stepPlayerPhysics({ y: 88, velocityY: 5, grounded: false }, 0.6, 90);
  assert.deepEqual(result, { y: 90, velocityY: 0, grounded: true });
});

test("stepPlayerPhysics keeps a grounded player pinned to groundY", () => {
  const result = stepPlayerPhysics({ y: 90, velocityY: 0, grounded: true }, 0.6, 90);
  assert.deepEqual(result, { y: 90, velocityY: 0, grounded: true });
});
