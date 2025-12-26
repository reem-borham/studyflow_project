import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import Card from "../../components/posts";
import Navbar from "../../components/navbar";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HistoryIcon from "@mui/icons-material/History";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

interface Stats {
  questions_asked: number;
  questions_answered: number;
  reputation_score: number;
  breakdown: {
    question_votes: number;
    answer_votes: number;
  };
}

interface Question {
  id: number;
  title: string;
  body: string;
  tag_names: string[];
  created_at: string;
  views: number;
  vote_count: number;
  comment_count: number;
  is_answered?: boolean;
}

interface Answer {
  id: number;
  body: string;
  question: number;
  question_title: string;
  created_at: string;
  vote_count: number;
}

interface Notification {
  id: number;
  type: 'answer' | 'reply' | 'system';
  message: string;
  is_read: boolean;
  created_at: string;
  question_id?: number;
}

interface Profile {
  username: string;
  email: string;
  role: string;
  profile_picture: string | null;
  questions: Question[];
  answers: Answer[];
  stats: Stats;
  date_joined?: string;
  last_login?: string;
  notifications?: Notification[];
}

type Tab = 'dashboard' | 'questions' | 'answers' | 'notifications' | 'activity';

// Dummy notifications for demo
const dummyNotifications: Notification[] = [
  { id: 1, type: 'answer', message: 'Your question "Python list comprehension" received an answer', is_read: false, created_at: new Date().toISOString(), question_id: 1 },
  { id: 2, type: 'reply', message: 'New reply on "React hooks explained"', is_read: false, created_at: new Date(Date.now() - 3600000).toISOString(), question_id: 2 },
  { id: 3, type: 'system', message: 'Welcome to StudyFlow! Complete your profile.', is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
];

function StudentDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [notifications, setNotifications] = useState<Notification[]>(dummyNotifications);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostBody, setNewPostBody] = useState("");
  const [newPostTags, setNewPostTags] = useState("");

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadImage(file);
    }
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("profile_picture", file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://127.0.0.1:8000/api/upload-profile-image/", {
        method: "POST",
        headers: { 'Authorization': `Token ${token}` },
        body: formData,
      });

      if (response.ok) {
        fetchProfile();
        alert("Profile picture uploaded successfully!");
      } else {
        const errorData = await response.json();
        alert(`Upload failed: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      alert("Upload failed. Please try again.");
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://127.0.0.1:8000/api/upload-profile-image/", {
        method: "DELETE",
        headers: { 'Authorization': `Token ${token}` }
      });

      if (response.ok) {
        fetchProfile();
        alert("Profile picture removed successfully!");
      }
    } catch (error) {
      alert("Remove failed. Please try again.");
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/api/dashboard/", {
        headers: { 'Authorization': `Token ${token}` }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (response.ok) {
        const data: Profile = await response.json();
        // Redirect instructors away from student dashboard
        if (data.role === 'instructor') {
          navigate('/user');
          return;
        }
        setProfile(data);
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostTitle || !newPostBody) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://127.0.0.1:8000/api/posts/", {
        method: "POST",
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newPostTitle,
          body: newPostBody,
          tags: newPostTags.split(',').map(t => t.trim()).filter(t => t)
        })
      });

      if (response.ok) {
        setIsModalOpen(false);
        setNewPostTitle("");
        setNewPostBody("");
        setNewPostTags("");
        setActiveTab('questions');
        fetchProfile();
        alert("Question posted successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to post question: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error("Error posting question", error);
    }
  };

  const markNotificationRead = (id: number) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, is_read: true } : n
    ));
  };

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const pendingQuestions = profile?.questions.filter(q => q.comment_count === 0) || [];

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="profile-page">
      <Navbar />

      <div className="profile-container">
        {/* Profile Header Section */}
        <div className="profile-header">
          <div className="header-left">
            <div className="avatar-section">
              <label className="avatar-wrapper">
                <div className="avatar">
                  {profile?.profile_picture ? (
                    <>
                      <img
                        src={`http://127.0.0.1:8000${profile.profile_picture}`}
                        alt="profile"
                        onError={(e) => {
                          // Hide broken image and show placeholder
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <button
                        className="remove-photo-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (window.confirm('Remove profile picture?')) {
                            handleRemovePhoto();
                          }
                        }}
                        title="Remove photo"
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <div className="placeholder">
                      <PersonIcon style={{ fontSize: 48 }} />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
                <div className="edit-overlay">
                  {profile?.profile_picture ? 'Change' : 'Upload'}
                </div>
              </label>
            </div>

            <div className="user-info">
              <h1 className="username">{profile?.username}</h1>
              <p className="email">{profile?.email}</p>
              <div className="role-badge student">
                <PersonIcon fontSize="small" />
                Student
              </div>
              <div className="user-meta-info">
                <span className="meta-item">
                  <CalendarTodayIcon fontSize="small" />
                  Joined {formatDate(profile?.date_joined)}
                </span>
                <span className="meta-item">
                  <AccessTimeIcon fontSize="small" />
                  Last active {formatRelativeTime(profile?.last_login)}
                </span>
              </div>
            </div>
          </div>

          <div className="header-right">
            <button className="ask-question-btn" onClick={() => setIsModalOpen(true)}>
              <QuestionAnswerIcon />
              Ask Question
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="stats-dashboard">
          <div className="stat-card">
            <div className="stat-icon questions">
              <HelpOutlineIcon />
            </div>
            <div className="stat-content">
              <h3>{profile?.stats.questions_asked || 0}</h3>
              <p>Questions Asked</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon answers">
              <QuestionAnswerIcon />
            </div>
            <div className="stat-content">
              <h3>{profile?.stats.questions_answered || 0}</h3>
              <p>Answers Given</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon reputation">
              <span className="reputation-icon">⭐</span>
            </div>
            <div className="stat-content">
              <h3>{profile?.stats.reputation_score || 0}</h3>
              <p>Reputation Score</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">
              <span className="pending-icon">⏳</span>
            </div>
            <div className="stat-content">
              <h3>{pendingQuestions.length}</h3>
              <p>Pending Questions</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="profile-tabs">
          <button
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            <HistoryIcon fontSize="small" />
            Dashboard
          </button>
          <button
            className={activeTab === 'questions' ? 'active' : ''}
            onClick={() => setActiveTab('questions')}
          >
            <HelpOutlineIcon fontSize="small" />
            My Questions
          </button>
          <button
            className={activeTab === 'answers' ? 'active' : ''}
            onClick={() => setActiveTab('answers')}
          >
            <QuestionAnswerIcon fontSize="small" />
            My Answers
          </button>
          <button
            className={activeTab === 'notifications' ? 'active' : ''}
            onClick={() => setActiveTab('notifications')}
          >
            <NotificationsIcon fontSize="small" />
            Notifications
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
          </button>
        </div>

        {/* Content Area */}
        <div className="tab-content">
          {/* Dashboard Tab - Overview */}
          {activeTab === 'dashboard' && (
            <div className="dashboard-overview">
              <div className="section-grid">
                {/* Recent Activity */}
                <div className="section-card">
                  <h2>
                    <HistoryIcon />
                    Recent Activity
                  </h2>
                  <div className="activity-list">
                    {profile?.questions.slice(0, 3).map((q) => (
                      <div key={q.id} className="activity-item" onClick={() => navigate(`/question/${q.id}`)}>
                        <div className="activity-icon question">Q</div>
                        <div className="activity-content">
                          <p className="activity-title">{q.title}</p>
                          <span className="activity-time">{formatRelativeTime(q.created_at)}</span>
                        </div>
                      </div>
                    ))}
                    {profile?.answers.slice(0, 3).map((a) => (
                      <div key={a.id} className="activity-item" onClick={() => navigate(`/question/${a.question}`)}>
                        <div className="activity-icon answer">A</div>
                        <div className="activity-content">
                          <p className="activity-title">Answered: {a.question_title || `Question #${a.question}`}</p>
                          <span className="activity-time">{formatRelativeTime(a.created_at)}</span>
                        </div>
                      </div>
                    ))}
                    {(!profile?.questions.length && !profile?.answers.length) && (
                      <p className="empty-state">No recent activity</p>
                    )}
                  </div>
                </div>

                {/* Pending Questions */}
                <div className="section-card">
                  <h2>
                    <span>⏳</span>
                    Pending Questions
                  </h2>
                  <div className="pending-list">
                    {pendingQuestions.slice(0, 5).map((q) => (
                      <div key={q.id} className="pending-item" onClick={() => navigate(`/question/${q.id}`)}>
                        <span className="pending-title">{q.title}</span>
                        <span className="pending-time">{formatRelativeTime(q.created_at)}</span>
                      </div>
                    ))}
                    {pendingQuestions.length === 0 && (
                      <p className="empty-state">All questions have been answered! 🎉</p>
                    )}
                  </div>
                </div>

                {/* Recent Notifications */}
                <div className="section-card">
                  <h2>
                    <NotificationsIcon />
                    Recent Notifications
                  </h2>
                  <div className="notification-list">
                    {notifications.slice(0, 3).map((n) => (
                      <div
                        key={n.id}
                        className={`notification-item ${n.is_read ? 'read' : 'unread'}`}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.question_id) navigate(`/question/${n.question_id}`);
                        }}
                      >
                        <div className={`notification-icon ${n.type}`}>
                          {n.type === 'answer' ? '💬' : n.type === 'reply' ? '↩️' : '🔔'}
                        </div>
                        <div className="notification-content">
                          <p>{n.message}</p>
                          <span>{formatRelativeTime(n.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* My Questions Tab */}
          {activeTab === 'questions' && (
            <div className="questions-section">
              <div className="section-header">
                <h2>My Questions ({profile?.questions.length || 0})</h2>
                <button className="ask-btn" onClick={() => setIsModalOpen(true)}>
                  + Ask New Question
                </button>
              </div>
              <div className="cards-grid">
                {profile?.questions.map((question) => (
                  <Card
                    key={question.id}
                    id={question.id}
                    title={question.title}
                    content={question.body}
                    username={profile.username}
                    stats={{
                      votes: question.vote_count,
                      views: question.views,
                      answers: question.comment_count
                    }}
                  />
                ))}
                {profile?.questions.length === 0 && (
                  <div className="empty-state-large">
                    <HelpOutlineIcon style={{ fontSize: 64, opacity: 0.3 }} />
                    <p>No questions asked yet</p>
                    <button onClick={() => setIsModalOpen(true)}>Ask your first question</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* My Answers Tab */}
          {activeTab === 'answers' && (
            <div className="answers-section">
              <div className="section-header">
                <h2>My Answers ({profile?.answers.length || 0})</h2>
              </div>
              <div className="cards-grid">
                {profile?.answers.map((answer) => (
                  <Card
                    key={answer.id}
                    id={answer.question}
                    title={`Answer to: ${answer.question_title || '#' + answer.question}`}
                    content={answer.body}
                    username={profile?.username || ''}
                    stats={{ votes: answer.vote_count }}
                  />
                ))}
                {profile?.answers.length === 0 && (
                  <div className="empty-state-large">
                    <QuestionAnswerIcon style={{ fontSize: 64, opacity: 0.3 }} />
                    <p>No answers given yet</p>
                    <button onClick={() => navigate('/explore')}>Browse questions to answer</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="notifications-section">
              <div className="section-header">
                <h2>Notifications</h2>
                {unreadCount > 0 && (
                  <button className="mark-read-btn" onClick={markAllNotificationsRead}>
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="notifications-list-full">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`notification-card ${n.is_read ? 'read' : 'unread'}`}
                    onClick={() => {
                      markNotificationRead(n.id);
                      if (n.question_id) navigate(`/question/${n.question_id}`);
                    }}
                  >
                    <div className={`notification-type-icon ${n.type}`}>
                      {n.type === 'answer' ? '💬' : n.type === 'reply' ? '↩️' : '🔔'}
                    </div>
                    <div className="notification-details">
                      <p className="notification-message">{n.message}</p>
                      <span className="notification-time">{formatRelativeTime(n.created_at)}</span>
                    </div>
                    {!n.is_read && <div className="unread-dot"></div>}
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="empty-state-large">
                    <NotificationsIcon style={{ fontSize: 64, opacity: 0.3 }} />
                    <p>No notifications yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Create Post Modal */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>Ask a Question</h3>
              <input
                type="text"
                placeholder="Title"
                value={newPostTitle}
                onChange={e => setNewPostTitle(e.target.value)}
                className="modal-input"
              />
              <textarea
                placeholder="Describe your question in detail..."
                value={newPostBody}
                onChange={e => setNewPostBody(e.target.value)}
                className="modal-textarea"
                rows={6}
              />
              <input
                type="text"
                placeholder="Tags (comma separated, e.g., python, react)"
                value={newPostTags}
                onChange={e => setNewPostTags(e.target.value)}
                className="modal-input"
              />
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button className="submit-btn" onClick={handleCreatePost}>Post Question</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
