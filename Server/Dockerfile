FROM node:20-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --production

COPY src ./src
COPY plugin ./plugin

RUN mkdir -p /app/data

EXPOSE 3000

CMD ["node", "src/index.js"]
