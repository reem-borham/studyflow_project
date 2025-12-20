import { useState, useEffect } from "react";
import Navbar from "../components/navbar";
import Card from "../components/posts";
import { Container } from "@mui/material";
import "./Explore.css";

interface Question {
    id: number;
    title: string;
    body: string;
    user_username: string;
    created_at: string;
    views: number;
    vote_count: number;
    comment_count: number;
}

export default function Explore() {
    const [posts, setPosts] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://127.0.0.1:8000/api/posts/")
            .then((res) => res.json())
            .then((data) => {
                setPosts(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to fetch posts", err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="explore-page">
            <Navbar />
            <Container className="explore-container">
                <header className="explore-header">
                    <h1>Explore Latest Content</h1>
                    <p>Discover interesting questions and answers from our community.</p>
                </header>

                {loading ? (
                    <div className="loading-state">Loading latest posts...</div>
                ) : (
                    <div className="cards-grid">
                        {posts.map((post) => (
                            <Card
                                key={post.id}
                                id={post.id}
                                title={post.title}
                                content={post.body}
                                username={post.user_username}
                                stats={{
                                    votes: post.vote_count,
                                    views: post.views,
                                    answers: post.comment_count,
                                }}
                            />
                        ))}
                        {posts.length === 0 && (
                            <p className="empty-state">No posts found. Be the first to ask!</p>
                        )}
                    </div>
                )}
            </Container>
        </div>
    );
}
