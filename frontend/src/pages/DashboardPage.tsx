import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, type DashboardStats } from '../Service/api';
import Navbar from '../components/navbar';
import './DashboardPage.css';

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await dashboardAPI.getStats();
                setStats(data);
            } catch (err: any) {
                setError(err.message);
                if (err.message.includes('401') || err.message.includes('auth')) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [navigate]);

    if (loading) {
        return (
            <div className="dashboard-container">
                <Navbar />
                <div className="loading">Loading your dashboard...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <Navbar />
                <div className="error">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Navbar />

            <div className="dashboard-content">
                <div className="dashboard-header">
                    <h1>Welcome back, {stats?.username}!</h1>
                    <p>Here's your activity overview</p>
                </div>

                <div className="stats-grid">
                    <div className="stat-card questions-card">
                        <div className="stat-icon">❓</div>
                        <div className="stat-details">
                            <h3>{stats?.stats.questions_asked || 0}</h3>
                            <p>Questions Asked</p>
                        </div>
                    </div>

                    <div className="stat-card answers-card">
                        <div className="stat-icon">💡</div>
                        <div className="stat-details">
                            <h3>{stats?.stats.questions_answered || 0}</h3>
                            <p>Answers Given</p>
                        </div>
                    </div>

                    <div className="stat-card reputation-card">
                        <div className="stat-icon">⭐</div>
                        <div className="stat-details">
                            <h3>{stats?.stats.reputation_score || 0}</h3>
                            <p>Reputation Score</p>
                        </div>
                    </div>
                </div>

                <div className="breakdown-section">
                    <h2>Reputation Breakdown</h2>
                    <div className="breakdown-grid">
                        <div className="breakdown-item">
                            <span className="breakdown-label">Question Votes</span>
                            <span className="breakdown-value positive">
                                +{stats?.stats.breakdown.question_votes || 0}
                            </span>
                        </div>
                        <div className="breakdown-item">
                            <span className="breakdown-label">Answer Votes</span>
                            <span className="breakdown-value positive">
                                +{stats?.stats.breakdown.answer_votes || 0}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="quick-actions">
                    <h2>Quick Actions</h2>
                    <div className="action-buttons">
                        <button className="action-btn ask-btn" onClick={() => navigate('/ask-question')}>
                            Ask a Question
                        </button>
                        <button className="action-btn browse-btn" onClick={() => navigate('/questions')}>
                            Browse Questions
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
