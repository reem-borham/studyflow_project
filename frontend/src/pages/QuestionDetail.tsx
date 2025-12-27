import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/navbar";
import { Container, Paper, TextField, Button, Avatar, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ForumIcon from "@mui/icons-material/Forum";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import "./QuestionDetail.css";
import { apiUrl, getServerUrl } from "../config";

interface Answer {
    id: number;
    body: string;
    username: string;
    created_at: string;
    vote_count: number;
}

interface Question {
    id: number;
    title: string;
    body: string;
    user_username: string;
    created_at: string;
    tag_names: string[];
    answers: Answer[];
}

export default function QuestionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [question, setQuestion] = useState<Question | null>(null);
    const [newAnswer, setNewAnswer] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchQuestion();
    }, [id]);

    const fetchQuestion = async () => {
        try {
            const response = await fetch(`${getServerUrl()}/api/posts/${id}/`);
            if (response.ok) {
                const data = await response.json();
                setQuestion(data);
            }
        } catch (error) {
            console.error("Failed to fetch question detail", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePostAnswer = async () => {
        if (!newAnswer.trim()) return;

        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please login to answer");
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(apiUrl("api/answers/"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Token ${token}`
                },
                body: JSON.stringify({
                    body: newAnswer,
                    question: id
                })
            });

            if (response.ok) {
                setNewAnswer("");
                fetchQuestion(); // Refresh to show new answer
            }
        } catch (error) {
            console.error("Failed to post answer", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="loading-state">Loading question...</div>;
    if (!question) return <div className="error-state">Question not found.</div>;

    return (
        <div className="detail-page">
            <Navbar />
            <Container className="detail-container">
                {/* Back Button */}
                <div className="back-button-container">
                    <IconButton
                        className="back-button"
                        onClick={() => navigate(-1)}
                        aria-label="Go back"
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <span className="back-text">Back</span>
                </div>

                <Paper className="question-card glass">
                    <div className="author-info">
                        <Avatar className="avatar-small">{question.user_username[0].toUpperCase()}</Avatar>
                        <div className="meta">
                            <span className="username">@{question.user_username}</span>
                            <span className="date">{new Date(question.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <h1 className="title">{question.title}</h1>
                    <div className="body">{question.body}</div>
                    <div className="tags">
                        {question.tag_names.map((tag, index) => (
                            <span key={index} className="tag">#{tag}</span>
                        ))}
                    </div>
                </Paper>

                <section className="answers-section">
                    <div className="section-header">
                        <ForumIcon />
                        <h2>{question.answers.length} Answers</h2>
                    </div>

                    <div className="answers-list">
                        {question.answers.map((answer) => (
                            <Paper key={answer.id} className="answer-item glass">
                                <div className="answer-header">
                                    <span className="username">@{answer.username}</span>
                                    <span className="date">{new Date(answer.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="answer-body">{answer.body}</div>
                            </Paper>
                        ))}
                        {question.answers.length === 0 && (
                            <p className="no-answers">No answers yet. Share your knowledge!</p>
                        )}
                    </div>

                    <div className="post-answer glass">
                        <h3>Post Your Answer</h3>
                        <TextField
                            multiline
                            rows={4}
                            variant="outlined"
                            placeholder="What's your take on this?"
                            fullWidth
                            className="answer-input"
                            value={newAnswer}
                            onChange={(e) => setNewAnswer(e.target.value)}
                        />
                        <Button
                            variant="contained"
                            endIcon={<SendIcon />}
                            className="submit-btn"
                            onClick={handlePostAnswer}
                            disabled={submitting}
                        >
                            Post Answer
                        </Button>
                    </div>
                </section>
            </Container>
        </div>
    );
}
