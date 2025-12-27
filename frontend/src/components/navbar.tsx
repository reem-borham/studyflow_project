import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { API_BASE_URL, getServerUrl } from "../services/api";
import "./navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileImageError, setProfileImageError] = useState(false);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/notifications/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.is_read).length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/dashboard/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
        setProfileImageError(false);  // Reset error on new profile fetch
      }
    } catch (error) {
      console.error("Failed to fetch user profile", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchUserProfile();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [location.pathname]);  // Refetch when navigating to catch profile updates

  const markAsRead = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_BASE_URL.replace('/api', '')}/api/notifications/${id}/mark-read/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` }
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`${API_BASE_URL.replace('/api', '')}/api/logout/`, {
          method: 'POST',
          headers: { 'Authorization': `Token ${token}` }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleProfileClick = () => {
    if (userProfile?.role === 'instructor') {
      navigate('/instructor');
    } else {
      navigate('/user');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Show back button on user and instructor pages, but not on home, login, register, or explore
  const showBackButton = ['/user', '/instructor'].includes(location.pathname) ||
    (!['/home', '/login', '/register', '/', '/explore'].includes(location.pathname) &&
      !location.pathname.startsWith('/question/'));

  return (
    <div className="navbar">
      <div className="navbar-left">
        {showBackButton && (
          <button className="back-button" onClick={handleBack} title="Go back">
            <ArrowBackIcon />
          </button>
        )}
        <img
          src="/studyflow_logo.png"
          alt="StudyFlow"
          onClick={() => navigate('/home')}
          className="navbar-logo"
        />
      </div>
      <div className="navbar-right">
        {localStorage.getItem('token') ? (
          <>
            <form className="SearchContainer" onSubmit={handleSearch}>
              <SearchIcon />
              <input
                placeholder="Search questions..."
                className="input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <div className="notification-wrapper">
              <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
                <NotificationsIcon style={{ color: '#fff' }} />
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
              </div>

              {showNotifications && (
                <div className="notification-dropdown">
                  <h3>Notifications</h3>
                  <div className="notification-list">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`notification-item ${n.is_read ? 'read' : 'unread'}`}
                          onClick={() => markAsRead(n.id)}
                        >
                          <p>{n.message}</p>
                          <span className="time">{new Date(n.created_at).toLocaleTimeString()}</span>
                        </div>
                      ))
                    ) : (
                      <p className="empty">No notifications yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Icon */}
            <div className="user-profile-icon" onClick={handleProfileClick} title="View profile">
              {userProfile?.profile_picture && !profileImageError ? (
                <img
                  src={`${getServerUrl()}${userProfile.profile_picture}`}
                  alt="Profile"
                  className="profile-avatar"
                  onError={() => setProfileImageError(true)}
                  onLoad={() => setProfileImageError(false)}
                />
              ) : (
                <AccountCircleIcon className="profile-avatar-icon" />
              )}
            </div>

            <button
              onClick={handleLogout}
              className="logout-btn"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <form className="SearchContainer" onSubmit={handleSearch}>
              <SearchIcon />
              <input
                placeholder="Search..."
                className="input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <a href="/login" className="login-link">Login</a>
            <a href="/Register" className="signin-link">Sign In</a>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar
