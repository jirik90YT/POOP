FROM node:18-alpine
WORKDIR /app

COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

RUN npm --prefix server i && npm --prefix client i

COPY client ./client
RUN npm --prefix client run build

COPY server ./server
COPY .replit replit.nix README-replit.md ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["node", "server/server.js"]
