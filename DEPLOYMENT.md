# Deployment Guide

This Values Compass app is optimized for deployment on **Vercel** with **Vercel Postgres (Neon)** as the database backend.

## Features Implemented

✅ **Phase 1 & Phase 2 Visual Distinction**
- Separate progress bars for each phase
- Clear labeling: "Phase 1 - 56 rounds" and "Phase 2 - 20 final selections"
- Different background colors for phase transition

✅ **Encouraging Animations**
- Random encouragement messages every 3-6 rounds
- Animated toast notifications with progress celebration

✅ **User Guidance**
- Note on selection page about editing values later
- "Edit Values" section with clear instructions
- Confirmation dialog for "Start Over" to prevent accidental data loss

✅ **Improved UI**
- Removed "All Values Ranked" section
- Added "Back to Edit" button in rating phase
- Cleaner, more focused interface

✅ **User Authentication & Data Persistence**
- Simple email/password authentication
- All data stored in JSON files (no database setup required)
- Users can save and track their values over time
- View history of past values sessions

## Architecture Overview

- **Frontend**: React + Vite (served as static files)
- **Backend**: Express API routes (serverless functions)
- **Database**: PostgreSQL via Vercel Postgres (Neon)
- **ORM**: Drizzle ORM
- **Authentication**: Session-based with Bearer tokens

## Quick Deploy to Vercel

### 1. Prerequisites

- A Vercel account ([sign up here](https://vercel.com/signup))
- Vercel CLI (optional): `npm i -g vercel`

### 2. Deploy via Vercel Dashboard (Easiest)

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/new)
3. Click "Import Project"
4. Select your repository
5. Vercel will auto-detect the configuration
6. Click "Deploy"

### 3. Deploy via CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

### 4. Set Up Database

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Choose a region (preferably close to your users)
6. Click **Create**

Vercel automatically adds `POSTGRES_URL` to your environment variables.

### 5. Initialize Database Schema

After creating the database:

```bash
# Pull environment variables from Vercel
vercel env pull .env

# Push your database schema
npm run db:push
```

### 6. Deploy to Production

```bash
vercel --prod
```

## Local Development

### Option 1: Use Vercel Postgres (Recommended)

```bash
# Link to your Vercel project
vercel link

# Pull environment variables
vercel env pull .env

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Option 2: Use Local PostgreSQL

```bash
# Install PostgreSQL locally

# Create .env file
cp .env.example .env

# Update POSTGRES_URL with your local database
# POSTGRES_URL="postgresql://localhost:5432/yourdb"

# Install dependencies
npm install

# Push schema to database
npm run db:push

# Start dev server
npm run dev
```

## Environment Variables

Required environment variables:

- `POSTGRES_URL`: PostgreSQL connection string (auto-set by Vercel Postgres)

## Database Migrations

When updating your schema:

```bash
# Generate migration files
npm run db:generate

# Apply migrations
npm run db:push
```

## Data Storage

All data is stored in PostgreSQL:

- **users**: User accounts with hashed passwords
- **sessions**: Authentication sessions
- **user_values_sessions**: Saved values assessments with progress tracking

## Security Notes

- Passwords are hashed using bcrypt
- Sessions expire after 30 days
- Database connections use SSL by default on Vercel
- Serverless functions are stateless and auto-scale

## Backup

Vercel Postgres includes automatic daily backups. You can also:

```bash
# Export database via Vercel CLI
vercel postgres dump
```

## Troubleshooting

### Database Connection Issues

- Ensure `POSTGRES_URL` is set in Vercel environment variables
- Check database region matches your function region
- Verify database is active in Vercel Dashboard

### Build Failures

```bash
# Check TypeScript errors
npm run check

# Review build logs in Vercel Dashboard
```

### API Routes Not Working

- Ensure routes start with `/api/`
- Check `vercel.json` configuration
- Review function logs in Vercel Dashboard

## Production Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Postgres database created
- [ ] Database schema pushed (`npm run db:push`)
- [ ] Environment variables configured
- [ ] Test deployment successful
- [ ] Production deployment complete