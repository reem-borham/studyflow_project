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

export default function HomePage() {
  const navigate = useNavigate();
  const [popularTags, setPopularTags] = useState<Tag[]>([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/tags/popular/')
      .then(res => res.json())
      .then(data => setPopularTags(data))
      .catch(err => console.error("Failed to fetch tags", err));
  }, []);

  return (
    <div className="home-container">
      <Navbar />
      <section className="hero">
        <div className="hero-content">
          <h1>Unlock Knowledge.<br />Connect. Grow</h1>
          <button className="cta-button">Start Learning Today!</button>
        </div>

        <img className="hero-image" src="pic.jpg" alt="students-pic" />
      </section>
      <section className="features">
        <div className="feature" onClick={() => navigate('/user')} style={{ cursor: 'pointer' }}>
          <QuestionAnswerIcon className="feature-icon" />
          <p>Ask Questions</p>
        </div>
        <div className="feature">
          <PsychologyAltIcon className="feature-icon" />
          <p>Share Answers</p>
        </div>
        <div className="feature" onClick={() => navigate('/explore')} style={{ cursor: 'pointer' }}>
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
              <li key={tag.id}>#{tag.name} <span style={{ fontSize: '0.8em', opacity: 0.7 }}>({tag.count})</span></li>
            ))}
            {popularTags.length === 0 && <li>Loading topics...</li>}
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
