# Backend Requirements Specification: StudyFlow

## 1. User Management & Authentication (`users` app)
### Features
- **Registration**: Users allow to register as `Student` (default) or `Instructor`.
  - *Endpoint*: `POST /api/register/` (Returns Auth Token)
- **Login**: Token-based authentication using username/password.
  - *Endpoint*: `POST /api/login/` (Returns Auth Token)
- **Profile Management**: Users can upload/update their profile picture.
  - *Endpoint*: `POST /api/profile/upload-avatar/`
- **User Dashboard**: A personalized view showing user stats and history.
  - *Endpoint*: `GET /api/dashboard/`
  - *Data*: Questions asked, Answers given, Reputation score (Upvotes - Downvotes).

### Test Cases
- [x] **Register Student**: Verify a user can sign up and receives a token.
- [x] **Login**: Verify valid credentials return a token; invalid return 4xx.
- [x] **Dashboard Data**: Verify the dashboard correctly counts questions, answers, and calculates reputation score based on votes.
- [ ] **Profile Picture**: Verify image upload works and updates the user model.

## 2. Questions & Tagging (`questions` app)
### Features
- **Create Question**: Authenticated users can post a question with a title, body, and tags.
  - *Endpoint*: `POST /api/posts/`
  - *Logic*: Automatically assigns the current user as the author.
- **List Questions**: View a list of all questions (Public access).
  - *Endpoint*: `GET /api/posts/`
- **Question Detail**: View, Update, or Delete a specific question.
  - *Endpoint*: `GET/PUT/DELETE /api/posts/<id>/`
  - *Permissions*: Only the author (or admin) can Update/Delete.
- **Popular Tags**: Retrieve the top 5 most used tags for sidebar navigation.
  - *Endpoint*: `GET /api/tags/popular/`

### Test Cases
- [x] **Create Question**: Verify specific fields (title, body, tags) are saved.
- [x] **Update Question**: Verify an author can change the title/body/tags.
- [x] **Delete Question**: Verify the record is removed from the DB.
- [x] **Popular Tags**: Verify the API returns tags ordered by `usage_count`.
- [ ] **Tags Logic**: Verify reuse of existing tags vs creation of new ones.

## 3. Answers (`answers` app)
### Features
- **Answer Question**: Authenticated users can post an answer to a specific question.
  - *Endpoint*: `POST /api/answers/`
- **List Answers**: Retrieve answers. *Note: Currently acts as a global list; likely needs filtering by question ID.*
  - *Endpoint*: `GET /api/answers/`
- **Best Answer**: *Feature present in Database (`is_best_answer`) but currently **missing API endpoint**.*

### Test Cases
- [x] **Post Answer**: Verify an answer is linked to the correct question and user.
- [x] **Answer Notification**: Verify that posting an answer triggers a notification for the question author.

## 4. Notifications & Core Interactions (`core` app)
### Features
- **Notifications**: Users receive system alerts for interactions (e.g., "Instructor answered your question").
  - *Endpoint*: `GET /api/notifications/`
- **Mark Read**: Users can mark notifications as read.
  - *Endpoint*: `POST /api/notifications/<id>/read/`
- **Voting**: *Model exists (`Vote`) for Up/Down votes on Questions/Answers, but API endpoints are currently **missing**.*
- **Comments**: *Model exists (`Comment`) for threaded discussions, but API endpoints are currently **missing**.*
- **Reports**: *Model exists (`Report`) for moderation, but API endpoints are currently **missing**.*

### Test Cases
- [x] **Receive Notification**: Verify the system generates a `Notification` object when triggers occur (e.g. Question Posted, Answered).
- [x] **Mark Read**: Verify the `is_read` status toggles after calling the endpoint.
- [ ] **Voting Logic**: (Pending API) Verify user cannot double-vote or vote on own content (if restricted).

## System Gaps (To Be Implemented)
During research, I observed these features exist in the Database (`models.py`) but are NOT yet exposed in the API (`views.py`):
1.  **Voting API**: No endpoints to Cast/Revoke votes.
2.  **Comments API**: No endpoints to Add/View comments.
3.  **Best Answer**: Logic exists in `Answer` model (`mark_as_best`), but no view invokes it.
4.  **Reports**: No endpoints for users to report content or admins to review it.
