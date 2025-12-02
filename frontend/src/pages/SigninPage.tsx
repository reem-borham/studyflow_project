import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./SigninPage.css";

const SigninPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState("user");
  const [message, setMessage]   = useState("");

  const navigate = useNavigate();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("http://127.0.0.1:8000/users/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          email,
          password,
          role,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Signup successful!");

        setTimeout(() => {
          navigate("/login");
        }, 800);
      } else {
        setMessage(data.error || "Signup failed.");
      }
    } catch (error) {
      setMessage("Something went wrong.");
    }
  }

  return (
    <div className="background">

      {/* Floating circles */}
      <div className="circle" style={{ top: "10%", left: "15%", width: "100px", height: "100px", animationDuration: "6s" }}></div>
      <div className="circle" style={{ top: "30%", left: "70%", width: "80px", height: "80px", animationDuration: "8s" }}></div>
      <div className="circle" style={{ top: "60%", left: "40%", width: "50px", height: "50px", animationDuration: "5s" }}></div>
      <div className="circle" style={{ top: "80%", left: "20%", width: "120px", height: "120px", animationDuration: "7s" }}></div>

      <div className="form-container">
        <h1>Register</h1>

        <form onSubmit={handleSignup}>

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
          </select>

          <button type="submit">Sign Up</button>
        </form>

        {message && <p className="response-msg">{message}</p>}

        <p style={{ marginTop: "10px" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ cursor: "pointer" }}>
            Signin
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SigninPage;
