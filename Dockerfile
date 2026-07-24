FROM node:20-alpine

WORKDIR /app

COPY constants.js physics.js collision.js gameState.js obstacles.js confetti.js game.js index.html style.css package.json ./
COPY scripts ./scripts

ENV PORT=8080
EXPOSE 8080

CMD ["node", "scripts/serve.js"]
