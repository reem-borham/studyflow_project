import Navbar from "../components/navbar"
import { useNavigate } from "react-router-dom"
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer"
import PsychologyAltIcon from "@mui/icons-material/PsychologyAlt"
import ExploreIcon from "@mui/icons-material/Explore"
import { useState, useEffect } from "react"
import "./HomePage.css"

interface Tag {
  id: number;
  name: string;
  count: number;
}

// Dummy popular topics
const dummyTopics: Tag[] = [
  { id: 1, name: "Python", count: 142 },
  { id: 2, name: "JavaScript", count: 98 },
  { id: 3, name: "React", count: 76 },
  { id: 4, name: "Django", count: 54 },
  { id: 5, name: "CSS", count: 42 },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [popularTags, setPopularTags] = useState<Tag[]>(dummyTopics);

  useEffect(() => {
    // Try to fetch real data, fall back to dummy if fails
    fetch('http://127.0.0.1:8000/api/tags/popular/')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setPopularTags(data);
        }
      })
      .catch(err => {
        console.log("Using dummy data for popular topics");
        // Keep dummy data
      });
  }, []);

  const handleNavigateToUser = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      navigate('/user');
    }
  };

  const handleShareAnswers = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      navigate('/explore');
    }
  };

  return (
    <div className="home-container">
      <Navbar />
      <section className="hero">
        <div className="hero-content">
          <h1>Unlock Knowledge.<br />Connect. Grow</h1>
          <p className="hero-subtitle">Join our community of learners and share knowledge</p>
          <button className="cta-button" onClick={() => navigate('/explore')}>Start Learning Today!</button>
        </div>

        <img className="hero-image" src="pic.jpg" alt="students-pic" />
      </section>
      <section className="features">
        <div className="feature" onClick={handleNavigateToUser}>
          <QuestionAnswerIcon className="feature-icon" />
          <p>Ask Questions</p>
        </div>
        <div className="feature" onClick={handleShareAnswers}>
          <PsychologyAltIcon className="feature-icon" />
          <p>Share Answers</p>
        </div>
        <div className="feature" onClick={() => navigate('/explore')}>
          <ExploreIcon className="feature-icon" />
          <p>Explore Topics</p>
        </div>
      </section>

      <section className="info-section">
        <h2>How It Works</h2>

        <div className="topics-box">
          <h3>Popular Topics</h3>
          <ul>
            {popularTags.map(tag => (
              <li key={tag.id} onClick={() => navigate(`/explore?tag=${tag.name}`)}>
                #{tag.name} <span style={{ fontSize: '0.8em', opacity: 0.7 }}>({tag.count})</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="footer">
        <p>About Us</p>
        <p>Community Guidelines</p>
        <p>Privacy</p>
      </footer>
    </div>
  )
}
