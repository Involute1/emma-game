# Pixel Runner — Birthday Edition — Design Spec

Date: 2026-07-24

## Summary

Browser recreation of the Chrome dino jumping game, reskinned with a
pixel-art person sprite. Instead of endless survival, the game has a win
condition: land 18 jumps in a single life without hitting an obstacle, and
a "Happy Birthday, Emma!" screen appears.

## Files

- `index.html` — canvas element, script/style includes, no build step, no dependencies.
- `style.css` — canvas sizing/centering, basic page styling.
- `game.js` — all game logic.

## Rendering

- Single `<canvas>`, fixed logical resolution (e.g. 600x150), scaled via CSS.
- Game loop driven by `requestAnimationFrame`.
- Everything drawn with canvas 2D rect/path primitives — no image assets.

## Entities

### Player

- Pixel-block figure: rects for head, torso, legs.
- Fixed x position near left side of canvas; y position animated for jump.
- Jump physics: on jump input while grounded, apply upward velocity; gravity
  accelerates it back down each frame until it lands on the ground line.
- While grounded and not jumping: 2-frame alternating leg animation to
  simulate running.
- While airborne: static pose (no leg animation).

### Ground

- Horizontal line (or dashed scrolling ground) at fixed y, scrolls left each
  frame to sell motion, independent of obstacle logic.

### Obstacles

- Pixel-block rects, single ground-level type only (no flying obstacles, no
  duck mechanic).
- Spawn at right edge of canvas at randomized time/distance intervals.
- Move left each frame at a constant speed (no speed ramp over time).
- Despawn (removed from active list) once fully off the left edge.

## Collision

- Axis-aligned bounding box (AABB) check between player rect and each active
  obstacle rect, every frame.
- On collision: transition to game-over state immediately.

## Jump Counter

- Increments by 1 each time the player successfully jumps (input registered
  while grounded), regardless of whether that jump clears an obstacle.
- Displayed on screen at all times during play, e.g. `Jumps: N / 18`.
- Resets to 0 whenever a new life starts (after game-over or after the
  birthday screen, if the player chooses to replay).

## Win Condition

- If the jump counter reaches 18 while still alive (no collision has
  occurred), the game freezes and transitions to the birthday screen instead
  of continuing to spawn/scroll.
- Reaching 18 takes priority — if the 18th jump lands successfully before
  any collision, the birthday screen triggers even if the player would have
  hit the very next obstacle.

## Screens

### Playing (default state)

- Canvas shows player, ground, obstacles, jump counter.

### Game Over

- Triggered by collision before reaching 18 jumps.
- Shows "GAME OVER" text and the jump count reached at time of death.
- Input (space or click) resets: jump counter → 0, obstacles cleared,
  player back to ground y, state → Playing.

### Birthday Screen

- Triggered when jump counter reaches 18 without a prior collision.
- Shows "Happy Birthday, Emma!" banner text.
- Simple canvas confetti animation: falling colored squares with basic
  fall/rotation physics, looping while the screen is shown.
- Input (space or click) resets back to Playing state (jump counter → 0,
  obstacles cleared) for optional replay.

## Input

- Both Space key and mouse click / touch tap are accepted, mapped to the
  same "jump" action during Playing, and the same "restart" action during
  Game Over / Birthday screens.
- Jump only registers when the player is grounded (no double-jump).

## Explicitly Out of Scope

- No score display beyond the jump counter.
- No difficulty/speed ramp over time.
- No day/night background cycle.
- No duck mechanic or flying obstacles.
- No sound.
- No persistence (jump counter and game state are in-memory only, reset on
  page reload).

## Open Questions

None — all decisions confirmed with user during brainstorming.
