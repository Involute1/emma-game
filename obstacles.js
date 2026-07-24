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
