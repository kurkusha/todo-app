# ============= СТАДИЯ 1: ОСНОВА =============
FROM node:18-alpine AS base
WORKDIR /app

# Копируем зависимости
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# ============= СТАДИЯ 2: РАЗРАБОТКА =============
FROM base AS development
# Копируем весь код
COPY . .
EXPOSE 3000

# Включаем polling для HMR в Docker
ENV CHOKIDAR_USEPOLLING=true

CMD ["npm", "run", "dev"]

# ============= СТАДИЯ 3: СБОРЩИК =============
FROM base AS builder
COPY . .
RUN npm run build

# ============= СТАДИЯ 4: ПРОДАКШЕН =============
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
# Если есть nginx.conf, раскомментируйте:
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80