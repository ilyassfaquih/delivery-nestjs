# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
# Install ALL dependencies (including devDependencies like @nestjs/cli)
RUN npm ci

COPY . .

# Build the application
RUN npm run build

# Production Stage
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# Install only production dependencies
RUN npm ci --only=production

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
