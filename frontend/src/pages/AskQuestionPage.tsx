import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionsAPI } from '../Service/api';
import Navbar from '../components/navbar';
import './AskQuestionPage.css';

export default function AskQuestionPage() {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const question = await questionsAPI.create({ title, body });
            setSuccess(true);
            setTimeout(() => {
                navigate(`/questions/${question.id}`);
            }, 1500);
        } catch (err: any) {
            setError(err.message);
            if (err.message.includes('401') || err.message.includes('auth')) {
                setTimeout(() => navigate('/login'), 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ask-question-container">
            <Navbar />

            <div className="ask-question-content">
                <div className="ask-header">
                    <h1>Ask a Question</h1>
                    <p>Get help from our community of learners</p>
                </div>

                <div className="ask-tips">
                    <h3>💡 Tips for a great question:</h3>
                    <ul>
                        <li>Be specific and clear in your title</li>
                        <li>Provide context and details in the body</li>
                        <li>Show what you've tried so far</li>
                        <li>Use proper formatting and grammar</li>
                    </ul>
                </div>

                <form onSubmit={handleSubmit} className="ask-form">
                    <div className="form-group">
                        <label htmlFor="title">Question Title *</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., How do I solve quadratic equations?"
                            required
                            disabled={loading || success}
                            maxLength={255}
                        />
                        <span className="char-count">{title.length}/255</span>
                    </div>

                    <div className="form-group">
                        <label htmlFor="body">Question Details *</label>
                        <textarea
                            id="body"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder="Explain your question in detail. Include any relevant information, code snippets, or examples..."
                            required
                            disabled={loading || success}
                            rows={12}
                        />
                        <span className="char-count">{body.length} characters</span>
                    </div>

                    {error && (
                        <div className="message error">
                            ❌ {error}
                        </div>
                    )}

                    {success && (
                        <div className="message success">
                            ✅ Question posted successfully! Redirecting...
                        </div>
                    )}

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => navigate('/questions')}
                            disabled={loading || success}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={loading || success}
                        >
                            {loading ? 'Posting...' : 'Post Question'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
