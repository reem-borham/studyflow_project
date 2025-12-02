import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./LoginPage.css";

const LoginPage: React.FC = () => {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage]   = useState("");

  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("http://127.0.0.1:8000/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Login successful!");

        setTimeout(() => {
          navigate("/home"); // redirect to HomePage
        }, 500);
      } else {
        setMessage(data.error || "Invalid login.");
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
        <h1>Login</h1>

        <form onSubmit={handleLogin}>
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

          <button type="submit">Login</button>
        </form>

        {message && <p className="response-msg">{message}</p>}

        <p style={{ marginTop: "10px" }}>
          Don’t have an account?{" "}
          <Link to="/register" style={{ cursor: "pointer" }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
