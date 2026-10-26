FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate --schema prisma/schema.prisma

EXPOSE 3001
CMD ["node", "server.js"]
