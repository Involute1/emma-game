# Motorbike Player + Birthday-Candle Obstacles — Design

Date: 2026-07-27
Status: Approved (visual redesign of existing pixel runner game)

## Goal

Replace the pixel human runner with a pixel motorbike (with a small rider), and
render the rectangular obstacles as birthday candles. Gameplay, physics,
spawning, scoring, and the win/lose flow stay the same.

## Player: motorbike

- `drawPlayer()` in `game.js` draws a side-view pixel motorbike instead of the
  human: two wheels, body/seat, handlebar, and a small rider so it reads
  clearly at game scale.
- Hitbox resized to fit a bike shape: `PLAYER_WIDTH` 40 → 72,
  `PLAYER_HEIGHT` 80 → 48 in `constants.js`. `PLAYER_GROUND_Y` derives from
  these automatically. The shorter hitbox makes the game marginally more
  forgiving, never harder.
- **Grounded animation:** wheels spin (rotating spoke marks driven by
  `frameCount`), replacing the old leg-swap animation.
- **Jump animation (wheelie):** while airborne the bike tilts back around the
  rear wheel so the front wheel lifts — a wheelie. Implemented as a canvas
  rotation around the rear-axle point; rotation is visual only, the collision
  rect is unchanged.

## Obstacles: birthday candles

- Spawn/movement/collision logic in `obstacles.js` and the hitbox rectangles
  are untouched.
- The obstacle drawing in `render()` draws each rect as a birthday candle:
  - Wax body in the obstacle's existing per-spawn color, with lighter stripes
    and a drip along the top edge of the wax.
  - Wick and a flickering yellow/orange flame at the top, animated with
    `frameCount`.
  - The flame is drawn inside the top of the existing rect so difficulty and
    collision behavior don't change.

## Out of scope / unchanged

- Physics (`physics.js`), collision (`collision.js`), game state, confetti,
  sounds, spawn constants, `TOTAL_JUMPS_TO_WIN`.
- Existing unit tests keep passing; rendering changes are canvas-only.
