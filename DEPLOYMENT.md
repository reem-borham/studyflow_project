# StudyFlow Deployment Guide - Render Platform

This guide will walk you through deploying your StudyFlow application to Render, which provides free hosting for both your Django backend and React frontend.

## 📋 Prerequisites

Before you begin, make sure you have:
- [ ] A [GitHub account](https://github.com)
- [ ] A [Render account](https://render.com) (free tier available)
- [ ] Your StudyFlow code pushed to a GitHub repository

---

## 🚀 Deployment Steps Overview

1. **Push Code to GitHub** (if not already done)
2. **Create PostgreSQL Database on Render**
3. **Deploy Django Backend**
4. **Deploy React Frontend**
5. **Test Your Deployed Application**

---

## Step 1: Push Your Code to GitHub

If your code isn't on GitHub yet:

```bash
# Navigate to your project
cd C:\Users\sarah\Desktop\StudyFlow\studyflow_project

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "Prepare for Render deployment"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/studyflow.git

# Push to GitHub
git push -u origin main
```

---

## Step 2: Create PostgreSQL Database on Render

1. **Sign in to Render** at [https://render.com](https://render.com)

2. **Click "New +"** → Select **"PostgreSQL"**

3. **Configure Database:**
   - **Name**: `studyflow-db` (or any name you prefer)
   - **Database**: `studyflow_db`
   - **User**: (auto-generated)
   - **Region**: Choose closest to your location
   - **PostgreSQL Version**: 16 (latest)
   - **Plan**: Free

4. **Click "Create Database"**

5. **Save Connection Details:**
   - Once created, you'll see the database dashboard
   - Find the **"Internal Database URL"** - you'll need this for the backend
   - It looks like: `postgresql://user:password@host:5432/database`

---

## Step 3: Deploy Django Backend

### 3.1 Create Web Service

1. **Click "New +"** → Select **"Web Service"**

2. **Connect Your Repository:**
   - Click "Connect GitHub"
   - Authorize Render to access your repositories
   - Select your StudyFlow repository

3. **Configure Web Service:**

   **Basic Settings:**
   - **Name**: `studyflow-backend` (this will be part of your URL)
   - **Region**: Same as your database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`

   **Build & Deploy:**
   - **Build Command**: `chmod +x build.sh && ./build.sh`
   - **Start Command**: `gunicorn studyflow.wsgi:application`

### 3.2 Configure Environment Variables

Click **"Environment"** section and add these variables:

| Key | Value |
|-----|-------|
| `SECRET_KEY` | Generate a new one at [djecrety.ir](https://djecrety.ir/) |
| `DEBUG` | `False` |
| `DATABASE_URL` | Paste the **Internal Database URL** from Step 2 |
| `ALLOWED_HOSTS` | `studyflow-backend.onrender.com` (use your actual service name) |
| `FRONTEND_URL` | `https://studyflow-frontend.onrender.com` (we'll create this in Step 4) |
| `PYTHON_VERSION` | `3.11.0` |

> [!IMPORTANT]
> Replace `studyflow-backend` and `studyflow-frontend` with your actual Render service names!

### 3.3 Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying your backend
3. Wait for the deployment to complete (3-5 minutes)
4. Your backend will be available at: `https://studyflow-backend.onrender.com`

### 3.4 Verify Backend

Test your API by visiting:
```
https://studyflow-backend.onrender.com/api/
```

You should see the Django REST Framework browsable API.

---

## Step 4: Deploy React Frontend

### 4.1 Update Production Environment File

**BEFORE deploying**, update your `.env.production` file with your actual backend URL:

```bash
# Open the file
# Location: C:\Users\sarah\Desktop\StudyFlow\studyflow_project\frontend\.env.production

# Update with your ACTUAL backend URL from Step 3
VITE_API_URL=https://studyflow-backend.onrender.com/api
```

**Commit and push this change:**
```bash
git add frontend/.env.production
git commit -m "Update production API URL"
git push
```

### 4.2 Create Static Site

1. **Click "New +"** → Select **"Static Site"**

2. **Connect Repository:**
   - Select your StudyFlow repository (already connected from Step 3)

3. **Configure Static Site:**

   **Basic Settings:**
   - **Name**: `studyflow-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`

   **Build Settings:**
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

### 4.3 Deploy

1. Click **"Create Static Site"**
2. Render will build and deploy your frontend (3-5 minutes)
3. Your frontend will be available at: `https://studyflow-frontend.onrender.com`

### 4.4 Update Backend CORS Settings

Now that you know your frontend URL, **update the backend environment variable**:

1. Go to your **backend service** on Render
2. Navigate to **Environment** tab
3. Update `FRONTEND_URL` to your actual frontend URL: `https://studyflow-frontend.onrender.com`
4. Click **"Save Changes"**
5. The backend will automatically redeploy

---

## Step 5: Test Your Deployed Application

1. **Visit Your Frontend**: `https://studyflow-frontend.onrender.com`

2. **Test Registration:**
   - Click "Sign Up"
   - Create a new account
   - Verify you can register successfully

3. **Test Login:**
   - Log in with your new account
   - Verify you're redirected to the dashboard

4. **Test Features:**
   - Create a question
   - Add an answer
   - Test voting and comments

---

## 🔧 Troubleshooting

### Frontend Shows Blank Page
- Check browser console for errors (F12)
- Verify the API URL in `.env.production` is correct
- Check that the backend is running

### API Calls Failing (CORS Errors)
- Verify `FRONTEND_URL` in backend environment variables matches your frontend URL exactly
- Make sure backend is deployed and running
- Check backend logs in Render dashboard

### Backend Won't Start
- Check "Logs" tab in Render dashboard for errors
- Verify all environment variables are set correctly
- Ensure `DATABASE_URL` is valid

### Database Connection Errors
- Verify `DATABASE_URL` is the **Internal Database URL** from your Render PostgreSQL
- Check that the database is running in Render dashboard

---

## 📝 Important Notes

> [!WARNING]
> **Free Tier Limitations:**
> - Backend services spin down after 15 minutes of inactivity
> - First request after sleeping will be slow (30-60 seconds)
> - Database limited to 1GB storage
> - Upgrade to paid tier for always-on services

> [!TIP]
> **Keep Services Active:**
> - Use a service like [UptimeRobot](https://uptimerobot.com/) to ping your backend every 14 minutes to keep it awake

---

## 🎉 Success!

Your StudyFlow application is now deployed and accessible worldwide! 

**Your URLs:**
- **Frontend**: `https://studyflow-frontend.onrender.com`
- **Backend API**: `https://studyflow-backend.onrender.com/api`

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

---

## 🔄 Updating Your Deployment

Whenever you make changes to your code:

```bash
# Commit your changes
git add .
git commit -m "Your commit message"
git push

# Render will automatically redeploy both services!
```

Render will detect the changes and automatically rebuild and redeploy your application. No manual intervention needed! 🚀
