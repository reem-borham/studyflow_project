import Navbar from "../components/navbar"
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer"
import PsychologyAltIcon from "@mui/icons-material/PsychologyAlt"
import ExploreIcon from "@mui/icons-material/Explore"
import "./HomePage.css"

export default function HomePage() {
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
        <div className="feature">
          <QuestionAnswerIcon className="feature-icon" />
          <p>Ask Questions</p>
        </div>
        <div className="feature">
          <PsychologyAltIcon className="feature-icon" />
          <p>Share Answers</p>
        </div>
        <div className="feature">
          <ExploreIcon className="feature-icon" />
          <p>Explore Topics</p>
        </div>
      </section>

      <section className="info-section">
        <h2>How It Works</h2>

        <div className="topics-box">
          <h3>Popular Topics</h3>
          <ul>
            <li>#Algebra</li>
            <li>#Literature</li>
            <li>#WebDev</li>
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
