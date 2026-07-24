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
