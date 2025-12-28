import Navbar from "../components/navbar"
import { useNavigate } from "react-router-dom"
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer"
import ExploreIcon from "@mui/icons-material/Explore"
import { useState, useEffect } from "react"
import { API_BASE_URL } from "../config/api"
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
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Try to fetch real data, fall back to dummy if fails
    fetch(`${API_BASE_URL}/tags/popular/`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setPopularTags(data);
        }
      })
      .catch(() => {
        console.log("Using dummy data for popular topics");
        // Keep dummy data
      });

    // Fetch user role if logged in
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_BASE_URL}/dashboard/`, {
        headers: { 'Authorization': `Token ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data?.role) {
            setUserRole(data.role);
          }
        })
        .catch(() => {
          // Ignore errors
        });
    }
  }, []);

  const handlePrimaryAction = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else if (userRole === 'instructor') {
      // Instructors go to explore to answer questions
      navigate('/explore');
    } else {
      // Students go to their profile to ask questions
      navigate('/user');
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
        <div className="feature" onClick={handlePrimaryAction}>
          <QuestionAnswerIcon className="feature-icon" />
          <p>{userRole === 'instructor' ? 'Answer Questions' : 'Ask Questions'}</p>
        </div>
        <div className="feature" onClick={() => navigate('/explore')}>
          <ExploreIcon className="feature-icon" />
          <p>Explore Topics</p>
        </div>
      </section>

      <section className="info-section">
        <h2>Topics</h2>

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
