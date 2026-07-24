const test = require("node:test");
const assert = require("node:assert/strict");
const { isColliding } = require("../collision.js");

test("overlapping rects collide", () => {
  const a = { x: 10, y: 10, width: 20, height: 20 };
  const b = { x: 20, y: 20, width: 20, height: 20 };
  assert.equal(isColliding(a, b), true);
});

test("separated rects do not collide", () => {
  const a = { x: 0, y: 0, width: 10, height: 10 };
  const b = { x: 50, y: 50, width: 10, height: 10 };
  assert.equal(isColliding(a, b), false);
});

test("edge-touching rects do not count as colliding", () => {
  const a = { x: 0, y: 0, width: 10, height: 10 };
  const b = { x: 10, y: 0, width: 10, height: 10 };
  assert.equal(isColliding(a, b), false);
});

test("one rect fully inside another collides", () => {
  const a = { x: 0, y: 0, width: 100, height: 100 };
  const b = { x: 40, y: 40, width: 10, height: 10 };
  assert.equal(isColliding(a, b), true);
});
