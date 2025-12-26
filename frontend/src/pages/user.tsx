import { useState, useEffect } from "react";
import "./user.css";
import Card from "../components/posts";
import { Container } from "@mui/material";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";

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
}

interface Answer {
  id: number;
  body: string;
  question: number;
  question_title: string;
  created_at: string;
  vote_count: number;
}

interface Profile {
  username: string;
  email: string;
  role: string;
  profile_picture: string | null;
  questions: Question[];
  answers: Answer[];
  stats: Stats;
}

type Tab = 'dashboard' | 'posts' | 'answers';

function UserProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostBody, setNewPostBody] = useState("");
  const [newPostTags, setNewPostTags] = useState("");

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadImage(file);
    }
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        "http://127.0.0.1:8000/api/upload-profile-image/",
        {
          method: "POST",
          headers: {
            'Authorization': `Token ${token}`
          },
          body: formData,
        }
      );

      if (response.ok) {
        fetchProfile();
      } else {
        const errorData = await response.json();
        console.error("Upload failed", errorData);
        alert(`Upload failed: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed. Please try again.");
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error("No token found");
        return;
      }

      const response = await fetch("http://127.0.0.1:8000/api/dashboard/", {
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (response.ok) {
        const data: Profile = await response.json();

        // Redirect instructors to their specialized dashboard
        if (data.role === 'instructor') {
          window.location.href = '/instructor';
          return;
        }

        setProfile(data);
      } else {
        console.error("Failed to fetch dashboard");
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
    }
  };

  const handleCreatePost = async () => {
    // Logic to submit the post
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

      if (response.status === 401) {
        alert("Your session has expired. Please log in again.");
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (response.ok) {
        // Close modal, clear inputs, refresh profile
        setIsModalOpen(false);
        setNewPostTitle("");
        setNewPostBody("");
        setNewPostTags("");
        setActiveTab('posts'); // Switch to posts tab to see the new item
        fetchProfile(); // Refresh list
        alert("Question posted successfully!");
      } else {
        const errorData = await response.json();
        console.error("Failed to post question", errorData);
        alert(`Failed to post question: ${JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error("Error posting question", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <Container className="user profile-container">
      {/* Top Profile Header */}
      <div className="profile-header">
        <label className="avatar-wrapper">
          <div className="avatar">
            {profile?.profile_picture ? (
              <img src={`http://127.0.0.1:8000${profile.profile_picture}`} alt="profile" />
            ) : (
              <div className="placeholder">Upload</div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />
          <div className="edit-overlay">Edit</div>
        </label>

        <div className="user-info">
          {profile && (
            <>
              <h2>{profile.username}</h2>
              <div className="user-meta">
                <p className="email">{profile.email}</p>
                <span className={`role-badge ${profile.role}`}>
                  {profile.role === 'instructor' ? 'Instructor' : ' Student'}
                </span>
              </div>

            </>
          )}
        </div>

        <button className="create-post-btn" onClick={() => setIsModalOpen(true)}>
          <QuestionAnswerIcon style={{ fontSize: '20px' }} />
          Ask Question
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="profile-tabs">
        <button
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={activeTab === 'posts' ? 'active' : ''}
          onClick={() => setActiveTab('posts')}
        >
          Posts
        </button>
        <button
          className={activeTab === 'answers' ? 'active' : ''}
          onClick={() => setActiveTab('answers')}
        >
          Answers
        </button>
      </div>

      {/* Content Area */}
      <div className="tab-content">
        {activeTab === 'dashboard' && profile && (
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Questions Asked</h3>
              <p>{profile.stats.questions_asked}</p>
            </div>
            <div className="stat-card">
              <h3>Answers Given</h3>
              <p>{profile.stats.questions_answered}</p>
            </div>
            <div className="stat-card">
              <h3>Question Votes</h3>
              <p>{profile.stats.breakdown.question_votes}</p>
            </div>
            <div className="stat-card">
              <h3>Answer Votes</h3>
              <p>{profile.stats.breakdown.answer_votes}</p>
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
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
            {profile?.questions.length === 0 && <p className="empty-state">No questions asked yet.</p>}
          </div>
        )}

        {activeTab === 'answers' && (
          <div className="cards-grid">
            {profile?.answers.map((answer) => (
              <Card
                key={answer.id}
                id={answer.question}
                title={`Answer to: ${answer.question_title || '#' + answer.question}`}
                content={answer.body}
                username={profile.username}
                stats={{
                  votes: answer.vote_count
                }}
              />
            ))}
            {profile?.answers.length === 0 && <p className="empty-state">No answers given yet.</p>}
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
              placeholder="What's on your mind?"
              value={newPostBody}
              onChange={e => setNewPostBody(e.target.value)}
              className="modal-textarea"
            />
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={newPostTags}
              onChange={e => setNewPostTags(e.target.value)}
              className="modal-input"
            />
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="submit-btn" onClick={handleCreatePost}>Post</button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

export default UserProfile;
