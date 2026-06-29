# Imagen para desplegar CubaRemesas en cualquier hosting de contenedores
# (Railway, Fly.io, Render con Docker, etc.). Sirve cliente + API en un puerto.
FROM node:22-bookworm-slim AS build
WORKDIR /app

# Herramientas por si better-sqlite3 necesita compilarse (si no, usa el prebuilt).
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

# Instala dependencias primero (mejor caché de capas).
COPY package*.json ./
COPY server/package.json server/
COPY client/package.json client/
RUN npm install

# Copia el código y compila cliente + servidor.
COPY . .
RUN npm run build

ENV NODE_ENV=production
# El hosting suele inyectar PORT; si no, cae a 4000 (ver server/src/config.ts).
EXPOSE 4000
CMD ["npm", "start"]
