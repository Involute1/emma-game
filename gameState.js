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
