import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionsAPI, answersAPI, votingAPI, type Question, type Answer } from '../Service/api';
import Navbar from '../components/navbar';
import './QuestionDetailPage.css';

export default function QuestionDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [question, setQuestion] = useState<Question | null>(null);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [answerBody, setAnswerBody] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (id) {
                    const questionData = await questionsAPI.getById(parseInt(id));
                    setQuestion(questionData);

                    const allAnswers = await answersAPI.getAll();
                    const questionAnswers = allAnswers.filter(a => a.question === parseInt(id));
                    setAnswers(questionAnswers);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleVote = async (voteType: 'up' | 'down') => {
        if (!question) return;

        try {
            await votingAPI.vote({
                content_type: 'question',
                object_id: question.id,
                vote_type: voteType
            });

            // Refresh question to get updated vote count
            const updated = await questionsAPI.getById(question.id);
            setQuestion(updated);
        } catch (err: any) {
            console.error('Vote error:', err);
        }
    };

    const handleSubmitAnswer = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!answerBody.trim()) {
            setError('Answer cannot be empty');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const newAnswer = await answersAPI.create({
                body: answerBody,
                question: parseInt(id!)
            });

            setAnswers([...answers, newAnswer]);
            setAnswerBody('');
            setSuccessMessage('✅ Answer posted successfully!');

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError(`Failed to post answer: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="question-detail-container">
                <Navbar />
                <div className="loading">Loading question...</div>
            </div>
        );
    }

    if (error && !question) {
        return (
            <div className="question-detail-container">
                <Navbar />
                <div className="error-container">
                    <h2>Question Not Found</h2>
                    <p>{error || 'The question you\'re looking for doesn\'t exist.'}</p>
                    <button onClick={() => navigate('/questions')} className="back-btn">
                        ← Back to Questions
                    </button>
                </div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="question-detail-container">
                <Navbar />
                <div className="loading">No question found</div>
            </div>
        );
    }

    return (
        <div className="question-detail-container">
            <Navbar />

            <div className="question-detail-content">
                <button onClick={() => navigate('/questions')} className="back-link">
                    ← All Questions
                </button>

                <div className="question-header">
                    <h1>{question.title}</h1>
                    <div className="question-meta-info">
                        <span>Asked by <strong>{question.user.username}</strong></span>
                        <span className="separator">•</span>
                        <span>{formatDate(question.created_at)}</span>
                    </div>
                </div>

                <div className="question-stats-bar">
                    <div className="vote-section">
                        <button
                            className="vote-btn upvote"
                            onClick={() => handleVote('up')}
                            title="Upvote"
                        >
                            ▲
                        </button>
                        <span className="vote-count">{question.vote_count || 0}</span>
                        <button
                            className="vote-btn downvote"
                            onClick={() => handleVote('down')}
                            title="Downvote"
                        >
                            ▼
                        </button>
                    </div>

                    <div className="stat">
                        <span className="stat-value">{question.views || 0}</span>
                        <span className="stat-label">views</span>
                    </div>
                    <div className="stat">
                        <span className="stat-value">{answers.length}</span>
                        <span className="stat-label">answers</span>
                    </div>
                </div>

                <div className="question-body">
                    <p>{question.body}</p>
                </div>

                {question.tags && question.tags.length > 0 && (
                    <div className="question-tags">
                        {question.tags.map((tag) => (
                            <span key={tag.id} className="tag">#{tag.name}</span>
                        ))}
                    </div>
                )}

                <div className="answers-section">
                    <h2>{answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}</h2>

                    {answers.length === 0 ? (
                        <div className="no-answers">
                            <p>No answers yet. Be the first to answer!</p>
                        </div>
                    ) : (
                        <div className="answers-list">
                            {answers.map((answer) => (
                                <div key={answer.id} className="answer-card">
                                    <div className="answer-body">
                                        <p>{answer.body}</p>
                                    </div>
                                    <div className="answer-footer">
                                        <span>Answered by <strong>{answer.user.username}</strong></span>
                                        <span className="separator">•</span>
                                        <span>{formatDate(answer.created_at)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="answer-form">
                    <h3>Your Answer</h3>

                    {successMessage && (
                        <div className="message success">{successMessage}</div>
                    )}

                    {error && !question && (
                        <div className="message error">{error}</div>
                    )}

                    <form onSubmit={handleSubmitAnswer}>
                        <textarea
                            placeholder="Share your knowledge and help the community..."
                            rows={8}
                            value={answerBody}
                            onChange={(e) => setAnswerBody(e.target.value)}
                            disabled={submitting}
                        />
                        <button
                            type="submit"
                            className="submit-answer-btn"
                            disabled={submitting || !answerBody.trim()}
                        >
                            {submitting ? 'Posting...' : 'Post Answer'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
