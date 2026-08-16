# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests and install dependencies
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm ci

# Copy Prisma schema and generate client
COPY src/prisma ./src/prisma
RUN npx prisma generate --schema=./src/prisma/schema.prisma

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine AS runner

WORKDIR /app

# Set node environment
ENV NODE_ENV=production

# Copy built dist, node_modules, package manifests, and prisma
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/prisma ./src/prisma

# Expose backend port
EXPOSE 4000

# Start server
CMD ["node", "dist/server.js"]
