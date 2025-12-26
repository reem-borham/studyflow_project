import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./InstructorDashboard.css";
import Navbar from "../components/navbar";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SchoolIcon from "@mui/icons-material/School";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";

interface Question {
    id: number;
    title: string;
    body: string;
    tag_names: string[];
    created_at: string;
    views: number;
    vote_count: number;
    comment_count: number;
    username: string;
}

interface InstructorStats {
    total_questions_platform: number;
    unanswered_questions: number;
    total_students: number;
    questions_answered_by_me: number;
    my_answer_acceptance_rate: number;
    trending_topics: Array<{ name: string; count: number }>;
}

export default function InstructorDashboard() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState<InstructorStats | null>(null);
    const [recentQuestions, setRecentQuestions] = useState<Question[]>([]);
    const [unansweredQuestions, setUnansweredQuestions] = useState<Question[]>([]);
    const [activeView, setActiveView] = useState<'overview' | 'unanswered' | 'trending'>('overview');

    useEffect(() => {
        fetchProfile();
        fetchInstructorStats();
        fetchRecentQuestions();
        fetchUnansweredQuestions();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch("http://127.0.0.1:8000/api/dashboard/", {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            if (response.ok) {
                const data = await response.json();
                setProfile(data);

                // Check if user is actually an instructor
                if (data.role !== 'instructor') {
                    navigate('/user'); // Redirect students to regular user page
                }
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
        }
    };

    const fetchInstructorStats = async () => {
        // Mock stats for now - in production, create a dedicated API endpoint
        setStats({
            total_questions_platform: 142,
            unanswered_questions: 18,
            total_students: 87,
            questions_answered_by_me: 45,
            my_answer_acceptance_rate: 82.5,
            trending_topics: [
                { name: "Python", count: 34 },
                { name: "JavaScript", count: 28 },
                { name: "React", count: 22 },
                { name: "Django", count: 19 },
                { name: "CSS", count: 15 }
            ]
        });
    };

    const fetchRecentQuestions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch("http://127.0.0.1:8000/api/posts/?limit=5", {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setRecentQuestions(data.results || data);
            }
        } catch (error) {
            console.error("Failed to fetch questions", error);
        }
    };

    const fetchUnansweredQuestions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch("http://127.0.0.1:8000/api/posts/?answered=false&limit=10", {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUnansweredQuestions(data.results || data);
            }
        } catch (error) {
            console.error("Failed to fetch unanswered questions", error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="instructor-dashboard">
            <Navbar />

            <div className="dashboard-container">
                {/* Header Section */}
                <div className="dashboard-header">
                    <div className="header-content">
                        <div className="welcome-section">
                            <h1>Instructor Dashboard</h1>
                            <p>Welcome back, <strong>{profile?.username}</strong></p>
                        </div>
                        <div className="instructor-badge">
                            <SchoolIcon />
                            <span>Instructor</span>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="stats-grid">
                    <div className="stat-card primary">
                        <div className="stat-icon">
                            <QuestionAnswerIcon />
                        </div>
                        <div className="stat-content">
                            <h3>{stats?.total_questions_platform || 0}</h3>
                            <p>Total Questions</p>
                        </div>
                    </div>

                    <div className="stat-card warning">
                        <div className="stat-icon">
                            <NotificationsActiveIcon />
                        </div>
                        <div className="stat-content">
                            <h3>{stats?.unanswered_questions || 0}</h3>
                            <p>Needs Attention</p>
                        </div>
                    </div>

                    <div className="stat-card success">
                        <div className="stat-icon">
                            <PeopleIcon />
                        </div>
                        <div className="stat-content">
                            <h3>{stats?.total_students || 0}</h3>
                            <p>Active Students</p>
                        </div>
                    </div>

                    <div className="stat-card info">
                        <div className="stat-icon">
                            <TrendingUpIcon />
                        </div>
                        <div className="stat-content">
                            <h3>{stats?.my_answer_acceptance_rate || 0}%</h3>
                            <p>Answer Rate</p>
                        </div>
                    </div>
                </div>

                {/* View Toggle */}
                <div className="view-toggle">
                    <button
                        className={activeView === 'overview' ? 'active' : ''}
                        onClick={() => setActiveView('overview')}
                    >
                        <AssessmentIcon />
                        Overview
                    </button>
                    <button
                        className={activeView === 'unanswered' ? 'active' : ''}
                        onClick={() => setActiveView('unanswered')}
                    >
                        <NotificationsActiveIcon />
                        Unanswered ({stats?.unanswered_questions || 0})
                    </button>
                    <button
                        className={activeView === 'trending' ? 'active' : ''}
                        onClick={() => setActiveView('trending')}
                    >
                        <TrendingUpIcon />
                        Trending Topics
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="dashboard-content">
                    {activeView === 'overview' && (
                        <div className="overview-section">
                            <div className="content-card">
                                <h2>Recent Questions</h2>
                                <div className="questions-list">
                                    {recentQuestions.map((question) => (
                                        <div
                                            key={question.id}
                                            className="question-item"
                                            onClick={() => navigate(`/question/${question.id}`)}
                                        >
                                            <div className="question-header">
                                                <h3>{question.title}</h3>
                                                <div className="question-meta">
                                                    <span className="author">by {question.username}</span>
                                                    <span className="time">{formatDate(question.created_at)}</span>
                                                </div>
                                            </div>
                                            <p className="question-body">{question.body.substring(0, 150)}...</p>
                                            <div className="question-stats">
                                                <span className="stat-item">
                                                    <QuestionAnswerIcon fontSize="small" />
                                                    {question.comment_count} answers
                                                </span>
                                                <span className="stat-item">👁️ {question.views} views</span>
                                                <span className="stat-item">⬆️ {question.vote_count} votes</span>
                                            </div>
                                            <div className="question-tags">
                                                {question.tag_names.map((tag, idx) => (
                                                    <span key={idx} className="tag">#{tag}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeView === 'unanswered' && (
                        <div className="unanswered-section">
                            <div className="content-card">
                                <h2>Questions Needing Your Expertise</h2>
                                <div className="questions-list">
                                    {unansweredQuestions.length > 0 ? (
                                        unansweredQuestions.map((question) => (
                                            <div
                                                key={question.id}
                                                className="question-item urgent"
                                                onClick={() => navigate(`/question/${question.id}`)}
                                            >
                                                <div className="urgency-indicator"></div>
                                                <div className="question-header">
                                                    <h3>{question.title}</h3>
                                                    <div className="question-meta">
                                                        <span className="author">by {question.username}</span>
                                                        <span className="time">{formatDate(question.created_at)}</span>
                                                    </div>
                                                </div>
                                                <p className="question-body">{question.body.substring(0, 200)}...</p>
                                                <div className="question-stats">
                                                    <span className="stat-item">👁️ {question.views} views</span>
                                                    <span className="stat-item">⬆️ {question.vote_count} votes</span>
                                                </div>
                                                <div className="question-tags">
                                                    {question.tag_names.map((tag, idx) => (
                                                        <span key={idx} className="tag">#{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-state">
                                            <SchoolIcon style={{ fontSize: '64px', opacity: 0.3 }} />
                                            <p>Great job! All questions have been answered.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeView === 'trending' && (
                        <div className="trending-section">
                            <div className="content-card">
                                <h2>Trending Topics</h2>
                                <div className="trending-topics">
                                    {stats?.trending_topics.map((topic, idx) => (
                                        <div key={idx} className="topic-item">
                                            <div className="topic-rank">#{idx + 1}</div>
                                            <div className="topic-info">
                                                <h3>{topic.name}</h3>
                                                <div className="topic-bar">
                                                    <div
                                                        className="topic-progress"
                                                        style={{ width: `${(topic.count / (stats.trending_topics[0]?.count || 1)) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            <div className="topic-count">{topic.count} questions</div>
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
