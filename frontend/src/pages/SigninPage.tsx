import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../Service/api";
import "./SigninPage.css";

const SigninPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await authAPI.register({
        username,
        email,
        password,
        role,
        bio,
      });

      setMessage("✅ Account created successfully!");

      // Redirect to home page after successful registration
      setTimeout(() => {
        navigate("/home");
      }, 1500);
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="background">
      <div className="form-container">
        <h1>Register</h1>

        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
          >
            <option value="student">Student</option>
            <option value="instructor">Instructor</option>
          </select>

          <textarea
            placeholder="Bio (optional)"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={loading}
            rows={3}
            style={{
              width: '100%',
              padding: 'var(--spacing-md) var(--spacing-lg)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'var(--text-light)',
              fontSize: 'var(--text-base)',
              fontWeight: 500,
              transition: 'all var(--transition-base)',
              backdropFilter: 'blur(10px)',
              fontFamily: 'var(--font-primary)',
              resize: 'vertical',
            }}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {message && (
          <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <p style={{ marginTop: "10px" }}>
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default SigninPage;