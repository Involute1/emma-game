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
