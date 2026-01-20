# Use official Ruby image
FROM ruby:3.2.0-alpine

# Install system dependencies
RUN apk add --no-cache \
    build-base \
    mysql-dev \
    mysql-client \
    redis \
    nodejs \
    npm \
    tzdata \
    curl \
    pkgconfig \
    libffi-dev \
    gcc \
    musl-dev

# Set working directory
WORKDIR /app

# Copy Gemfile and Gemfile.lock (if exists)
COPY backend/Gemfile.simple ./Gemfile
COPY backend/Gemfile.lock* ./

# Install Ruby dependencies
RUN bundle config set --local without 'development test' && \
    bundle install --jobs 4 --retry 3

# Copy the rest of the application
COPY backend/ .

# Build frontend (for Railway deployment)
# Copy frontend source files
COPY frontend/package*.json ./frontend-build/
COPY frontend/public ./frontend-build/public
COPY frontend/src ./frontend-build/src
# Copy config files (these should exist, but if missing the build will continue)
COPY frontend/tsconfig.json ./frontend-build/tsconfig.json
COPY frontend/tailwind.config.js ./frontend-build/tailwind.config.js
COPY frontend/postcss.config.js ./frontend-build/postcss.config.js

# Build frontend
WORKDIR /app/frontend-build
RUN echo "Building frontend..." && \
    npm ci --legacy-peer-deps && \
    npm run build && \
    echo "Frontend build completed successfully" && \
    ls -la build/ || (echo "ERROR: Frontend build failed!" && exit 1)

# Copy built frontend to public directory
WORKDIR /app
RUN echo "=== Copying frontend build to public directory ===" && \
    mkdir -p public && \
    if [ -d "frontend-build/build" ] && [ "$(ls -A frontend-build/build 2>/dev/null)" ]; then \
        echo "Source: frontend-build/build" && \
        echo "Contents of frontend-build/build:" && \
        ls -la frontend-build/build/ && \
        echo "Checking for index.html..." && \
        [ -f "frontend-build/build/index.html" ] && echo "index.html found" || echo "ERROR: index.html not found!" && \
        echo "Checking for static directory..." && \
        if [ -d "frontend-build/build/static" ]; then \
            echo "static directory found" && \
            echo "Static directory contents:" && \
            ls -la frontend-build/build/static/ && \
            if [ -d "frontend-build/build/static/js" ]; then \
                echo "JS files in build:" && \
                ls -la frontend-build/build/static/js/ | grep -E '\.js$' | head -10; \
            fi && \
            if [ -d "frontend-build/build/static/css" ]; then \
                echo "CSS files in build:" && \
                ls -la frontend-build/build/static/css/ | grep -E '\.css$' | head -10; \
            fi; \
        else \
            echo "ERROR: static directory not found in build output!" && \
            exit 1; \
        fi && \
        echo "Copying files..." && \
        cp -r frontend-build/build/* ./public/ && \
        echo "Verification after copy:" && \
        echo "index.html exists: $([ -f ./public/index.html ] && echo yes || echo no)" && \
        echo "static directory exists: $([ -d ./public/static ] && echo yes || echo no)" && \
        if [ -d "./public/static/js" ]; then \
            echo "JS files in public:" && \
            ls -la ./public/static/js/ | grep -E '\.js$' | head -10; \
        fi && \
        if [ -d "./public/static/css" ]; then \
            echo "CSS files in public:" && \
            ls -la ./public/static/css/ | grep -E '\.css$' | head -10; \
        fi && \
        echo "Checking index.html references..." && \
        grep -oE '/static/[^"]+' ./public/index.html | head -5 || echo "No static references found in index.html"; \
    else \
        echo "ERROR: Frontend build not found!" && \
        echo "frontend-build/build exists: $([ -d frontend-build/build ] && echo yes || echo no)" && \
        echo "Checking frontend-build directory:" && \
        ls -la frontend-build/ 2>/dev/null || echo "frontend-build directory does not exist" && \
        exit 1; \
    fi && \
    echo "=== Frontend build copy completed ==="

# Create necessary directories
RUN mkdir -p tmp/pids log

# Set environment variables
ENV RAILS_ENV=production
ENV RAILS_SERVE_STATIC_FILES=true
ENV RAILS_LOG_TO_STDOUT=true

# Skip asset precompilation for now - will be done at runtime
# RUN bundle exec rails assets:precompile

# Expose port
EXPOSE 3000

# Health check (uses PORT env var or defaults to 3000)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3000}/api/v1/health || exit 1

# Start the application
CMD ["ruby", "api_server.rb"]
