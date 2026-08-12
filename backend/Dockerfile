# ============= СТАДИЯ 1: ОСНОВА =============
FROM node:18-alpine AS base
WORKDIR /app

# Копируем зависимости
COPY package*.json ./

# Устанавливаем зависимости
# Для разработки используем npm install (создаст package-lock.json если нет)
RUN npm install

# ============= СТАДИЯ 2: РАЗРАБОТКА =============
FROM base AS development
# Копируем исходники
COPY src ./src
EXPOSE 5000

# Для разработки с nodemon (если нужно)
# RUN npm install -g nodemon
# CMD ["nodemon", "src/index.js"]

CMD ["node", "src/index.js"]

# ============= СТАДИЯ 3: ПРОДАКШЕН =============
FROM base AS production
COPY src ./src
EXPOSE 5000
CMD ["node", "src/index.js"]