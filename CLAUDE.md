# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Pixel Runner — Birthday Edition": a browser recreation of the Chrome dino game,
reskinned as a motorbike rider jumping candle obstacles, built as a birthday gift
for Emma. No build step, no npm dependencies, no bundler — plain HTML/CSS/JS
loaded via `<script>` tags in `index.html`, in dependency order. The game has a
win condition (clear 18 jumps without colliding) that shows a confetti "Happy
Birthday, Emma!" screen, rather than endless survival.

Design specs and plans live in `docs/superpowers/specs/` and `docs/superpowers/plans/`
— read these for the intended behavior/scope before changing game mechanics.

## Commands

- `npm test` — runs `node --test tests/` (Node's built-in test runner, no framework).
- `npm start` — runs `node scripts/serve.js`, a zero-dependency static file server on
  `PORT` (default 9080).
- `npm run build` — no-op; this is a static site, just open `index.html` or run `npm start`.
- Run a single test file: `node --test tests/physics.test.js`.
- Docker: `Dockerfile` copies the same file set into `node:20-alpine` and runs
  `scripts/serve.js` on port 9080.

## Architecture

Every source file is loaded globally via `<script>` tags (no ES modules, no
bundler) but also does `module.exports` when `typeof module !== "undefined"`, so
the exact same file works both in the browser (as a global) and under
`node --test` (as a CommonJS require). When adding a new file, follow this
dual-export pattern and add both a `<script>` tag in `index.html` and a
`tests/<name>.test.js`.

Load order in `index.html` matters (later files depend on earlier globals):
`config.js` → `constants.js` → `physics.js` → `collision.js` → `gameState.js` →
`obstacles.js` → `confetti.js` → `game.js`.

Responsibilities per file:
- `config.js` — external link config (e.g. `BIRTHDAY_LINK_URL`), kept separate
  from `constants.js` so it can be edited without touching gameplay tuning.
- `constants.js` — all tunable numbers/colors (canvas size, player/obstacle
  dimensions, gravity, speed tiers, jump target, colors). Prefer adding a
  constant here over hardcoding a literal in `game.js`.
- `physics.js` — pure functions for player jump/gravity (`stepPlayerPhysics`,
  `startJump`). Takes/returns plain state objects, no DOM/canvas access.
- `collision.js` — pure AABB rect-intersection check (`isColliding`).
- `gameState.js` — pure state-machine transitions for overall game status
  (`GAME_STATUS.PLAYING/GAME_OVER/WON`), jump counter, win/lose transitions.
- `obstacles.js` — pure functions for spawning/moving candle obstacles and
  scroll speed (`createObstacle`, `moveObstacles`, `shouldSpawn`,
  `randomSpawnThreshold`, `scrollSpeed`). Takes an RNG function as a parameter
  (not `Math.random()` directly) so spawn logic is testable/deterministic.
- `confetti.js` — pure functions for the win-screen confetti particle system,
  same RNG-injection pattern as `obstacles.js`.
- `game.js` — the only file with DOM/canvas/audio side effects: owns
  `requestAnimationFrame` loop, canvas drawing (player/candles/HUD/overlays),
  input handling (space/click/touch), and wires the pure modules above
  together each frame in `update()`/`render()`.

This pure-logic-vs-side-effects split is the key architectural rule: physics,
collision, obstacle movement, and state transitions are all pure functions
unit-tested in isolation in `tests/`; `game.js` is the untested imperative
shell that reads input, calls the pure functions, and draws the result. When
changing gameplay behavior, prefer modifying the pure function and its test
over adding logic directly in `game.js`.

Cosmetic-only systems are explicitly decoupled from real game state — e.g. the
km/h speedometer (`SPEED_KMH_TIERS`, `displayKmhFor` in `game.js`) is flavor
text and not tied to the actual obstacle scroll speed (`scrollSpeed` in
`obstacles.js`); don't conflate the two when tuning difficulty.
