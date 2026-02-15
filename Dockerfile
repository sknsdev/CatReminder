FROM node:22-alpine

WORKDIR /app

# Устанавливаем зависимости для сборки нативных модулей (better-sqlite3)
RUN apk add --no-cache python3 make g++

# Копируем package.json и package-lock.json
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm install --production

# Удаляем инструменты сборки после установки зависимостей для уменьшения размера образа
# Оставляем python3, так как он может понадобиться в рантайме, но обычно достаточно удалить build-base
# Однако better-sqlite3 уже скомпилирован, поэтому удаляем все лишнее
RUN apk del make g++

# Копируем остальные файлы
COPY . .

# Указываем команду запуска
CMD ["node", "index.js"]
