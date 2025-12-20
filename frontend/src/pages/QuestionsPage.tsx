import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionsAPI, type Question } from '../Service/api';
import Navbar from '../components/navbar';
import './QuestionsPage.css';

export default function QuestionsPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const data = await questionsAPI.getAll();
                setQuestions(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="questions-container">
                <Navbar />
                <div className="loading">Loading questions...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="questions-container">
                <Navbar />
                <div className="error">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="questions-container">
            <Navbar />

            <div className="questions-content">
                <div className="questions-header">
                    <div>
                        <h1>All Questions</h1>
                        <p>{questions.length} questions in our community</p>
                    </div>
                    <button className="ask-question-btn" onClick={() => navigate('/ask-question')}>
                        Ask Question
                    </button>
                </div>

                <div className="questions-list">
                    {questions.length === 0 ? (
                        <div className="no-questions">
                            <p>No questions yet. Be the first to ask!</p>
                        </div>
                    ) : (
                        questions.map((question) => (
                            <div
                                key={question.id}
                                className="question-card"
                                onClick={() => navigate(`/questions/${question.id}`)}
                            >
                                <div className="question-stats">
                                    <div className="stat-item">
                                        <span className="stat-number">{question.vote_count || 0}</span>
                                        <span className="stat-label">votes</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-number">{question.views || 0}</span>
                                        <span className="stat-label">views</span>
                                    </div>
                                </div>

                                <div className="question-content">
                                    <h2 className="question-title">{question.title}</h2>
                                    <p className="question-body">
                                        {question.body.substring(0, 200)}
                                        {question.body.length > 200 && '...'}
                                    </p>

                                    <div className="question-meta">
                                        <div className="question-tags">
                                            {question.tags?.map((tag) => (
                                                <span key={tag.id} className="tag">#{tag.name}</span>
                                            ))}
                                        </div>
                                        <div className="question-author">
                                            <span>Asked by <strong>{question.user.username}</strong></span>
                                            <span className="question-date">{formatDate(question.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
