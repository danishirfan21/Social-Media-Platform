# Social Media Platform

A high-performance, scalable social media platform built with Spring Boot and React + TypeScript. Features real-time notifications, personalized feeds, and comprehensive security.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Testing](#testing)
- [Deployment](#deployment)
- [Free Deployment Guide](DEPLOYMENT_FREE.md)
- [Performance](#performance)
- [Contributing](#contributing)

## Overview

This platform enables users to:
- Create, edit, and delete posts with image uploads
- Like, comment, and share posts
- Follow/unfollow other users
- Receive real-time notifications via WebSocket
- View personalized feed based on following

## Tech Stack

### Backend
- **Java 17** with Spring Boot 3.2
- **PostgreSQL** - Primary database
- **Redis** - Caching layer
- **Kafka** - Event streaming
- **WebSocket** - Real-time notifications
- **Spring Security** - OAuth2 + JWT authentication
- **Swagger/OpenAPI** - API documentation
- **Spring Boot Actuator** - Metrics and monitoring

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** - State management
- **React Query** - Data fetching and caching
- **Material UI** - Component library
- **Axios** - HTTP client with interceptors
- **Vite** - Build tool
- **WebSocket Client** - Real-time updates

### DevOps
- **Docker** + Docker Compose
- **GitHub Actions** - CI/CD pipeline
- **AWS ECS** - Container orchestration (production)
- **S3 + CloudFront** - Static assets and CDN

## Features

### Authentication & Authorization
- Email/password registration and login
- OAuth2 integration with Google
- JWT token-based authentication
- Refresh token rotation
- Role-based access control (USER, ADMIN)
- Rate limiting on sensitive endpoints

### Posts
- Create posts with text and images
- Edit and delete own posts
- Like/unlike posts
- Comment on posts
- Share posts
- Pagination support

### Social Features
- Follow/unfollow users
- View followers and following lists
- Personalized feed based on following
- User profiles with bio and avatar

### Notifications
- Real-time WebSocket notifications
- Notification types: New follower, Post liked, Post commented, Post shared
- Unread notification count
- Mark as read functionality

### Performance
- Redis caching for feed and frequently accessed data
- Kafka for asynchronous event processing
- Database indexing for optimized queries
- Infinite scroll with pagination
- Connection pooling (HikariCP)

## Architecture

### System Architecture

```
┌─────────────┐
│   Client    │
│  (React)    │
└──────┬──────┘
       │
       ├─── HTTP/REST ────┐
       │                  │
       └─── WebSocket ────┤
                          │
                    ┌─────▼──────┐
                    │   Nginx    │
                    │  (Reverse  │
                    │   Proxy)   │
                    └─────┬──────┘
                          │
                    ┌─────▼────────┐
                    │  Spring Boot │
                    │   Backend    │
                    └──┬───┬───┬───┘
                       │   │   │
           ┌───────────┘   │   └──────────┐
           │               │              │
      ┌────▼────┐    ┌────▼────┐   ┌────▼────┐
      │  Redis  │    │ Postgres│   │  Kafka  │
      │ (Cache) │    │   (DB)  │   │ (Events)│
      └─────────┘    └─────────┘   └─────────┘
```

### Data Flow

1. **User Request** → Frontend → Backend API
2. **Authentication** → JWT validation → Process request
3. **Database Query** → Check Redis cache → Query PostgreSQL if miss
4. **Async Events** → Publish to Kafka → Process in background
5. **Real-time Updates** → Kafka Consumer → WebSocket broadcast

## Getting Started

### Prerequisites

- Java 17+
- Node.js 20+
- Docker and Docker Compose
- Maven 3.9+

### Local Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd social-media-platform
```

2. **Set up backend**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
mvn clean install
```

3. **Set up frontend**
```bash
cd frontend
npm install
```

4. **Start services with Docker Compose**
```bash
docker-compose up -d postgres redis kafka zookeeper
```

5. **Run backend**
```bash
cd backend
mvn spring-boot:run
```

6. **Run frontend**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- Actuator: http://localhost:8080/actuator

### Docker Setup (Full Stack)

```bash
# Build and start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
```

## API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Response
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

### Posts

#### Create Post
```http
POST /api/posts
Authorization: Bearer {token}
Content-Type: application/json

{
  "content": "Hello, world!",
  "imageUrl": "https://example.com/image.jpg"
}
```

#### Get Feed
```http
GET /api/feed?page=0&size=20
Authorization: Bearer {token}
```

### Full API Documentation

Access complete API documentation at: http://localhost:8080/swagger-ui.html

## Security

### Implemented Security Measures

1. **Authentication**
   - JWT tokens with RS256 signing
   - Secure password hashing with BCrypt
   - OAuth2 integration

2. **Authorization**
   - Role-based access control
   - Endpoint protection
   - Resource ownership validation

3. **Network Security**
   - HTTPS enforcement
   - CORS configuration
   - Rate limiting (Resilience4j)

4. **Data Protection**
   - Input validation
   - SQL injection prevention (JPA)
   - XSS protection headers

5. **Monitoring**
   - Spring Boot Actuator
   - Health checks
   - Metrics collection

### Environment Variables

Create `.env` file based on `.env.example`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=socialmedia
DB_USER=postgres
DB_PASSWORD=<strong-password>

# JWT
JWT_SECRET=<256-bit-secret-key>
JWT_EXPIRATION=86400000

# OAuth2
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>

# AWS (for production)
AWS_S3_BUCKET=<bucket-name>
AWS_ACCESS_KEY=<access-key>
AWS_SECRET_KEY=<secret-key>
```

## Testing

### Backend Tests

```bash
cd backend
mvn test
mvn verify
```

### Frontend Tests

```bash
cd frontend
npm test
npm run test:ui
```

### E2E Tests

```bash
cd frontend
npx cypress open
```

## Deployment

### Free Deployment Guide 🚀

If you are looking for a way to deploy this project for free, check out our [Free Deployment Guide](DEPLOYMENT_FREE.md). It covers using services like Render, Vercel, Neon, and Upstash.

### AWS ECS Deployment
```bash
docker build -t backend:latest ./backend
docker build -t frontend:latest ./frontend

docker tag backend:latest <ecr-repo>/backend:latest
docker tag frontend:latest <ecr-repo>/frontend:latest

docker push <ecr-repo>/backend:latest
docker push <ecr-repo>/frontend:latest
```

2. **Create ECS task definitions**
3. **Deploy to ECS service**
4. **Configure Application Load Balancer**
5. **Set up Auto Scaling**

### Environment-specific Configuration

- **Development**: Docker Compose
- **Staging**: AWS ECS with smaller instances
- **Production**: AWS ECS with auto-scaling, RDS, ElastiCache

## Performance

### Optimization Strategies

1. **Caching**
   - Redis for feed data (10-minute TTL)
   - Query result caching
   - Static asset caching

2. **Database**
   - Indexed queries
   - Connection pooling
   - Batch operations

3. **API**
   - Pagination
   - Lazy loading
   - Response compression

4. **Frontend**
   - Code splitting
   - Lazy component loading
   - React Query caching

### Metrics

- **Backend**: Spring Boot Actuator + Prometheus
- **Frontend**: Lighthouse CI
- **Infrastructure**: AWS CloudWatch

## OAuth2 Setup

### Google OAuth2 Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:8080/login/oauth2/code/google`
   - `https://yourdomain.com/login/oauth2/code/google`
6. Copy Client ID and Client Secret to `.env`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- **Backend**: Follow Google Java Style Guide
- **Frontend**: Use Prettier and ESLint configurations

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review API documentation

---

Built with ❤️ using Spring Boot and React
