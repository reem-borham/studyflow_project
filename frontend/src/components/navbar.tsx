import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { authAPI } from "../Service/api";
import "./navbar.css";

const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authAPI.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="navbar">
      <img src="logo2.png" alt="logo" onClick={() => navigate("/home")} style={{ cursor: "pointer" }} />
      <div className="navbar-right">
        {user && (
          <>
            <a href="/dashboard">Dashboard</a>
            <a href="/questions">Questions</a>
          </>
        )}
        {user ? (
          <>
            <span style={{
              color: "var(--text-primary)",
              fontWeight: 600,
              fontSize: "var(--text-base)"
            }}>
              Welcome, {user.username}!
            </span>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <a href="/login">Login</a>
            <a href="/register">Sign Up</a>
          </>
        )}
        <div className="SearchContainer">
          <SearchIcon />
          <input
            placeholder="Search..."
            id="input"
            className="input"
            name="text"
            type="text"
          />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
