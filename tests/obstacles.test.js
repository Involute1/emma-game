const test = require("node:test");
const assert = require("node:assert/strict");
const { createObstacle, moveObstacles, shouldSpawn, randomSpawnThreshold } = require("../obstacles.js");

test("createObstacle spawns at the right edge, resting on the ground line", () => {
  const obstacle = createObstacle(600, 130, 16, 30);
  assert.deepEqual(obstacle, { x: 600, y: 100, width: 16, height: 30 });
});

test("moveObstacles shifts every obstacle left by speed", () => {
  const obstacles = [{ x: 100, y: 100, width: 16, height: 30 }];
  const result = moveObstacles(obstacles, 4);
  assert.deepEqual(result, [{ x: 96, y: 100, width: 16, height: 30 }]);
});

test("moveObstacles preserves an obstacle's color field across a move", () => {
  const obstacles = [{ x: 100, y: 100, width: 16, height: 30, color: "#e63946" }];
  const result = moveObstacles(obstacles, 4);
  assert.deepEqual(result, [{ x: 96, y: 100, width: 16, height: 30, color: "#e63946" }]);
});

test("moveObstacles drops obstacles that have scrolled fully off-screen", () => {
  const obstacles = [{ x: -16, y: 100, width: 16, height: 30 }];
  const result = moveObstacles(obstacles, 4);
  assert.deepEqual(result, []);
});

test("shouldSpawn is true once distance reaches the threshold", () => {
  assert.equal(shouldSpawn(90, 90), true);
  assert.equal(shouldSpawn(89, 90), false);
});

test("randomSpawnThreshold maps rng() output into the min/max range", () => {
  assert.equal(randomSpawnThreshold(() => 0, 90, 220), 90);
  assert.equal(randomSpawnThreshold(() => 1, 90, 220), 220);
  assert.equal(randomSpawnThreshold(() => 0.5, 90, 220), 155);
});
