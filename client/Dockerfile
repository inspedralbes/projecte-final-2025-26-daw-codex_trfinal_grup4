# =============================================================
#  Frontend – React + Vite  (Multi-stage build)
# =============================================================

# ---- Stage 1: Dependencies & Build -------------------------
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first (better cache)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build static assets for production
RUN npm run build

# ---- Stage 2: Production – serve via Nginx volume ----------
#  In production the compiled /app/dist is copied out via
#  a shared volume or directly into the Nginx image.
#  This stage simply keeps the build artefacts available.
FROM node:20-alpine AS production

WORKDIR /app
COPY --from=build /app/dist /app/dist

# No CMD needed – Nginx serves the static files.
# This stage exists so docker-compose can copy from it.
CMD ["echo", "Build complete. Static files in /app/dist"]

# ---- Stage 3: Development – Vite dev server -----------------
FROM node:20-alpine AS development

WORKDIR /app

# Dependencies will be installed via volume mount + init script
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
