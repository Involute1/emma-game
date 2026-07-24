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
