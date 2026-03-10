# Free Deployment Guide

This guide explains how to deploy the Social Media Platform for free using modern cloud services.

## Architecture for Free Tier

| Component | Provider | Plan |
|-----------|----------|------|
| **Database (PostgreSQL)** | [Neon](https://neon.tech) | Free Tier (0.5 vCPU, 2GB RAM) |
| **Cache (Redis)** | [Upstash](https://upstash.com) | Free Tier (Max 10K requests/day) |
| **Events (Kafka)** | [Upstash](https://upstash.com) | Free Tier (Max 10K messages/day) |
| **Backend (Spring Boot)** | [Render](https://render.com) or [Koyeb](https://koyeb.com) | Free Instance (Spin-down after inactivity) |
| **Frontend (React)** | [Vercel](https://vercel.com) or [Netlify](https://netlify.com) | Free Tier |

---

## 1. Database Setup (Neon)

1. Create an account at [Neon.tech](https://neon.tech).
2. Create a new project and a database named `socialmedia`.
3. Copy the **Connection String** (Pooled preferred). It looks like:
   `postgres://user:password@ep-cool-darkness-123456-pooler.us-east-2.aws.neon.tech/socialmedia?sslmode=require`

## 2. Redis & Kafka Setup (Upstash)

### Redis
1. Create an account at [Upstash](https://upstash.com).
2. Create a **Redis** database.
3. Copy the **Endpoint** (host and port) and **Password**.

### Kafka
1. In the same Upstash console, create a **Kafka** cluster.
2. Create a topic (e.g., `social-media-events`).
3. Go to the **Details** tab and copy the following:
   - **Endpoint** (Bootstrap Server)
   - **Username**
   - **Password**
4. Under the "Kafka" tab, you will find the **SASL JAAS Config**. It usually looks like this:
   `org.apache.kafka.common.security.plain.PlainLoginModule required username="YOUR_USERNAME" password="YOUR_PASSWORD";`

---

## 3. Backend Deployment (Render)

1. Fork the repository to your GitHub account.
2. Create a new **Web Service** on [Render](https://render.com).
3. Connect your GitHub repository.
4. Set the following:
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
5. Add **Environment Variables**:
   - `DATABASE_URL`: `jdbc:postgresql://your-neon-host:5432/socialmedia?sslmode=require` (Convert the Neon string to JDBC format)
   - `DB_USER`: `your-neon-user`
   - `DB_PASSWORD`: `your-neon-password`
   - `REDIS_HOST`: `your-upstash-redis-host`
   - `REDIS_PORT`: `your-upstash-redis-port`
   - `REDIS_PASSWORD`: `your-upstash-redis-password`
   - `KAFKA_SERVERS`: `your-upstash-kafka-endpoint`
   - `KAFKA_SASL_MECHANISM`: `SCRAM-SHA-256` (Upstash default)
   - `KAFKA_SECURITY_PROTOCOL`: `SASL_SSL`
   - `KAFKA_JAAS_CONFIG`: `org.apache.kafka.common.security.scram.ScramLoginModule required username="YOUR_UPSTASH_USERNAME" password="YOUR_UPSTASH_PASSWORD";`
   - `JWT_SECRET`: Generate a random 256-bit string.

---

## 4. Frontend Deployment (Vercel)

1. Create a new project on [Vercel](https://vercel.com).
2. Connect your GitHub repository.
3. Set the following:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variables**:
   - `VITE_API_BASE_URL`: `https://your-backend-render-url.onrender.com/api`

---

## Important Notes

- **Cold Starts**: Render's free tier spins down after 15 minutes of inactivity. The first request might take 30-60 seconds.
- **Upstash Limits**: Monitor your usage in the Upstash console. If you exceed the free tier limits, services might start failing.
- **CORS**: Ensure your backend's CORS configuration allows your Vercel URL. You can set this in `WebSecurityConfig.java` or via an environment variable if implemented.
