# クリニックアプリケーション - 本番デプロイガイド

## Current Status
✅ Frontend build completed successfully
⚠️ Backend requires Ruby/Rails environment setup

## Quick Start (Frontend Only)
The frontend application has been built and is ready for deployment. To start the frontend server:

```bash
cd C:\devlop\clinics\frontend
npx serve -s build -l 3000
```

The application will be available at: http://localhost:3000

## Full Production Deployment

### Prerequisites
1. **Ruby 3.2.0+** - Install from https://rubyinstaller.org/
2. **Rails 7.0+** - Will be installed via Gemfile
3. **MySQL 8.0+** - Database server
4. **Redis 6.0+** - For caching and background jobs
5. **Node.js 18+** - Already installed (for frontend)

### Backend Setup
```bash
cd C:\devlop\clinics\backend

# Install Ruby dependencies
bundle install

# Set up database
rails db:create
rails db:migrate
rails db:seed

# Start backend server
rails server -p 3001
```

### Environment Configuration
Create `.env.production` files with production values:

**Frontend (.env.production):**
```
REACT_APP_API_URL=http://localhost:3001/api/v1
REACT_APP_ENVIRONMENT=production
```

**Backend (.env.production):**
```
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=clinics_production
REDIS_URL=redis://localhost:6379/0
JWT_SECRET_KEY=your_secure_jwt_secret
RAILS_ENV=production
SECRET_KEY_BASE=your_rails_secret_key
```

### Production Deployment Options

#### Option 1: Local Development Server
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

#### Option 2: Cloud Deployment
- **Frontend**: Deploy to Vercel, Netlify, or AWS S3
- **Backend**: Deploy to Heroku, AWS ECS, or DigitalOcean

#### Option 3: Docker Deployment
Create Dockerfiles for both frontend and backend services.

## Current Build Output
- Frontend build files: `C:\devlop\clinics\frontend\build\`
- Static assets optimized for production
- TypeScript compilation successful
- ESLint warnings present but non-blocking

## Next Steps
1. Install Ruby/Rails environment
2. Set up MySQL database
3. Configure production environment variables
4. Start backend server
5. Test full application functionality

## Troubleshooting
- If Ruby/bundle commands fail, install Ruby from rubyinstaller.org
- If database connection fails, ensure MySQL is running
- If Redis connection fails, ensure Redis server is running
- Check environment variables are properly set
