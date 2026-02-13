# =============================================================
#  Real-time – Node.js + Socket.io + Redis
# =============================================================
FROM node:20-alpine AS base

WORKDIR /app

# ---- Production --------------------------------------------
FROM base AS production

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 3000
CMD ["node", "index.js"]

# ---- Development --------------------------------------------
FROM base AS development

# nodemon for hot-reload in dev
RUN npm install -g nodemon

EXPOSE 3000
CMD ["nodemon", "index.js"]
