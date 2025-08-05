# Stage 1: Build the application
FROM node:18-alpine AS buildProd

WORKDIR /app

COPY package*.json ./

# Cài đặt dependencies
RUN npm install --force

COPY . .

# Build ứng dụng
RUN npm run build

# Stage 2: Create production image
FROM node:18-alpine AS production

ENV NEW_RELIC_NO_CONFIG_FILE=true
ENV NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true
ENV NEW_RELIC_LOG=stdout

RUN npm install -g pm2

# Tạo user và group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Sao chép từ giai đoạn build
COPY --from=buildProd /app/package*.json ./
COPY --from=buildProd /app/node_modules ./node_modules
COPY --from=buildProd /app/dist ./dist
COPY --from=buildProd --chown=appuser:appgroup /app .

COPY .env .env

USER appuser

# Chạy ứng dụng với pm2
CMD ["pm2-runtime", "dist/main.js"]
