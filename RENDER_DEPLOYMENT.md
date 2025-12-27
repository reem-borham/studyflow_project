# Deployment Guide for Render

This guide will help you deploy StudyFlow to Render.

## Prerequisites
- Git repository connected to Render
- Render account

## Files Overview

### 1. `render.yaml`
Main configuration file that tells Render how to deploy your app. It defines:
- **PostgreSQL database** (free tier)
- **Django backend** (Python web service)
- **React frontend** (static site)

### 2. `backend/build.sh`
Build script that runs on Render to:
- Install Python dependencies
- Install gunicorn (production server)
- Collect static files
- Run database migrations

### 3. `backend/.env.example`
Template for environment variables (for local development only)

## Deployment Steps

### Option 1: Using render.yaml (Recommended)
1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add Render configuration"
   git push origin <your-branch-name>
   ```

2. **Create New Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your repository
   - Select your branch
   - Render will automatically detect `render.yaml` and create all services

3. **Wait for deployment**
   - Render will create the database first
   - Then deploy the backend
   - Finally deploy the frontend
   - This may take 5-10 minutes

### Option 2: Manual Setup
If you want to create services manually:

#### A. Create PostgreSQL Database
1. Click "New +" → "PostgreSQL"
2. Name: `studyflow-db`
3. Region: Frankfurt (or closest to you)
4. Plan: Free
5. Click "Create Database"

#### B. Create Backend Service
1. Click "New +" → "Web Service"
2. Connect your repository
3. Configure:
   - **Name**: `studyflow-backend`
   - **Region**: Frankfurt
   - **Branch**: `<your-branch-name>`
   - **Root Directory**: Leave empty
   - **Runtime**: Python 3
   - **Build Command**: `cd backend && ./build.sh`
   - **Start Command**: `cd backend && gunicorn studyflow.wsgi:application`

4. Add Environment Variables:
   - `DATABASE_URL`: Link to your database (should auto-populate)
   - `SECRET_KEY`: Generate a random string
   - `DEBUG`: `False`
   - `PYTHON_VERSION`: `3.11.0`

5. Click "Create Web Service"

#### C. Create Frontend Service
1. Click "New +" → "Static Site"
2. Connect your repository
3. Configure:
   - **Name**: `studyflow-frontend`
   - **Branch**: `<your-branch-name>`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`

4. Add Environment Variable:
   - `VITE_API_URL`: URL of your backend service (e.g., `https://studyflow-backend.onrender.com`)

5. Click "Create Static Site"

## Important Notes

### Database Migrations
- First deployment will run migrations automatically via `build.sh`
- For subsequent deploys, migrations run automatically on each build

### Environment Variables
- Never commit `.env` files to Git
- All sensitive data should be set in Render dashboard
- Render will automatically generate `DATABASE_URL`

### Static Files
- Whitenoise handles static files in production
- Run `python manage.py collectstatic` locally to test

### Debugging Deployment Issues
1. Check build logs in Render dashboard
2. Check deploy logs for runtime errors
3. Make sure `build.sh` has execute permissions:
   ```bash
   git update-index --chmod=+x backend/build.sh
   ```

## Testing Locally Before Deploy

### Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Post-Deployment

### Access Your App
- Frontend: `https://studyflow-frontend.onrender.com`
- Backend API: `https://studyflow-backend.onrender.com/api/`
- Admin Panel: `https://studyflow-backend.onrender.com/admin/`

### Create Superuser
Use Render's shell to create an admin user:
1. Go to your backend service in Render dashboard
2. Click "Shell" tab
3. Run:
   ```bash
   python manage.py createsuperuser
   ```

## Free Tier Limitations
- Services spin down after 15 minutes of inactivity
- First request after inactivity takes ~30 seconds (cold start)
- 750 hours/month of runtime
- Database: 256MB storage, 97 connection limit

## Troubleshooting

### Build fails
- Check `build.sh` has correct permissions
- Verify all dependencies are in `requirements.txt`
- Check Python version matches

### Frontend can't connect to backend
- Verify `VITE_API_URL` is set correctly
- Check CORS settings in Django
- Ensure backend service is running

### Database connection errors
- Verify `DATABASE_URL` is set
- Check database is running
- Ensure `psycopg2-binary` is installed
