FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production

COPY package.json ./
RUN npm install --omit=dev

COPY index.js ./

EXPOSE 8088

CMD ["npm", "start"]
