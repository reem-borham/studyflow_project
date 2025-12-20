# StudyFlow

StudyFlow is a collaborative Q&A web platform designed for academic environments. Inspired by platforms like Stack Overflow and Quora, it facilitates knowledge sharing between students and instructors through structured discussions, question posting, and verified answers.

---

## 🚀 Features (Version 1.0)

- **User Management:** Role-based registration for Students and Instructors with token-based authentication.
- **Q&A System:** Full CRUD operations for questions, including tagging and categorization.
- **Interactive Answers:** Users can submit answers, with Instructors having the ability to verify "Best Answers".
- **Personal Dashboards:** Users can track their activity, view statistics (questions asked, answers given), and manage their profiles.
- **Notification System:** Real-time polling-based alerts for new replies and interactions.
- **Discovery:** Explore feed with search/filtering and a "Popular Tags" display.
- **Responsive UI:** A modern interface featuring glassmorphism styling.

---

## 🛠️ Technical Stack

### Frontend
- **Framework:** React.js with TypeScript
- **Routing:** React Router
- **State Management:** React Hooks
- **Styling:** Custom CSS with Glassmorphism effects

### Backend
- **Framework:** Django REST Framework (DRF)
- **Database:** PostgreSQL (Production) / SQLite (Development)
- **Authentication:** Token-based system
- **ORM:** Django ORM

---

## 🏗️ System Architecture

The platform follows a three-tier architecture:

1. **Presentation Layer:** React.js SPA.
2. **Business Logic Layer:** Django REST Framework API.
3. **Data Layer:** Relational PostgreSQL/SQLite database.

---

## API Overview

The backend provides several key RESTful endpoints:

- `POST /api/register/`: User registration.
- `POST /api/login/`: Token-based authentication.
- `GET/POST /api/posts/`: List or create questions.
- `GET /api/tags/popular/`: Retrieve top 5 most used tags.
- `GET /api/notifications/`: Retrieve user alerts.

---

## ⚙️ Installation & Setup

### Prerequisites
- Python 3.x
- Node.js & npm
- PostgreSQL (Optional for local dev)

### Backend Setup
1. Clone the repository and navigate to the backend folder.
2. Install dependencies: `pip install -r requirements.txt`.
3. Run migrations: `python manage.py migrate`.
4. Start the development server: `python manage.py runserver`.

### Frontend Setup
1. Navigate to the frontend folder.
2. Install dependencies: `npm install`.
3. Start the React app: `npm start`.

---

## 🧪 Testing

The system includes a comprehensive test suite covering:

- **Questions:** CRUD validation and tagging logic.
- **Answers & Notifications:** Integration tests for triggered alerts.
- **Dashboard:** Calculation of user statistics and reputation.
- **Tags:** Popularity sorting verification.

Run backend tests using: `python manage.py test`.

---

## 🔮 Future Enhancements

- AI-driven tag and question suggestions.
- Gamification with badges and reputation points.
- WebSocket-based real-time notifications.
- Mobile applications for iOS and Android.
- Integration with Learning Management Systems (LMS).

---

## 📄 License & Credits

**Prepared by:** Nourhan ElSheikh, Reem Khaled Ali, Sarah ElShinnawy, and Youssef Alaa-eldin.  
**Date:** December 2025
