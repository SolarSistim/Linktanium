# Stage 1: Build Angular Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: Build Node.js Backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

# Install build tools AND libsqlite3 development headers
RUN apk add --no-cache --virtual .build-deps python3 make g++ sqlite-dev

COPY backend/package.json backend/package-lock.json ./
RUN npm ci --unsafe-perm --verbose
RUN node -p "require('sqlite3')"
COPY backend/ .

# Clean up build dependencies
RUN apk del .build-deps

# Stage 3: Final Image
FROM node:20-alpine
WORKDIR /app

# Install runtime + build tools (temporarily)
RUN apk add --no-cache sqlite-libs python3 make g++ py3-setuptools

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist/frontend /app/frontend

# Copy backend, including node_modules
COPY --from=backend-builder /app/backend /app/backend

# Rebuild sqlite3 bindings correctly using environment variable
WORKDIR /app/backend
RUN PYTHON=/usr/bin/python3 npm rebuild sqlite3 --build-from-source

# Clean up build tools
RUN apk del python3 make g++

# Optional: Verify sqlite3 works
RUN node -p "require('sqlite3')"

# Create asset/data directories
RUN mkdir -p /app/data \
    && mkdir -p /app/frontend/assets

# Expose port and environment variables
EXPOSE 3504
ENV NODE_ENV=production
ENV PORT=3504
ENV BRANDING_PATH=/app/frontend/assets/branding
ENV BACKGROUND_PATH=/app/frontend/assets/theme/background
ENV ICON_PATH=/app/frontend/assets/icons

# Start backend
CMD ["/bin/sh", "-c", "cd backend && npm run start:prod"]



