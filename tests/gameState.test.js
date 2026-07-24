const test = require("node:test");
const assert = require("node:assert/strict");
const { GAME_STATUS, createInitialGameState, registerJump, registerCollision } = require("../gameState.js");

test("createInitialGameState starts at zero jumps and playing", () => {
  assert.deepEqual(createInitialGameState(), { status: GAME_STATUS.PLAYING, jumpCount: 0 });
});

test("registerJump increments jump count while below the win threshold", () => {
  const state = { status: GAME_STATUS.PLAYING, jumpCount: 3 };
  const result = registerJump(state, 18);
  assert.deepEqual(result, { status: GAME_STATUS.PLAYING, jumpCount: 4 });
});

test("registerJump transitions to WON on reaching the win threshold", () => {
  const state = { status: GAME_STATUS.PLAYING, jumpCount: 17 };
  const result = registerJump(state, 18);
  assert.deepEqual(result, { status: GAME_STATUS.WON, jumpCount: 18 });
});

test("registerJump is a no-op when not playing", () => {
  const state = { status: GAME_STATUS.GAME_OVER, jumpCount: 5 };
  const result = registerJump(state, 18);
  assert.deepEqual(result, state);
});

test("registerCollision ends the game and preserves jump count", () => {
  const state = { status: GAME_STATUS.PLAYING, jumpCount: 9 };
  const result = registerCollision(state);
  assert.deepEqual(result, { status: GAME_STATUS.GAME_OVER, jumpCount: 9 });
});

test("registerCollision is a no-op when already game over or won", () => {
  const wonState = { status: GAME_STATUS.WON, jumpCount: 18 };
  assert.deepEqual(registerCollision(wonState), wonState);
});
