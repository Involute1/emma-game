var canvas = document.getElementById("game-canvas");
var ctx = canvas.getContext("2d");
var birthdayOverlay = document.getElementById("birthday-overlay");
var birthdayCanvas = document.getElementById("birthday-canvas");
var birthdayCtx = birthdayCanvas.getContext("2d");
var birthdayLinkButton = document.getElementById("birthday-link-button");

birthdayLinkButton.href = BIRTHDAY_LINK_URL;
birthdayLinkButton.addEventListener("mousedown", function (e) {
  e.stopPropagation();
});
birthdayLinkButton.addEventListener("touchstart", function (e) {
  e.stopPropagation();
});
birthdayLinkButton.addEventListener("keydown", function (e) {
  if (e.code === "Space") {
    e.stopPropagation();
  }
});

var canvasWidth = 0;

function resizeCanvas() {
  canvasWidth = window.innerWidth;
  canvas.width = canvasWidth;
  canvas.height = CANVAS_HEIGHT;
  birthdayCanvas.width = window.innerWidth;
  birthdayCanvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

var frameCount = 0;
var player = { y: PLAYER_GROUND_Y, velocityY: 0, grounded: true };
var obstacles = [];
var distanceSinceLastSpawn = 0;
var nextSpawnThreshold = randomSpawnThreshold(Math.random, OBSTACLE_MIN_GAP, OBSTACLE_MAX_GAP);
var confetti = [];
var gameState = createInitialGameState();
var jumpAudio = new Audio("sounds/jump.wav");

function playJumpSound() {
  jumpAudio.currentTime = 0;
  jumpAudio.play().catch(function () {});
}

function resetGame() {
  player = { y: PLAYER_GROUND_Y, velocityY: 0, grounded: true };
  obstacles = [];
  distanceSinceLastSpawn = 0;
  nextSpawnThreshold = randomSpawnThreshold(Math.random, OBSTACLE_MIN_GAP, OBSTACLE_MAX_GAP);
  confetti = [];
  gameState = createInitialGameState();
}

function handleInput() {
  if (gameState.status === GAME_STATUS.PLAYING) {
    if (player.grounded) {
      player = startJump(player, JUMP_VELOCITY);
      playJumpSound();
    }
  } else {
    resetGame();
  }
}

function update() {
  if (gameState.status === GAME_STATUS.WON) {
    confetti = confetti.map(updateConfettiParticle).filter(function (p) {
      return p.y < birthdayCanvas.height + 20;
    });
    if (confetti.length === 0) {
      confetti = createConfettiBurst(CONFETTI_COUNT, birthdayCanvas.width, Math.random);
    }
    return;
  }

  if (gameState.status !== GAME_STATUS.PLAYING) {
    return;
  }

  var gravity = player.velocityY >= 0 ? FALL_GRAVITY : GRAVITY;
  player = stepPlayerPhysics(player, gravity, PLAYER_GROUND_Y);

  obstacles = moveObstacles(obstacles, OBSTACLE_SPEED);
  distanceSinceLastSpawn += OBSTACLE_SPEED;
  if (shouldSpawn(distanceSinceLastSpawn, nextSpawnThreshold)) {
    var height = OBSTACLE_MIN_HEIGHT + Math.random() * (OBSTACLE_MAX_HEIGHT - OBSTACLE_MIN_HEIGHT);
    var obstacle = createObstacle(canvasWidth, GROUND_LINE_Y, OBSTACLE_WIDTH, height);
    obstacle.color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    obstacle.cleared = false;
    obstacles.push(obstacle);
    distanceSinceLastSpawn = 0;
    nextSpawnThreshold = randomSpawnThreshold(Math.random, OBSTACLE_MIN_GAP, OBSTACLE_MAX_GAP);
  }

  var playerRect = { x: PLAYER_X, y: player.y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT };
  for (var i = 0; i < obstacles.length; i++) {
    var o = obstacles[i];
    if (!o.cleared && o.x + o.width < PLAYER_X) {
      o.cleared = true;
      gameState = registerJump(gameState, TOTAL_JUMPS_TO_WIN);
    }
    if (isColliding(playerRect, o)) {
      gameState = registerCollision(gameState);
      break;
    }
  }
}

function drawWheel(cx, cy, radius, spinAngle) {
  ctx.fillStyle = "#333333";
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#9a9a9a";
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#333333";
  ctx.beginPath();
  for (var i = 0; i < 3; i++) {
    var a = spinAngle + (i * Math.PI) / 3;
    ctx.moveTo(cx - Math.cos(a) * (radius - 4), cy - Math.sin(a) * (radius - 4));
    ctx.lineTo(cx + Math.cos(a) * (radius - 4), cy + Math.sin(a) * (radius - 4));
  }
  ctx.stroke();
  ctx.fillStyle = "#333333";
  ctx.beginPath();
  ctx.arc(cx, cy, 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlayer() {
  var x = PLAYER_X;
  var y = player.y;
  var wheelRadius = 11;
  var axleY = y + PLAYER_HEIGHT - wheelRadius;
  var rearAxleX = x + 13;
  var frontAxleX = x + PLAYER_WIDTH - 13;
  var spin = player.grounded ? frameCount * 0.3 : 0;

  ctx.save();
  if (!player.grounded) {
    // Wheelie: tilt back around the rear axle so the front wheel lifts.
    var tilt = player.velocityY < 0 ? -0.45 : -0.25;
    ctx.translate(rearAxleX, axleY);
    ctx.rotate(tilt);
    ctx.translate(-rearAxleX, -axleY);
  }

  drawWheel(rearAxleX, axleY, wheelRadius, spin);
  drawWheel(frontAxleX, axleY, wheelRadius, spin);

  // Frame, seat and tank
  ctx.fillStyle = PLAYER_BODY_COLOR;
  ctx.fillRect(x + 8, y + 26, PLAYER_WIDTH - 16, 8);
  ctx.fillRect(x + 30, y + 20, 16, 6);
  ctx.fillStyle = PLAYER_LEG_COLOR;
  ctx.fillRect(x + 12, y + 21, 14, 5);

  // Handlebar
  ctx.fillStyle = "#333333";
  ctx.fillRect(x + 52, y + 12, 4, 14);
  ctx.fillRect(x + 48, y + 12, 10, 3);

  // Rider: leg, torso, arm, head with helmet
  ctx.fillStyle = PLAYER_LEG_COLOR;
  ctx.fillRect(x + 20, y + 18, 6, 12);
  ctx.fillRect(x + 20, y + 4, 10, 17);
  ctx.fillRect(x + 28, y + 9, 22, 4);
  ctx.fillStyle = "#e76f51";
  ctx.fillRect(x + 21, y - 5, 11, 10);

  ctx.restore();
}

function drawCandle(o) {
  var cx = o.x + o.width / 2;
  var waxTop = o.y + 18;

  // Wax body in the obstacle's spawn color
  ctx.fillStyle = o.color;
  ctx.fillRect(o.x, waxTop, o.width, o.y + o.height - waxTop);

  // Molten cap and drips
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillRect(o.x, waxTop, o.width, 4);
  ctx.fillRect(o.x + 4, waxTop + 4, 5, 7);
  ctx.fillRect(cx - 2, waxTop + 4, 5, 5);
  ctx.fillRect(o.x + o.width - 9, waxTop + 4, 5, 9);

  // Stripes
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  for (var sy = waxTop + 16; sy < o.y + o.height - 4; sy += 16) {
    ctx.fillRect(o.x, sy, o.width, 6);
  }

  // Wick
  ctx.fillStyle = "#5a4632";
  ctx.fillRect(cx - 1, o.y + 13, 2, 5);

  // Flickering flame (kept inside the top of the hitbox)
  var flicker = Math.sin(frameCount * 0.35 + o.x * 0.05);
  ctx.fillStyle = "#ff9f1c";
  ctx.beginPath();
  ctx.ellipse(cx + flicker, o.y + 7, 4.5, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffe066";
  ctx.beginPath();
  ctx.ellipse(cx + flicker, o.y + 9, 2, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawGameOverOverlay() {
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fillRect(0, 0, canvasWidth, CANVAS_HEIGHT);
  ctx.fillStyle = "#333333";
  ctx.font = "bold 20px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", canvasWidth / 2, CANVAS_HEIGHT / 2 - 10);
  ctx.font = "14px sans-serif";
  ctx.fillText(
    "Obstacles cleared: " + gameState.jumpCount + " — press space or click to retry",
    canvasWidth / 2,
    CANVAS_HEIGHT / 2 + 14
  );
  ctx.textAlign = "left";
}

function drawBirthdayConfetti() {
  birthdayCtx.clearRect(0, 0, birthdayCanvas.width, birthdayCanvas.height);
  for (var i = 0; i < confetti.length; i++) {
    var p = confetti[i];
    birthdayCtx.save();
    birthdayCtx.translate(p.x, p.y);
    birthdayCtx.rotate((p.rotation * Math.PI) / 180);
    birthdayCtx.fillStyle = p.color;
    birthdayCtx.fillRect(-3, -3, 6, 6);
    birthdayCtx.restore();
  }
}

function render() {
  var sky = ctx.createLinearGradient(0, 0, 0, GROUND_LINE_Y);
  sky.addColorStop(0, SKY_COLOR_TOP);
  sky.addColorStop(1, SKY_COLOR_BOTTOM);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvasWidth, GROUND_LINE_Y);

  ctx.fillStyle = GROUND_COLOR;
  ctx.fillRect(0, GROUND_LINE_Y, canvasWidth, CANVAS_HEIGHT - GROUND_LINE_Y);

  ctx.strokeStyle = GROUND_EDGE_COLOR;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_LINE_Y);
  ctx.lineTo(canvasWidth, GROUND_LINE_Y);
  ctx.stroke();

  drawPlayer();

  for (var i = 0; i < obstacles.length; i++) {
    drawCandle(obstacles[i]);
  }

  ctx.fillStyle = "#333333";
  ctx.font = "14px sans-serif";
  ctx.fillText("Cleared: " + gameState.jumpCount + " / " + TOTAL_JUMPS_TO_WIN, 10, 20);

  if (gameState.status === GAME_STATUS.GAME_OVER) {
    drawGameOverOverlay();
  }
}

function loop() {
  frameCount++;
  update();
  render();

  if (gameState.status === GAME_STATUS.WON) {
    birthdayOverlay.classList.add("visible");
    drawBirthdayConfetti();
  } else {
    birthdayOverlay.classList.remove("visible");
  }

  requestAnimationFrame(loop);
}

window.addEventListener("keydown", function (e) {
  if (e.code === "Space") {
    e.preventDefault();
    handleInput();
  }
});

window.addEventListener("mousedown", handleInput);
window.addEventListener("touchstart", function (e) {
  e.preventDefault();
  handleInput();
});

requestAnimationFrame(loop);
