# Clinics Management System

A comprehensive clinic management system built with modern technologies.

## Technology Stack

### Backend
- **Ruby on Rails** - API framework
- **Sidekiq** - Background job processing
- **MySQL** - Primary database
- **Redis** - Caching and job queue

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **Radix UI** - Accessible UI components
- **Tanstack Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Tailwind CSS** - Styling
- **Storybook** - Component development

### Infrastructure
- **Amazon Web Services**
  - ECS (Elastic Container Service)
  - Aurora MySQL
  - OpenSearch
  - ElastiCache
  - Lambda
- **Google Cloud**
  - Firebase
  - BigQuery
- **MongoDB Atlas**

### Monitoring & Operations
- **Terraform** - Infrastructure as Code
- **SendGrid** - Email service
- **Datadog** - Monitoring and observability
- **Sentry** - Error tracking
- **PagerDuty** - Incident management

### Development Tools
- **Cursor** - AI-powered code editor
- **GitHub** - Version control
- **GitHub Copilot** - AI pair programming
- **Slack** - Team communication
- **Docker** - Containerization
- **OrbStack** - Docker alternative
- **MagicPod** - Mobile testing
- **CircleCI** - Continuous integration
- **GitHub Actions** - CI/CD

## Project Structure

```
clinics/
├── backend/                 # Ruby on Rails API
│   ├── app/
│   │   ├── api/           # API controllers
│   │   ├── controllers/   # Application controllers
│   │   ├── models/        # Data models
│   │   ├── serializers/   # JSON serializers
│   │   ├── services/      # Business logic
│   │   └── workers/       # Sidekiq workers
│   ├── config/            # Configuration files
│   ├── db/                # Database files
│   └── Gemfile            # Ruby dependencies
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilities
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Helper functions
│   └── package.json       # Node dependencies
├── infrastructure/        # Terraform configurations
├── monitoring/           # Monitoring configurations
└── docs/                # Documentation
```

## Getting Started

### Prerequisites
- Ruby 3.2.0+
- Node.js 18+
- MySQL 8.0+
- Redis 6.0+

### Backend Setup
```bash
cd backend
bundle install
rails db:create
rails db:migrate
rails db:seed
rails server
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Features

- **Clinic Management** - Manage multiple clinics
- **Doctor Management** - Doctor profiles and specializations
- **Patient Management** - Patient records and history
- **Appointment Scheduling** - Book and manage appointments
- **Medical Records** - Digital medical records
- **Analytics Dashboard** - Insights and reporting
- **User Authentication** - Secure access control
- **Real-time Updates** - Live data synchronization

## API Documentation

The API documentation is available at `/api-docs` when running the backend server.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
