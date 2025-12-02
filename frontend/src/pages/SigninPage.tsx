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
      
      const res = await fetch("http://localhost:8000/api/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Important for cookies/sessions
        body: JSON.stringify({
          username,     // Must match backend field name
          email,        // Must match backend field name
          password,     // Must match backend field name
          role,         // Must match backend field name
          // Add bio if your backend expects it
          bio: ""
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Signup successful!");
        
        // Optional: Auto-login after signup
        localStorage.setItem("user", JSON.stringify({
          id: data.user_id,
          username: data.username,
          email: data.email,
          role: data.role
        }));

        setTimeout(() => {
          navigate("/login"); // Or navigate to home directly
        }, 800);
      } else {
        setMessage(data.error || "Signup failed.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setMessage("Network error. Is Django server running?");
    }
  }

  return (
    <div className="background">
      {/* ... your existing JSX ... */}
    </div>
  );
};

export default SigninPage;