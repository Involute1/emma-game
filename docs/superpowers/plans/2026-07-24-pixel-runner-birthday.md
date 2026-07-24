# Pixel Runner — Birthday Edition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Browser recreation of the Chrome dino jumping game, reskinned with a pixel-art person, where landing 18 jumps in one life without hitting an obstacle triggers a "Happy Birthday, Emma!" screen with confetti.

**Architecture:** Plain classic `<script>` files (no bundler, no ES modules — avoids `file://` CORS issues so `index.html` can be opened directly). Game logic is split into small pure-function modules (physics, collision, game state, obstacles, confetti), each unit-tested with Node's built-in `node:test` runner. A final `game.js` wires the pure modules to `<canvas>` rendering, the `requestAnimationFrame` loop, and input — verified manually in a browser since canvas drawing isn't meaningfully unit-testable.

**Tech Stack:** Vanilla JS (ES5-style classic scripts), HTML5 Canvas 2D, Node.js built-in `node:test`/`node:assert` for the pure-logic test suite. Zero npm dependencies.

## Global Constraints

- No external dependencies, no npm packages, no build step. `package.json` exists only to run tests (`node --test`) — never installed via `npm install`.
- `index.html` must work by double-clicking it (file:// protocol) — use classic `<script src="...">` tags in dependency order, never `type="module"`.
- Every pure-logic file (`constants.js`, `physics.js`, `collision.js`, `gameState.js`, `obstacles.js`, `confetti.js`) ends with a `typeof module !== "undefined"` guarded `module.exports` block so the same file works as a browser global script and a Node `require()`-able module.
- Person sprite: pixel-art block figure (rects for head/torso/legs), not emoji, not stick-figure lines.
- Ground obstacles only — no flying obstacles, no duck mechanic.
- No score beyond the jump counter, no speed ramp over time, no day/night cycle, no sound, no persistence across page reloads.
- `TOTAL_JUMPS_TO_WIN = 18`. Reaching it while alive (no prior collision) wins, even pre-empting the very next obstacle.
- Jump counter resets to 0 on every game-over or restart from the birthday screen.
- Birthday message text is exactly: `Happy Birthday, Emma!`
- Input: Space key OR mouse click OR touch tap — same action mapped to "jump" while playing, "restart" while on game-over/birthday screens. No double-jump (input while airborne is ignored).
- Requires Node.js 18+ (for the built-in test runner) to run the test suite during development. Not required to play the game.

---

### Task 1: Project scaffold + constants

**Files:**
- Create: `package.json`
- Create: `constants.js`
- Create: `index.html`
- Create: `style.css`
- Test: `tests/constants.test.js`

**Interfaces:**
- Produces (globals every later module/task relies on): `CANVAS_WIDTH=600`, `CANVAS_HEIGHT=150`, `GROUND_LINE_Y=130`, `PLAYER_WIDTH=20`, `PLAYER_HEIGHT=40`, `PLAYER_X=40`, `PLAYER_GROUND_Y=90`, `GRAVITY=0.6`, `JUMP_VELOCITY=-11`, `OBSTACLE_WIDTH=16`, `OBSTACLE_MIN_HEIGHT=20`, `OBSTACLE_MAX_HEIGHT=40`, `OBSTACLE_SPEED=4`, `OBSTACLE_MIN_GAP=90`, `OBSTACLE_MAX_GAP=220`, `TOTAL_JUMPS_TO_WIN=18`, `CONFETTI_COUNT=80`.

- [ ] **Step 1: Write the failing test**

Create `tests/constants.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/constants.test.js`
Expected: FAIL — `Cannot find module '../constants.js'`

- [ ] **Step 3: Create package.json**

```json
{
  "name": "emma-game",
  "private": true,
  "scripts": {
    "test": "node --test tests/"
  }
}
```

- [ ] **Step 4: Write constants.js**

```js
var CANVAS_WIDTH = 600;
var CANVAS_HEIGHT = 150;
var GROUND_LINE_Y = 130;
var PLAYER_WIDTH = 20;
var PLAYER_HEIGHT = 40;
var PLAYER_X = 40;
var PLAYER_GROUND_Y = GROUND_LINE_Y - PLAYER_HEIGHT;
var GRAVITY = 0.6;
var JUMP_VELOCITY = -11;
var OBSTACLE_WIDTH = 16;
var OBSTACLE_MIN_HEIGHT = 20;
var OBSTACLE_MAX_HEIGHT = 40;
var OBSTACLE_SPEED = 4;
var OBSTACLE_MIN_GAP = 90;
var OBSTACLE_MAX_GAP = 220;
var TOTAL_JUMPS_TO_WIN = 18;
var CONFETTI_COUNT = 80;

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    CANVAS_WIDTH: CANVAS_WIDTH,
    CANVAS_HEIGHT: CANVAS_HEIGHT,
    GROUND_LINE_Y: GROUND_LINE_Y,
    PLAYER_WIDTH: PLAYER_WIDTH,
    PLAYER_HEIGHT: PLAYER_HEIGHT,
    PLAYER_X: PLAYER_X,
    PLAYER_GROUND_Y: PLAYER_GROUND_Y,
    GRAVITY: GRAVITY,
    JUMP_VELOCITY: JUMP_VELOCITY,
    OBSTACLE_WIDTH: OBSTACLE_WIDTH,
    OBSTACLE_MIN_HEIGHT: OBSTACLE_MIN_HEIGHT,
    OBSTACLE_MAX_HEIGHT: OBSTACLE_MAX_HEIGHT,
    OBSTACLE_SPEED: OBSTACLE_SPEED,
    OBSTACLE_MIN_GAP: OBSTACLE_MIN_GAP,
    OBSTACLE_MAX_GAP: OBSTACLE_MAX_GAP,
    TOTAL_JUMPS_TO_WIN: TOTAL_JUMPS_TO_WIN,
    CONFETTI_COUNT: CONFETTI_COUNT,
  };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test tests/constants.test.js`
Expected: PASS (3 tests)

- [ ] **Step 6: Create style.css**

```css
html, body {
  height: 100%;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7f7f7;
  font-family: sans-serif;
}

#game-canvas {
  border: 1px solid #535353;
  background: #ffffff;
  image-rendering: pixelated;
}
```

- [ ] **Step 7: Create index.html (canvas only — game scripts added in later tasks)**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Pixel Runner — Birthday Edition</title>
    <link rel="stylesheet" href="style.css" />
  </head>
  <body>
    <canvas id="game-canvas" width="600" height="150"></canvas>
    <script src="constants.js"></script>
  </body>
</html>
```

- [ ] **Step 8: Manually verify the page loads**

Open `index.html` directly in a browser (double-click or drag into a tab).
Expected: a blank white bordered canvas, centered on a light gray page, no console errors.

- [ ] **Step 9: Commit**

```bash
git add package.json constants.js index.html style.css tests/constants.test.js
git commit -m "Add project scaffold and shared game constants"
```

---

### Task 2: Player jump physics

**Files:**
- Create: `physics.js`
- Test: `tests/physics.test.js`

**Interfaces:**
- Consumes: none (pure module, only takes primitives/plain objects as arguments).
- Produces: `stepPlayerPhysics(playerState, gravity, groundY) -> {y, velocityY, grounded}`, `startJump(playerState, jumpVelocity) -> {y, velocityY, grounded}`. `playerState` shape: `{y: number, velocityY: number, grounded: boolean}`.

- [ ] **Step 1: Write the failing tests**

Create `tests/physics.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/physics.test.js`
Expected: FAIL — `Cannot find module '../physics.js'`

- [ ] **Step 3: Write physics.js**

```js
function stepPlayerPhysics(playerState, gravity, groundY) {
  if (playerState.grounded) {
    return { y: groundY, velocityY: 0, grounded: true };
  }
  var newVelocityY = playerState.velocityY + gravity;
  var newY = playerState.y + newVelocityY;
  if (newY >= groundY) {
    return { y: groundY, velocityY: 0, grounded: true };
  }
  return { y: newY, velocityY: newVelocityY, grounded: false };
}

function startJump(playerState, jumpVelocity) {
  if (!playerState.grounded) {
    return playerState;
  }
  return { y: playerState.y, velocityY: jumpVelocity, grounded: false };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { stepPlayerPhysics: stepPlayerPhysics, startJump: startJump };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/physics.test.js`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add physics.js tests/physics.test.js
git commit -m "Add player jump physics module"
```

---

### Task 3: Collision detection

**Files:**
- Create: `collision.js`
- Test: `tests/collision.test.js`

**Interfaces:**
- Consumes: none.
- Produces: `isColliding(rectA, rectB) -> boolean`. Rect shape: `{x, y, width, height}`.

- [ ] **Step 1: Write the failing tests**

Create `tests/collision.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/collision.test.js`
Expected: FAIL — `Cannot find module '../collision.js'`

- [ ] **Step 3: Write collision.js**

```js
function isColliding(rectA, rectB) {
  return (
    rectA.x < rectB.x + rectB.width &&
    rectA.x + rectA.width > rectB.x &&
    rectA.y < rectB.y + rectB.height &&
    rectA.y + rectA.height > rectB.y
  );
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { isColliding: isColliding };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/collision.test.js`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add collision.js tests/collision.test.js
git commit -m "Add AABB collision detection module"
```

---

### Task 4: Game state (jump counter, win/lose transitions)

**Files:**
- Create: `gameState.js`
- Test: `tests/gameState.test.js`

**Interfaces:**
- Consumes: none.
- Produces: `GAME_STATUS = {PLAYING, GAME_OVER, WON}`, `createInitialGameState() -> {status, jumpCount}`, `registerJump(state, totalJumpsToWin) -> state`, `registerCollision(state) -> state`.

- [ ] **Step 1: Write the failing tests**

Create `tests/gameState.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/gameState.test.js`
Expected: FAIL — `Cannot find module '../gameState.js'`

- [ ] **Step 3: Write gameState.js**

```js
var GAME_STATUS = {
  PLAYING: "playing",
  GAME_OVER: "game_over",
  WON: "won",
};

function createInitialGameState() {
  return { status: GAME_STATUS.PLAYING, jumpCount: 0 };
}

function registerJump(state, totalJumpsToWin) {
  if (state.status !== GAME_STATUS.PLAYING) {
    return state;
  }
  var jumpCount = state.jumpCount + 1;
  if (jumpCount >= totalJumpsToWin) {
    return { status: GAME_STATUS.WON, jumpCount: jumpCount };
  }
  return { status: GAME_STATUS.PLAYING, jumpCount: jumpCount };
}

function registerCollision(state) {
  if (state.status !== GAME_STATUS.PLAYING) {
    return state;
  }
  return { status: GAME_STATUS.GAME_OVER, jumpCount: state.jumpCount };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    GAME_STATUS: GAME_STATUS,
    createInitialGameState: createInitialGameState,
    registerJump: registerJump,
    registerCollision: registerCollision,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/gameState.test.js`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add gameState.js tests/gameState.test.js
git commit -m "Add game state module for jump counter and win/lose transitions"
```

---

### Task 5: Obstacle spawning and movement

**Files:**
- Create: `obstacles.js`
- Test: `tests/obstacles.test.js`

**Interfaces:**
- Consumes: none.
- Produces: `createObstacle(canvasWidth, groundLineY, width, height) -> {x, y, width, height}`, `moveObstacles(obstacles, speed) -> obstacles`, `shouldSpawn(distanceSinceLastSpawn, nextSpawnThreshold) -> boolean`, `randomSpawnThreshold(rng, min, max) -> number`.

- [ ] **Step 1: Write the failing tests**

Create `tests/obstacles.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/obstacles.test.js`
Expected: FAIL — `Cannot find module '../obstacles.js'`

- [ ] **Step 3: Write obstacles.js**

```js
function createObstacle(canvasWidth, groundLineY, width, height) {
  return {
    x: canvasWidth,
    y: groundLineY - height,
    width: width,
    height: height,
  };
}

function moveObstacles(obstacles, speed) {
  return obstacles
    .map(function (obstacle) {
      return {
        x: obstacle.x - speed,
        y: obstacle.y,
        width: obstacle.width,
        height: obstacle.height,
      };
    })
    .filter(function (obstacle) {
      return obstacle.x + obstacle.width > 0;
    });
}

function shouldSpawn(distanceSinceLastSpawn, nextSpawnThreshold) {
  return distanceSinceLastSpawn >= nextSpawnThreshold;
}

function randomSpawnThreshold(rng, min, max) {
  return min + rng() * (max - min);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    createObstacle: createObstacle,
    moveObstacles: moveObstacles,
    shouldSpawn: shouldSpawn,
    randomSpawnThreshold: randomSpawnThreshold,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/obstacles.test.js`
Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add obstacles.js tests/obstacles.test.js
git commit -m "Add obstacle spawning and movement module"
```

---

### Task 6: Confetti particles

**Files:**
- Create: `confetti.js`
- Test: `tests/confetti.test.js`

**Interfaces:**
- Consumes: none.
- Produces: `CONFETTI_COLORS` (array of 5 hex strings), `createConfettiParticle(canvasWidth, rng) -> particle`, `updateConfettiParticle(particle) -> particle`, `createConfettiBurst(count, canvasWidth, rng) -> particle[]`. Particle shape: `{x, y, vx, vy, rotation, rotationSpeed, color}`.

- [ ] **Step 1: Write the failing tests**

Create `tests/confetti.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/confetti.test.js`
Expected: FAIL — `Cannot find module '../confetti.js'`

- [ ] **Step 3: Write confetti.js**

```js
var CONFETTI_COLORS = ["#e63946", "#f4a261", "#2a9d8f", "#457b9d", "#f1faee"];

function createConfettiParticle(canvasWidth, rng) {
  return {
    x: rng() * canvasWidth,
    y: -10,
    vx: (rng() - 0.5) * 2,
    vy: 1 + rng() * 2,
    rotation: rng() * 360,
    rotationSpeed: (rng() - 0.5) * 10,
    color: CONFETTI_COLORS[Math.floor(rng() * CONFETTI_COLORS.length)],
  };
}

function updateConfettiParticle(particle) {
  return {
    x: particle.x + particle.vx,
    y: particle.y + particle.vy,
    vx: particle.vx,
    vy: particle.vy,
    rotation: particle.rotation + particle.rotationSpeed,
    rotationSpeed: particle.rotationSpeed,
    color: particle.color,
  };
}

function createConfettiBurst(count, canvasWidth, rng) {
  var particles = [];
  for (var i = 0; i < count; i++) {
    particles.push(createConfettiParticle(canvasWidth, rng));
  }
  return particles;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    CONFETTI_COLORS: CONFETTI_COLORS,
    createConfettiParticle: createConfettiParticle,
    updateConfettiParticle: updateConfettiParticle,
    createConfettiBurst: createConfettiBurst,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/confetti.test.js`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add confetti.js tests/confetti.test.js
git commit -m "Add confetti particle module"
```

---

### Task 7: Core render loop — player, ground, obstacles, collision, game over

**Files:**
- Create: `game.js`
- Modify: `index.html:9` (add script tags for the modules this task depends on)

**Interfaces:**
- Consumes: `stepPlayerPhysics`, `startJump` (from `physics.js`); `isColliding` (from `collision.js`); `GAME_STATUS`, `createInitialGameState`, `registerJump`, `registerCollision` (from `gameState.js`); `createObstacle`, `moveObstacles`, `shouldSpawn`, `randomSpawnThreshold` (from `obstacles.js`); all constants from `constants.js`.
- Produces: nothing consumed by later tasks except the running game itself — Task 8 edits this same file to add the WON-state branch.

This task has no automated test — canvas rendering and `requestAnimationFrame` timing aren't meaningfully unit-testable. Verification is a manual browser playthrough instead.

- [ ] **Step 1: Add remaining script tags to index.html**

Replace the `<script src="constants.js"></script>` line in `index.html` with:

```html
    <script src="constants.js"></script>
    <script src="physics.js"></script>
    <script src="collision.js"></script>
    <script src="gameState.js"></script>
    <script src="obstacles.js"></script>
    <script src="game.js"></script>
```

- [ ] **Step 2: Write game.js**

```js
var canvas = document.getElementById("game-canvas");
var ctx = canvas.getContext("2d");

var frameCount = 0;
var player = { y: PLAYER_GROUND_Y, velocityY: 0, grounded: true };
var obstacles = [];
var distanceSinceLastSpawn = 0;
var nextSpawnThreshold = randomSpawnThreshold(Math.random, OBSTACLE_MIN_GAP, OBSTACLE_MAX_GAP);
var gameState = createInitialGameState();

function resetGame() {
  player = { y: PLAYER_GROUND_Y, velocityY: 0, grounded: true };
  obstacles = [];
  distanceSinceLastSpawn = 0;
  nextSpawnThreshold = randomSpawnThreshold(Math.random, OBSTACLE_MIN_GAP, OBSTACLE_MAX_GAP);
  gameState = createInitialGameState();
}

function handleInput() {
  if (gameState.status === GAME_STATUS.PLAYING) {
    if (player.grounded) {
      player = startJump(player, JUMP_VELOCITY);
      gameState = registerJump(gameState, TOTAL_JUMPS_TO_WIN);
    }
  } else {
    resetGame();
  }
}

function update() {
  if (gameState.status !== GAME_STATUS.PLAYING) {
    return;
  }

  player = stepPlayerPhysics(player, GRAVITY, PLAYER_GROUND_Y);

  obstacles = moveObstacles(obstacles, OBSTACLE_SPEED);
  distanceSinceLastSpawn += OBSTACLE_SPEED;
  if (shouldSpawn(distanceSinceLastSpawn, nextSpawnThreshold)) {
    var height = OBSTACLE_MIN_HEIGHT + Math.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT);
    obstacles.push(createObstacle(CANVAS_WIDTH, GROUND_LINE_Y, OBSTACLE_WIDTH, height));
    distanceSinceLastSpawn = 0;
    nextSpawnThreshold = randomSpawnThreshold(Math.random, OBSTACLE_MIN_GAP, OBSTACLE_MAX_GAP);
  }

  var playerRect = { x: PLAYER_X, y: player.y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT };
  for (var i = 0; i < obstacles.length; i++) {
    if (isColliding(playerRect, obstacles[i])) {
      gameState = registerCollision(gameState);
      break;
    }
  }
}

function drawPlayer() {
  var x = PLAYER_X;
  var y = player.y;
  ctx.fillStyle = "#333333";
  ctx.fillRect(x + 4, y, 12, 12);
  ctx.fillRect(x + 2, y + 12, 16, 16);

  if (player.grounded) {
    var legFrame = Math.floor(frameCount / 10) % 2;
    if (legFrame === 0) {
      ctx.fillRect(x + 2, y + 28, 6, 12);
      ctx.fillRect(x + 12, y + 28, 6, 8);
    } else {
      ctx.fillRect(x + 2, y + 28, 6, 8);
      ctx.fillRect(x + 12, y + 28, 6, 12);
    }
  } else {
    ctx.fillRect(x + 2, y + 28, 6, 10);
    ctx.fillRect(x + 12, y + 28, 6, 10);
  }
}

function drawGameOverOverlay() {
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.fillStyle = "#333333";
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
  ctx.font = "14px sans-serif";
  ctx.fillText(
    "Jumps landed: " + gameState.jumpCount + " — press space or click to retry",
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT / 2 + 14
  );
  ctx.textAlign = "left";
}

function render() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.strokeStyle = "#535353";
  ctx.beginPath();
  ctx.moveTo(0, GROUND_LINE_Y);
  ctx.lineTo(CANVAS_WIDTH, GROUND_LINE_Y);
  ctx.stroke();

  drawPlayer();

  ctx.fillStyle = "#535353";
  for (var i = 0; i < obstacles.length; i++) {
    var o = obstacles[i];
    ctx.fillRect(o.x, o.y, o.width, o.height);
  }

  ctx.font = "14px sans-serif";
  ctx.fillText("Jumps: " + gameState.jumpCount + " / " + TOTAL_JUMPS_TO_WIN, 10, 20);

  if (gameState.status === GAME_STATUS.GAME_OVER) {
    drawGameOverOverlay();
  }
}

function loop() {
  frameCount++;
  update();
  render();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", function (e) {
  if (e.code === "Space") {
    e.preventDefault();
    handleInput();
  }
});

canvas.addEventListener("mousedown", handleInput);
canvas.addEventListener("touchstart", function (e) {
  e.preventDefault();
  handleInput();
});

requestAnimationFrame(loop);
```

- [ ] **Step 3: Manually verify in a browser**

Open `index.html`. Expected:
- Pixel-block figure stands on the ground line with alternating leg animation.
- Space, click, and tap all make the figure jump.
- Obstacles spawn from the right at irregular intervals and scroll left.
- "Jumps: N / 18" counter increments on each jump.
- Colliding with an obstacle shows the "GAME OVER" overlay with the jump count reached.
- Pressing space or clicking on the game-over overlay resets the counter to 0 and clears obstacles.

- [ ] **Step 4: Commit**

```bash
git add game.js index.html
git commit -m "Add core render loop with player, obstacles, collision, and game over"
```

---

### Task 8: Birthday screen with confetti

**Files:**
- Modify: `game.js` (add confetti state, WON-state update branch, birthday overlay rendering)
- Modify: `index.html` (add `confetti.js` script tag)

**Interfaces:**
- Consumes: `createConfettiBurst`, `updateConfettiParticle` (from `confetti.js`, built in Task 6); `GAME_STATUS.WON` (from `gameState.js`, built in Task 4); `CONFETTI_COUNT` (from `constants.js`).

No automated test — same reasoning as Task 7 (canvas rendering, manual verification).

- [ ] **Step 1: Add confetti.js script tag to index.html**

In `index.html`, insert `<script src="confetti.js"></script>` immediately before `<script src="game.js"></script>`.

- [ ] **Step 2: Add confetti state to game.js**

At the top of `game.js`, alongside the other `var` state declarations, add:

```js
var confetti = [];
```

- [ ] **Step 3: Extend resetGame() to clear confetti**

In `game.js`, change `resetGame` to also reset confetti:

```js
function resetGame() {
  player = { y: PLAYER_GROUND_Y, velocityY: 0, grounded: true };
  obstacles = [];
  distanceSinceLastSpawn = 0;
  nextSpawnThreshold = randomSpawnThreshold(Math.random, OBSTACLE_MIN_GAP, OBSTACLE_MAX_GAP);
  confetti = [];
  gameState = createInitialGameState();
}
```

- [ ] **Step 4: Extend update() with a WON-state branch**

In `game.js`, change the top of `update()` from an early-return guard to a status switch:

```js
function update() {
  if (gameState.status === GAME_STATUS.WON) {
    confetti = confetti.map(updateConfettiParticle).filter(function (p) {
      return p.y < CANVAS_HEIGHT + 20;
    });
    if (confetti.length === 0) {
      confetti = createConfettiBurst(CONFETTI_COUNT, CANVAS_WIDTH, Math.random);
    }
    return;
  }

  if (gameState.status !== GAME_STATUS.PLAYING) {
    return;
  }

  player = stepPlayerPhysics(player, GRAVITY, PLAYER_GROUND_Y);

  obstacles = moveObstacles(obstacles, OBSTACLE_SPEED);
  distanceSinceLastSpawn += OBSTACLE_SPEED;
  if (shouldSpawn(distanceSinceLastSpawn, nextSpawnThreshold)) {
    var height = OBSTACLE_MIN_HEIGHT + Math.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT);
    obstacles.push(createObstacle(CANVAS_WIDTH, GROUND_LINE_Y, OBSTACLE_WIDTH, height));
    distanceSinceLastSpawn = 0;
    nextSpawnThreshold = randomSpawnThreshold(Math.random, OBSTACLE_MIN_GAP, OBSTACLE_MAX_GAP);
  }

  var playerRect = { x: PLAYER_X, y: player.y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT };
  for (var i = 0; i < obstacles.length; i++) {
    if (isColliding(playerRect, obstacles[i])) {
      gameState = registerCollision(gameState);
      break;
    }
  }
}
```

- [ ] **Step 5: Add drawBirthdayOverlay() to game.js**

Add this function next to `drawGameOverOverlay`:

```js
function drawBirthdayOverlay() {
  ctx.fillStyle = "#fff8e7";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  for (var i = 0; i < confetti.length; i++) {
    var p = confetti[i];
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.fillStyle = p.color;
    ctx.fillRect(-3, -3, 6, 6);
    ctx.restore();
  }

  ctx.fillStyle = "#e63946";
  ctx.font = "bold 22px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Happy Birthday, Emma!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  ctx.font = "13px sans-serif";
  ctx.fillStyle = "#333333";
  ctx.fillText("press space or click to play again", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
  ctx.textAlign = "left";
}
```

- [ ] **Step 6: Call drawBirthdayOverlay() from render()**

In `game.js`, change the overlay branch at the end of `render()`:

```js
  if (gameState.status === GAME_STATUS.GAME_OVER) {
    drawGameOverOverlay();
  } else if (gameState.status === GAME_STATUS.WON) {
    drawBirthdayOverlay();
  }
```

- [ ] **Step 7: Manually verify the full game in a browser**

Open `index.html`. Play through to 18 successful jumps without hitting an obstacle. Expected:
- On the 18th successful jump, the game freezes (obstacles stop spawning/moving) and the screen switches to a cream background with falling colored confetti squares and "Happy Birthday, Emma!" text.
- Pressing space or clicking on the birthday screen resets the jump counter to 0 and returns to normal play.
- Separately, verify hitting an obstacle before 18 jumps still shows the "GAME OVER" overlay (Task 7 behavior unchanged).

- [ ] **Step 8: Commit**

```bash
git add game.js index.html
git commit -m "Add birthday screen with confetti on reaching 18 jumps"
```
