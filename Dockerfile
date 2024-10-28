FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/static ./src/static
COPY src/server.js ./src/
COPY src/modules ./src/modules

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
