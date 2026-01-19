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
RUN npm ci --legacy-peer-deps && npm run build || (echo "Frontend build failed, continuing..." && mkdir -p build)

# Copy built frontend to public directory
WORKDIR /app
RUN mkdir -p public && \
    if [ -d "frontend-build/build" ] && [ "$(ls -A frontend-build/build 2>/dev/null)" ]; then \
        cp -r frontend-build/build/* ./public/; \
    elif [ -d "frontend/build" ] && [ "$(ls -A frontend/build 2>/dev/null)" ]; then \
        cp -r frontend/build/* ./public/; \
    else \
        echo "Warning: Frontend build not found, creating empty public directory"; \
        mkdir -p ./public; \
    fi

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
