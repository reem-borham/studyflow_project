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
      
      const res = await fetch("http://localhost:8000/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,        // Must match backend field name
          password,     // Must match backend field name
          // Note: If your backend expects user_type, add it:
          // user_type: "user"
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Login successful!");
        
        // Store user data in localStorage/session
        localStorage.setItem("user", JSON.stringify({
          id: data.user_id,
          username: data.username,
          email: data.email,
          role: data.role
        }));
        
        localStorage.setItem("token", "dummy-token-for-now"); // Replace with real token later

        setTimeout(() => {
          navigate("/home");
        }, 500);
      } else {
        setMessage(data.error || "Invalid login.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Network error. Is Django server running?");
    }
  }

  return (
    <div className="background">
      {/* ... your existing JSX ... */}
    </div>
  );
};

export default LoginPage;