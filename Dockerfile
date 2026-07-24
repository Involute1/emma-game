FROM node:20-alpine

WORKDIR /app

COPY config.js constants.js physics.js collision.js gameState.js obstacles.js confetti.js game.js index.html style.css package.json ./
COPY scripts ./scripts
COPY sounds ./sounds

ENV PORT=9080
EXPOSE 9080

CMD ["node", "scripts/serve.js"]
