Missing Routes (Database Models with NO API)# Core API Endpoints Documentation

This document describes all the API endpoints for the core features: Voting, Comments, Best Answer, Reporting, Tags, and Notifications.

## Base URL
```
http://localhost:8000/api/
```

---

## 🗳️ Voting API

### Cast a Vote
**POST** `/votes/`

Cast an upvote or downvote on a question or answer.

**Authentication:** Required

**Request Body:**
```json
{
  "vote_type": "up",  // "up" or "down"
  "content_type": "question",  // "question" or "answer"
  "object_id": 1
}
```

**Response (201 Created):**
```json
{
  "message": "Vote created",
  "action": "created",  // "created", "changed", or "removed"
  "vote_type": "up"
}
```

**Behavior:**
- Clicking the same vote button removes the vote
- Clicking the opposite vote button changes the vote

### List Votes
**GET** `/votes/list/?content_type=question&object_id=1`

Get all votes for a specific question or answer.

**Authentication:** Not required

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user": 2,
    "username": "john_doe",
    "vote_type": "up",
    "timestamp": "2025-01-20T10:30:00Z"
  }
]
```

---

## 💬 Comments API

### List Comments
**GET** `/comments/?content_type=question&object_id=1`

Get all comments for a specific question or answer.

**Authentication:** Not required

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user": 2,
    "username": "jane_smith",
    "content": "Great question!",
    "created_at": "2025-01-20T10:00:00Z",
    "updated_at": "2025-01-20T10:00:00Z",
    "is_edited": false,
    "parent_comment": null,
    "replies_count": 2
  }
]
```

### Create Comment
**POST** `/comments/`

Add a comment to a question or answer.

**Authentication:** Required

**Request Body:**
```json
{
  "content": "This is my comment",
  "content_type": "question",  // "question" or "answer"
  "object_id": 1,
  "parent_comment": null  // Optional: ID of parent comment for replies
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "user": 2,
  "username": "jane_smith",
  "content": "This is my comment",
  "created_at": "2025-01-20T10:00:00Z",
  "replies_count": 0
}
```

### Update Comment
**PATCH** `/comments/{id}/`

Update your own comment.

**Authentication:** Required (must be comment author)

**Request Body:**
```json
{
  "content": "Updated comment content"
}
```

### Delete Comment
**DELETE** `/comments/{id}/`

Delete your own comment.

**Authentication:** Required (must be comment author)

**Response:** 204 No Content

---

## ✅ Best Answer API

### Mark Best Answer
**POST** `/answers/{answer_id}/mark-best/`

Mark an answer as the best answer.

**Authentication:** Required (must be question author)

**Response (200 OK):**
```json
{
  "message": "Answer marked as best",
  "answer_id": 5
}
```

**Error Responses:**
- `403 Forbidden`: Only question author can mark best answer
- `404 Not Found`: Answer doesn't exist

---

## 🚩 Reporting API

### Create Report
**POST** `/reports/`

Report inappropriate content.

**Authentication:** Required

**Request Body:**
```json
{
  "report_type": "spam",  // "spam", "harassment", "inappropriate", "copyright", "other"
  "description": "This content is spam",
  "content_type": "question",  // "question", "answer", or "comment"
  "object_id": 1
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "reporter": 2,
  "reporter_username": "john_doe",
  "report_type": "spam",
  "description": "This content is spam",
  "status": "pending",
  "created_at": "2025-01-20T10:00:00Z"
}
```

### List Reports (Admin Only)
**GET** `/reports/list/`

List all reports.

**Authentication:** Required (Admin/Staff only)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "reporter_username": "john_doe",
    "report_type": "spam",
    "description": "This content is spam",
    "status": "pending",
    "created_at": "2025-01-20T10:00:00Z",
    "resolved_at": null,
    "resolved_by_username": null,
    "admin_notes": ""
  }
]
```

### Resolve Report (Admin Only)
**POST** `/reports/{report_id}/resolve/`

Resolve a report.

**Authentication:** Required (Admin/Staff only)

**Request Body:**
```json
{
  "status": "resolved",  // "resolved", "removed", "dismissed"
  "admin_notes": "Not spam, false report"
}
```

**Response (200 OK):**
```json
{
  "message": "Report resolved",
  "report_id": 1,
  "status": "resolved"
}
```

---

## 🏷️ Tags API

### List Tags
**GET** `/tags/`

Get all tags ordered by usage count.

**Authentication:** Not required

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "python",
    "description": "Python programming language",
    "usage_count": 150
  },
  {
    "id": 2,
    "name": "django",
    "description": "Django web framework",
    "usage_count": 100
  }
]
```

### Create Tag
**POST** `/tags/`

Create a new tag.

**Authentication:** Not required

**Request Body:**
```json
{
  "name": "javascript",
  "description": "JavaScript programming language"
}
```

### Get Tag Details
**GET** `/tags/{id}/`

Get details of a specific tag.

**Authentication:** Not required

---

## 🔔 Notifications API

### List Notifications
**GET** `/notifications/`

Get all notifications for the authenticated user.

**Authentication:** Required

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "notification_type": "answer",
    "message": "john_doe answered your question",
    "is_read": false,
    "created_at": "2025-01-20T10:00:00Z",
    "link": "/questions/5",
    "actor_username": "john_doe"
  }
]
```

### Mark Notification as Read
**POST** `/notifications/{id}/mark-read/`

Mark a notification as read.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "status": "marked as read"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "error": "You don't have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "error": "Object not found"
}
```

---

## Testing

Run the comprehensive test suite:

```bash
cd backend
python manage.py test core.tests --verbosity=2
```

Run specific test cases:

```bash
python manage.py test core.tests.VotingAPITestCase
python manage.py test core.tests.CommentAPITestCase
python manage.py test core.tests.BestAnswerAPITestCase
python manage.py test core.tests.ReportAPITestCase
python manage.py test core.tests.TagAPITestCase
```

Generate coverage report:

```bash
coverage run --source='core' manage.py test core
coverage report
coverage html
```

---

## GitHub Actions

All tests run automatically on push/pull request via GitHub Actions.

See `.github/workflows/django-tests.yml` for the CI/CD configuration.
