import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/navbar";
import Card from "../components/posts";
import { Container } from "@mui/material";
import { API_BASE_URL } from "../config/api";
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
    tag_names?: string[];
}

// Dummy data for questions
const dummyQuestions: Question[] = [
    {
        id: 1,
        title: "How to center a div in CSS?",
        body: "I'm trying to center a div both horizontally and vertically. What's the best modern approach?",
        user_username: "css_learner",
        created_at: new Date().toISOString(),
        views: 45,
        vote_count: 12,
        comment_count: 8
    },
    {
        id: 2,
        title: "Python list comprehension vs map()",
        body: "What are the performance differences between list comprehension and map() function in Python?",
        user_username: "python_dev",
        created_at: new Date().toISOString(),
        views: 78,
        vote_count: 23,
        comment_count: 15
    },
    {
        id: 3,
        title: "React useState vs useReducer",
        body: "When should I use useState and when should I use useReducer? What are the main differences?",
        user_username: "react_student",
        created_at: new Date().toISOString(),
        views: 92,
        vote_count: 31,
        comment_count: 12
    },
    {
        id: 4,
        title: "Best practices for Django REST API",
        body: "What are some best practices when building RESTful APIs with Django? Looking for security and performance tips.",
        user_username: "backend_dev",
        created_at: new Date().toISOString(),
        views: 134,
        vote_count: 45,
        comment_count: 22
    },
    {
        id: 5,
        title: "JavaScript async/await explained",
        body: "Can someone explain how async/await works in JavaScript? I'm confused about promise chaining.",
        user_username: "js_newbie",
        created_at: new Date().toISOString(),
        views: 156,
        vote_count: 52,
        comment_count: 28
    }
];

export default function Explore() {
    const location = useLocation();
    const [posts, setPosts] = useState<Question[]>(dummyQuestions);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isTagSearch, setIsTagSearch] = useState(false);

    useEffect(() => {
        // Get search query from URL
        const params = new URLSearchParams(location.search);
        const tagSearch = params.get('tag') || '';
        const textSearch = params.get('search') || '';

        setSearchQuery(tagSearch || textSearch);
        setIsTagSearch(!!tagSearch);

        // Build API URL with tag filter if specified
        let apiUrl = `${API_BASE_URL}/posts/`;
        if (tagSearch) {
            // Try to filter by tag on the backend
            apiUrl += `?tag=${encodeURIComponent(tagSearch)}`;
        }

        // Try to fetch real data
        setLoading(true);
        fetch(apiUrl)
            .then((res) => res.json())
            .then((data) => {
                const postsArray = data.results || data;
                if (postsArray && postsArray.length > 0) {
                    setPosts(postsArray);
                } else if (tagSearch) {
                    // If tag filter returns nothing, try fetching all and filter client-side
                    fetch(`${API_BASE_URL}/posts/`)
                        .then(res => res.json())
                        .then(allData => {
                            const allPosts = allData.results || allData;
                            if (allPosts && allPosts.length > 0) {
                                const filtered = allPosts.filter((post: any) =>
                                    post.tag_names?.some((tag: string) =>
                                        tag.toLowerCase().includes(tagSearch.toLowerCase())
                                    )
                                );
                                setPosts(filtered.length > 0 ? filtered : allPosts);
                            }
                            setLoading(false);
                        })
                        .catch(() => setLoading(false));
                    return; // Don't set loading false yet
                }
                setLoading(false);
            })
            .catch(() => {
                console.log("Using dummy data for questions");
                setLoading(false);
            });
    }, [location.search]);

    // Filter posts based on search query (client-side filtering for text search)
    const filteredPosts = searchQuery && !isTagSearch
        ? posts.filter(post =>
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.tag_names?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        : posts;

    return (
        <div className="explore-page">
            <Navbar />
            <Container className="explore-container">
                <header className="explore-header">
                    <h1>Explore Latest Content</h1>
                    <p>Discover interesting questions and answers from our community.</p>
                    {searchQuery && (
                        <p className="search-info">
                            Showing results for: <strong>{searchQuery}</strong>
                        </p>
                    )}
                </header>

                {loading ? (
                    <div className="loading-state">Loading latest posts...</div>
                ) : (
                    <div className="cards-grid">
                        {filteredPosts.map((post) => (
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
                        {filteredPosts.length === 0 && (
                            <p className="empty-state">
                                {searchQuery
                                    ? `No posts found for "${searchQuery}". Try a different search term.`
                                    : "No posts found. Be the first to ask!"
                                }
                            </p>
                        )}
                    </div>
                )}
            </Container>
        </div>
    );
}
