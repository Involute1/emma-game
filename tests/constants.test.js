const test = require("node:test");
const assert = require("node:assert/strict");
const C = require("../constants.js");

test("derived ground position matches ground line minus player height", () => {
  assert.equal(C.PLAYER_GROUND_Y, C.GROUND_LINE_Y - C.PLAYER_HEIGHT);
});

test("win threshold is 18 jumps", () => {
  assert.equal(C.TOTAL_JUMPS_TO_WIN, 18);
});

test("canvas dimensions match the design spec", () => {
  assert.equal(C.CANVAS_WIDTH, 600);
  assert.equal(C.CANVAS_HEIGHT, 150);
});
