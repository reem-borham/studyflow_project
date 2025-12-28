# StudyFlow

StudyFlow is a collaborative Q&A web platform designed for academic environments. Inspired by platforms like Stack Overflow and Quora, it facilitates knowledge sharing between students and instructors through structured discussions, question posting, and verified answers.
 Deployment Link : [Click_Here](https://terrific-freedom-production-62b6.up.railway.app)


---

## 🚀 Features

### User Management
- **Role-based Registration:** Students and Instructors with token-based authentication
- **Profile Customization:** Upload and manage profile pictures
- **Personal Dashboard:** Track activity with tabbed interface showing questions asked and answers given

### Q&A System
- **Full CRUD Operations:** Create, read, update, and delete questions
- **Tagging & Categorization:** Organize questions with relevant tags
- **Question Detail View:** Dedicated page with full question content, tags, and all answers
- **Interactive Answers:** Submit answers directly from question pages

### Engagement Features
- **Voting System:** Upvote/downvote questions and answers
- **View Tracking:** Monitor question popularity through view counts
- **Reputation System:** Track user contributions with reputation scores based on:
  - Question votes received
  - Answer votes received

### Notifications
- **Real-time Polling:** Automatic alerts for new replies and interactions (30-second intervals)
- **Notification Management:** Mark notifications as read with visual indicators
- **Unread Counter:** Badge showing unread notification count

### Discovery
- **Explore Feed:** Browse latest questions from the community
- **Search Functionality:** Find relevant content quickly
- **Popular Tags:** View trending topics

### User Interface
- **Modern Glassmorphism Design:** Sleek, translucent UI elements
- **Responsive Layout:** Optimized for all screen sizes
- **Material UI Components:** Professional icons and form elements

---

## 🛠️ Technical Stack

### Frontend
- **Framework:** React.js with TypeScript
- **Routing:** React Router v6
- **UI Library:** Material UI (MUI)
- **State Management:** React Hooks (useState, useEffect)
- **Styling:** Custom CSS with Glassmorphism effects

### Backend
- **Framework:** Django REST Framework (DRF)
- **Database:** PostgreSQL (Production) / SQLite (Development)
- **Authentication:** Token-based system
- **Media Storage:** File-based media handling for profile pictures
- **ORM:** Django ORM

---

## 🏗️ System Architecture

The platform follows a three-tier architecture:

1. **Presentation Layer:** React.js Single Page Application
2. **Business Logic Layer:** Django REST Framework API
3. **Data Layer:** Relational PostgreSQL/SQLite database

---

## 📡 API Endpoints

### Authentication
- `POST /api/register/` - User registration
- `POST /api/login/` - Token-based authentication

### Questions
- `GET /api/posts/` - List all questions
- `POST /api/posts/` - Create a new question
- `GET /api/posts/{id}/` - Get question details with answers

### Answers
- `POST /api/answers/` - Submit an answer to a question

### User Profile
- `GET /api/profile/` - Get user profile with statistics
- `POST /api/profile/upload-picture/` - Upload profile picture

### Notifications
- `GET /api/notifications/` - Retrieve user notifications
- `POST /api/notifications/{id}/mark-read/` - Mark notification as read

### Tags
- `GET /api/tags/popular/` - Retrieve top 5 most used tags

---

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.x
- Node.js & npm
- PostgreSQL (Optional for local dev)

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing

The system includes a comprehensive test suite covering:

- **Questions:** CRUD validation and tagging logic
- **Answers & Notifications:** Integration tests for triggered alerts
- **Dashboard:** Calculation of user statistics and reputation
- **Tags:** Popularity sorting verification

Run backend tests:
```bash
python manage.py test
```

---

## 🔮 Future Enhancements

- AI-driven tag and question suggestions
- Gamification with badges and achievement system
- WebSocket-based real-time notifications
- Mobile applications for iOS and Android
- Integration with Learning Management Systems (LMS)
- Advanced search with filters

---

## 📄 License & Credits

**Prepared by:** Nourhan ElSheikh, Reem Khaled Ali, Sarah ElShinnawy, and Youssef Alaa-eldin  
**Date:** December 2025
