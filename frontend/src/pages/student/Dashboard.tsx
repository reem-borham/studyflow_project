import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import Card from "../../components/posts";
import Navbar from "../../components/navbar";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import HistoryIcon from "@mui/icons-material/History";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { API_BASE_URL } from "../../config/api";

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

type Tab = 'dashboard' | 'questions' | 'answers' | 'activity';

function StudentDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const response = await fetch(`${API_BASE_URL}/upload-profile-image/`, {
        method: "POST",
        headers: { 'Authorization': `Token ${token}` },
        body: formData,
      });

      if (response.ok) {
        setImageError(false);  // Reset error state for new image
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
      const response = await fetch(`${API_BASE_URL}/upload-profile-image/`, {
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

      const response = await fetch(`${API_BASE_URL}/dashboard/`, {
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
      const response = await fetch(`${API_BASE_URL}/posts/`, {
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
              <div className="avatar-wrapper" onClick={() => fileInputRef.current?.click()}>
                <div className="avatar">
                  {profile?.profile_picture && !imageError ? (
                    <>
                      <img
                        src={`${API_BASE_URL.replace('/api', '')}${profile.profile_picture}`}
                        alt="profile"
                        onError={() => setImageError(true)}
                        onLoad={() => setImageError(false)}
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
                        type="button"
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
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <div className="edit-overlay">
                  {profile?.profile_picture ? 'Change' : 'Upload'}
                </div>
              </div>
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
