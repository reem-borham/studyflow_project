import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import Navbar from "../../components/navbar";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import HistoryIcon from "@mui/icons-material/History";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SchoolIcon from "@mui/icons-material/School";
import StarIcon from "@mui/icons-material/Star";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { apiUrl, getServerUrl } from "../../config";

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
    username?: string;
    is_answered?: boolean;
}

interface Answer {
    id: number;
    body: string;
    question: number;
    question_title: string;
    created_at: string;
    vote_count: number;
    is_best_answer?: boolean;
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
}

interface InstructorStats {
    total_questions_platform: number;
    unanswered_questions: number;
    total_students: number;
    questions_answered_by_me: number;
    best_answers_given: number;
    answer_acceptance_rate: number;
}

type Tab = 'overview' | 'answered' | 'best-answers' | 'students';

// Empty initial states - data will be fetched from API

function InstructorDashboard() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [unansweredQuestions, setUnansweredQuestions] = useState<Question[]>([]);
    const [imageError, setImageError] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [instructorStats, setInstructorStats] = useState<InstructorStats>({
        total_questions_platform: 0,
        unanswered_questions: 0,
        total_students: 0,
        questions_answered_by_me: 0,
        best_answers_given: 0,
        answer_acceptance_rate: 0
    });

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
            const response = await fetch(apiUrl("api/upload-profile-image/"), {
                method: "POST",
                headers: { 'Authorization': `Token ${token}` },
                body: formData,
            });

            if (response.ok) {
                setImageError(false);  // Reset error state for new image
                fetchProfile();
                alert("Profile picture uploaded successfully!");
            }
        } catch (error) {
            alert("Upload failed. Please try again.");
        }
    };

    const handleRemovePhoto = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(apiUrl("api/upload-profile-image/"), {
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

            const response = await fetch(apiUrl("api/dashboard/"), {
                headers: { 'Authorization': `Token ${token}` }
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            if (response.ok) {
                const data: Profile = await response.json();
                // Redirect students away
                if (data.role !== 'instructor') {
                    navigate('/user');
                    return;
                }
                setProfile(data);

                // Compute real stats from profile data
                const answersCount = data.answers?.length || 0;
                const bestAnswersCount = data.answers?.filter(a => a.is_best_answer).length || 0;
                const acceptanceRate = answersCount > 0
                    ? Math.round((bestAnswersCount / answersCount) * 100 * 10) / 10
                    : 0;

                setInstructorStats(prev => ({
                    ...prev,
                    questions_answered_by_me: answersCount,
                    best_answers_given: bestAnswersCount,
                    answer_acceptance_rate: acceptanceRate
                }));
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
        }
    };

    const fetchUnansweredQuestions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(apiUrl("api/posts/?answered=false&limit=10"), {
                headers: { 'Authorization': `Token ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                const questions = data.results || data || [];
                setUnansweredQuestions(questions);

                // Update unanswered questions count in stats
                setInstructorStats(prev => ({
                    ...prev,
                    unanswered_questions: questions.length
                }));
            }

            // Also fetch total questions count
            const totalResponse = await fetch(apiUrl("api/posts/?limit=1"), {
                headers: { 'Authorization': `Token ${token}` }
            });
            if (totalResponse.ok) {
                const totalData = await totalResponse.json();
                const totalCount = totalData.count || totalData.length || 0;
                setInstructorStats(prev => ({
                    ...prev,
                    total_questions_platform: totalCount
                }));
            }
        } catch (error) {
            console.error("Failed to fetch unanswered questions", error);
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

    const bestAnswers = profile?.answers.filter(a => a.is_best_answer) || [];

    useEffect(() => {
        fetchProfile();
        fetchUnansweredQuestions();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="instructor-page">
            <Navbar />

            <div className="instructor-container">
                {/* Profile Header Section */}
                <div className="instructor-header">
                    <div className="header-left">
                        <div className="avatar-section">
                            <div className="avatar-wrapper" onClick={() => fileInputRef.current?.click()}>
                                <div className="avatar">
                                    {profile?.profile_picture && !imageError ? (
                                        <>
                                            <img
                                                src={`${getServerUrl()}${profile.profile_picture}`}
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
                                            <SchoolIcon style={{ fontSize: 48 }} />
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
                            <div className="role-badge instructor">
                                <SchoolIcon fontSize="small" />
                                Instructor
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
                        <div className="instructor-badge-large">
                            <SchoolIcon style={{ fontSize: 28 }} />
                            <span>Verified Instructor</span>
                        </div>
                        <button className="logout-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>

                {/* Instructor Statistics Dashboard */}
                <div className="stats-dashboard instructor-stats">
                    <div className="stat-card primary">
                        <div className="stat-icon">
                            <QuestionAnswerIcon />
                        </div>
                        <div className="stat-content">
                            <h3>{instructorStats.total_questions_platform}</h3>
                            <p>Total Questions</p>
                        </div>
                    </div>
                    <div className="stat-card warning">
                        <div className="stat-icon">
                            <QuestionAnswerIcon />
                        </div>
                        <div className="stat-content">
                            <h3>{instructorStats.unanswered_questions}</h3>
                            <p>Needs Attention</p>
                        </div>
                    </div>
                    <div className="stat-card success">
                        <div className="stat-icon">
                            <CheckCircleIcon />
                        </div>
                        <div className="stat-content">
                            <h3>{instructorStats.questions_answered_by_me}</h3>
                            <p>Questions Answered</p>
                        </div>
                    </div>
                    <div className="stat-card gold">
                        <div className="stat-icon">
                            <StarIcon />
                        </div>
                        <div className="stat-content">
                            <h3>{instructorStats.best_answers_given}</h3>
                            <p>Best Answers</p>
                        </div>
                    </div>
                    <div className="stat-card info">
                        <div className="stat-icon">
                            <PeopleIcon />
                        </div>
                        <div className="stat-content">
                            <h3>{instructorStats.total_students}</h3>
                            <p>Active Students</p>
                        </div>
                    </div>
                    <div className="stat-card purple">
                        <div className="stat-icon">
                            <TrendingUpIcon />
                        </div>
                        <div className="stat-content">
                            <h3>{instructorStats.answer_acceptance_rate}%</h3>
                            <p>Acceptance Rate</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="profile-tabs instructor-tabs">
                    <button
                        className={activeTab === 'overview' ? 'active' : ''}
                        onClick={() => setActiveTab('overview')}
                    >
                        <HistoryIcon fontSize="small" />
                        Overview
                    </button>
                    <button
                        className={activeTab === 'answered' ? 'active' : ''}
                        onClick={() => setActiveTab('answered')}
                    >
                        <CheckCircleIcon fontSize="small" />
                        Answered Questions
                    </button>
                    <button
                        className={activeTab === 'best-answers' ? 'active' : ''}
                        onClick={() => setActiveTab('best-answers')}
                    >
                        <StarIcon fontSize="small" />
                        Best Answers
                    </button>
                    <button
                        className={activeTab === 'students' ? 'active' : ''}
                        onClick={() => setActiveTab('students')}
                    >
                        <PeopleIcon fontSize="small" />
                        Student Activity
                    </button>
                </div>

                {/* Content Area */}
                <div className="tab-content">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="overview-section">
                            <div className="section-grid">
                                {/* Unanswered Questions Needing Attention */}
                                <div className="section-card urgent">
                                    <h2>
                                        <span className="urgent-icon">🔔</span>
                                        Questions Needing Your Expertise
                                    </h2>
                                    <div className="urgent-questions-list">
                                        {unansweredQuestions.slice(0, 5).map((q) => (
                                            <div
                                                key={q.id}
                                                className="urgent-question-item"
                                                onClick={() => navigate(`/question/${q.id}`)}
                                            >
                                                <div className="urgency-indicator"></div>
                                                <div className="question-info">
                                                    <h3>{q.title}</h3>
                                                    <div className="question-meta">
                                                        <span className="author">by {q.username || 'Anonymous'}</span>
                                                        <span className="time">{formatRelativeTime(q.created_at)}</span>
                                                    </div>
                                                    <div className="question-tags">
                                                        {q.tag_names.map((tag, idx) => (
                                                            <span key={idx} className="tag">#{tag}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="question-stats">
                                                    <span>👁️ {q.views}</span>
                                                    <span>⬆️ {q.vote_count}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {unansweredQuestions.length === 0 && (
                                            <p className="empty-state success-empty">
                                                🎉 All questions have been answered! Great job!
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="section-card">
                                    <h2>
                                        <HistoryIcon />
                                        Your Recent Activity
                                    </h2>
                                    <div className="activity-list">
                                        {profile?.answers.slice(0, 5).map((a) => (
                                            <div
                                                key={a.id}
                                                className="activity-item"
                                                onClick={() => navigate(`/question/${a.question}`)}
                                            >
                                                <div className={`activity-icon ${a.is_best_answer ? 'best' : 'answer'}`}>
                                                    {a.is_best_answer ? '⭐' : 'A'}
                                                </div>
                                                <div className="activity-content">
                                                    <p className="activity-title">
                                                        {a.is_best_answer && <span className="best-badge">BEST</span>}
                                                        {a.question_title || `Question #${a.question}`}
                                                    </p>
                                                    <span className="activity-time">{formatRelativeTime(a.created_at)}</span>
                                                </div>
                                                <div className="activity-votes">
                                                    ⬆️ {a.vote_count}
                                                </div>
                                            </div>
                                        ))}
                                        {(!profile?.answers || profile.answers.length === 0) && (
                                            <p className="empty-state">No answers yet. Start helping students!</p>
                                        )}
                                    </div>
                                </div>

                                {/* Instructor Summary */}
                                <div className="section-card summary">
                                    <h2>
                                        <TrendingUpIcon />
                                        Instructor Activity Summary
                                    </h2>
                                    <div className="summary-stats">
                                        <div className="summary-item">
                                            <div className="summary-value">{profile?.stats.questions_answered || 0}</div>
                                            <div className="summary-label">Total Answers</div>
                                        </div>
                                        <div className="summary-item">
                                            <div className="summary-value">{profile?.stats.breakdown?.answer_votes || 0}</div>
                                            <div className="summary-label">Total Upvotes</div>
                                        </div>
                                        <div className="summary-item">
                                            <div className="summary-value">{profile?.stats.reputation_score || 0}</div>
                                            <div className="summary-label">Reputation</div>
                                        </div>
                                        <div className="summary-item gold">
                                            <div className="summary-value">{bestAnswers.length}</div>
                                            <div className="summary-label">Best Answers</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Answered Questions Tab */}
                    {activeTab === 'answered' && (
                        <div className="answered-section">
                            <div className="section-header">
                                <h2>Questions You've Answered ({profile?.answers.length || 0})</h2>
                            </div>
                            <div className="answered-list">
                                {profile?.answers.map((answer) => (
                                    <div
                                        key={answer.id}
                                        className={`answered-card ${answer.is_best_answer ? 'best' : ''}`}
                                        onClick={() => navigate(`/question/${answer.question}`)}
                                    >
                                        {answer.is_best_answer && (
                                            <div className="best-answer-ribbon">
                                                <StarIcon fontSize="small" />
                                                Best Answer
                                            </div>
                                        )}
                                        <h3>{answer.question_title || `Question #${answer.question}`}</h3>
                                        <p className="answer-preview">{answer.body.substring(0, 150)}...</p>
                                        <div className="answered-meta">
                                            <span className="votes">⬆️ {answer.vote_count} votes</span>
                                            <span className="time">{formatRelativeTime(answer.created_at)}</span>
                                        </div>
                                    </div>
                                ))}
                                {(!profile?.answers || profile.answers.length === 0) && (
                                    <div className="empty-state-large">
                                        <QuestionAnswerIcon style={{ fontSize: 64, opacity: 0.3 }} />
                                        <p>No answers given yet</p>
                                        <button onClick={() => navigate('/explore')}>Browse questions to answer</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Best Answers Tab */}
                    {activeTab === 'best-answers' && (
                        <div className="best-answers-section">
                            <div className="section-header">
                                <h2>
                                    <StarIcon style={{ color: '#f59e0b' }} />
                                    Your Best Answers ({bestAnswers.length})
                                </h2>
                            </div>
                            <div className="best-answers-list">
                                {bestAnswers.length > 0 ? (
                                    bestAnswers.map((answer) => (
                                        <div
                                            key={answer.id}
                                            className="best-answer-card"
                                            onClick={() => navigate(`/question/${answer.question}`)}
                                        >
                                            <div className="gold-star">⭐</div>
                                            <div className="answer-content">
                                                <h3>{answer.question_title || `Question #${answer.question}`}</h3>
                                                <p>{answer.body.substring(0, 200)}...</p>
                                                <div className="answer-meta">
                                                    <span className="votes">⬆️ {answer.vote_count} votes</span>
                                                    <span className="time">{formatRelativeTime(answer.created_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state-large">
                                        <StarIcon style={{ fontSize: 64, opacity: 0.3, color: '#f59e0b' }} />
                                        <p>No best answers yet</p>
                                        <p className="hint">Keep answering questions! Students can mark your answers as "Best Answer"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Student Activity Tab */}
                    {activeTab === 'students' && (
                        <div className="students-section">
                            <div className="section-header">
                                <h2>Recent Student Interactions</h2>
                            </div>
                            <div className="students-activity">
                                <div className="students-grid">
                                    <div className="student-stat-card">
                                        <div className="student-stat-icon">👨‍🎓</div>
                                        <h3>{instructorStats.total_students}</h3>
                                        <p>Students Helped</p>
                                    </div>
                                    <div className="student-stat-card">
                                        <div className="student-stat-icon">💬</div>
                                        <h3>{profile?.answers.length || 0}</h3>
                                        <p>Answers Given</p>
                                    </div>
                                    <div className="student-stat-card">
                                        <div className="student-stat-icon">⭐</div>
                                        <h3>{bestAnswers.length}</h3>
                                        <p>Marked as Best</p>
                                    </div>
                                    <div className="student-stat-card">
                                        <div className="student-stat-icon">📈</div>
                                        <h3>{instructorStats.answer_acceptance_rate}%</h3>
                                        <p>Acceptance Rate</p>
                                    </div>
                                </div>

                                <div className="recent-interactions">
                                    <h3>Recent Interactions</h3>
                                    {profile?.answers.slice(0, 8).map((a) => (
                                        <div key={a.id} className="interaction-item" onClick={() => navigate(`/question/${a.question}`)}>
                                            <div className="interaction-icon">💬</div>
                                            <div className="interaction-content">
                                                <p>Answered: {a.question_title || `Question #${a.question}`}</p>
                                                <span>{formatRelativeTime(a.created_at)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default InstructorDashboard;
