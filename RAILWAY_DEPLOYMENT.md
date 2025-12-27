# Railway Deployment Guide

Complete guide for deploying StudyFlow to Railway using GitHub integration.

## Overview

Railway is a modern deployment platform that automatically detects and deploys your Django backend and React frontend. It's simpler than Render and offers a generous free tier with $5/month in credits.

---

## Prerequisites

- GitHub account with StudyFlow repository
- Railway account (sign up at [railway.app](https://railway.app) with GitHub)
- Code pushed to your deployment branch

---

## Quick Start Deployment

### Step 1: Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose `StudyFlow` or `StudyFlow/studyflow_project`
5. Select your deployment branch

---

### Step 2: Add PostgreSQL Database

1. In your project, click **"New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway automatically creates the database with a `DATABASE_URL` variable

---

### Step 3: Configure Backend Service

Railway should auto-detect Django. Configure it:

#### A. Set Root Directory
1. Click on the backend service
2. Go to **"Settings"** tab
3. Find **"Root Directory"**
4. Set to: `backend`
5. Railway will now use `backend` as the root

#### B. Configure Build & Start Commands (Optional)

Railway usually auto-detects, but you can override if needed:

- **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate`
- **Start Command**: `gunicorn studyflow.wsgi:application`

#### C. Add Environment Variables

Click **"Variables"** tab and add:

| Variable | Value | How to Set |
|----------|-------|------------|
| `DATABASE_URL` | PostgreSQL reference | Click `+` → **Reference** → Select PostgreSQL → `DATABASE_URL` |
| `SECRET_KEY` | Generated key | See below for generation |
| `DEBUG` | `False` | Type manually |

**Generate SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```
Copy the output (e.g., `torfmznwzgie)xx=7y0-fc6(v6sjvw5&ft43a9=k6(t3zs81v7`)

---

### Step 4: Configure Frontend Service

1. In your project, click **"New"**
2. Select **"GitHub Repo"** 
3. Choose the **same repository** (StudyFlow)
4. This creates a second service from the same repo

#### A. Set Root Directory
1. Click on the new frontend service
2. Go to **"Settings"** tab
3. Find **"Root Directory"**
4. Set to: `frontend`

#### B. Railway Auto-Detects Vite

Railway will automatically:
- Detect `package.json` in the frontend directory
- Identify it as a Vite project
- Set build command: `npm run build`
- Serve the static files from `dist` folder

#### C. Add Environment Variable

Click **"Variables"** tab and add:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://${{Backend.RAILWAY_PUBLIC_DOMAIN}}` |

**Important:** Replace `Backend` with your actual backend service name in Railway if it's different.

**Alternative (simpler but requires manual update):**
1. Go to your backend service
2. Copy the public URL (e.g., `https://studyflow-backend-production-xxxx.up.railway.app`)
3. Use that as the value for `VITE_API_URL`

---

## Deployment Process

Once configured, Railway will:

1. **Build Backend**:
   - Install Python dependencies
   - Run migrations
   - Collect static files
   - Start gunicorn server

2. **Build Frontend**:
   - Install npm dependencies
   - Build Vite production bundle
   - Serve static files

3. **Auto-Deploy**: Every push to your connected branch triggers automatic redeployment

---

## Post-Deployment Tasks

### 1. Create Superuser

Use Railway's built-in shell:

1. Go to your backend service in Railway
2. Click the **"..."** menu → **"Shell"**
3. Run:
   ```bash
   python manage.py createsuperuser
   ```
4. Follow the prompts to create an admin user

### 2. Access Your App

- **Frontend**: `https://your-frontend-service.up.railway.app`
- **Backend API**: `https://your-backend-service.up.railway.app/api/`
- **Admin Panel**: `https://your-backend-service.up.railway.app/admin/`

### 3. Set Custom Domain (Optional)

1. Go to your frontend service → **"Settings"**
2. Scroll to **"Domains"**
3. Click **"Generate Domain"** or add a custom domain

---

## Environment Variables Summary

### Backend Service
```
DATABASE_URL=${{Postgres.DATABASE_URL}}
SECRET_KEY=<your-generated-secret-key>
DEBUG=False
```

### Frontend Service
```
VITE_API_URL=https://${{Backend.RAILWAY_PUBLIC_DOMAIN}}
```

---

## Troubleshooting

### Build Fails

**Check build logs:**
1. Go to service → **"Deployments"** tab
2. Click the failed deployment
3. View logs for errors

**Common fixes:**
- Verify `requirements.txt` includes all dependencies
- Check `package.json` has correct scripts
- Ensure root directory is set correctly

### Frontend Can't Connect to Backend

**Symptoms:** API requests fail, CORS errors

**Fixes:**
1. Verify `VITE_API_URL` is set correctly
2. Check backend `ALLOWED_HOSTS` includes `.railway.app` (already done in your `settings.py`)
3. Ensure CORS is configured (already done with `django-cors-headers`)

### Database Connection Errors

**Fixes:**
1. Verify `DATABASE_URL` is referenced correctly (not hardcoded)
2. Check PostgreSQL service is running
3. Ensure `psycopg2-binary` is in `requirements.txt`

### Static Files Not Loading

**Fixes:**
1. Verify `collectstatic` runs in build command
2. Check `whitenoise` is in `MIDDLEWARE` (already configured)
3. Ensure `STATIC_ROOT` is set in `settings.py` (already done)

---

## Railway vs Render Comparison

| Feature | Railway | Render |
|---------|---------|--------|
| **Free Tier** | $5/month credit | 750 hours/month |
| **Setup** | Auto-detect (easier) | Requires YAML config |
| **Cold Starts** | ~10-15 seconds | ~30 seconds |
| **Database** | Free PostgreSQL (500MB) | Free PostgreSQL (256MB) |
| **Deployment Speed** | Faster | Slower |
| **Credit Card** | Required after trial | Optional for free tier |

---

## Cost Estimates (Free Tier)

With Railway's $5/month free credit:

- **Backend service**: ~$2-3/month
- **Frontend static site**: ~$0.50/month  
- **PostgreSQL database**: Free (up to 500MB)

**Total**: Usually stays under $5/month for low traffic

---

## Best Practices

1. **Use Environment Variables**: Never hardcode secrets
2. **Monitor Usage**: Check Railway dashboard for credit usage
3. **Enable Logs**: Use Railway's logging to debug issues
4. **Set Up Alerts**: Configure notifications for deployment failures
5. **Use Branches**: Deploy staging on a separate branch

---

## What We've Already Configured

✅ Django settings support Railway (`.railway.app` in `ALLOWED_HOSTS`)
✅ Frontend uses `VITE_API_URL` environment variable
✅ Static files configured with whitenoise
✅ Database configured to use `DATABASE_URL`
✅ All dependencies listed in `requirements.txt`

**You're ready to deploy!** Just follow the steps above. 🚀

---

## Quick Command Reference

```bash
# Generate Django secret key
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Test locally before deploying
cd backend && python manage.py runserver
cd frontend && npm run dev

# Build frontend locally to test
cd frontend && npm run build && npm run preview
```
