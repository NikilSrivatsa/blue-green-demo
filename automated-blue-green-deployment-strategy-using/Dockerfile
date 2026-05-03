FROM node:20-alpine

WORKDIR /app

COPY app/package*.json ./
RUN npm ci --omit=dev

COPY app/ ./

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
