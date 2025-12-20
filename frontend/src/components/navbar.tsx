import { useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import "./Navbar.css";

const Navbar = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/api/notifications/", {
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

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://127.0.0.1:8000/api/notifications/${id}/mark-read/`, {
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
        await fetch('http://127.0.0.1:8000/api/logout/', {
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

  return (
    <div className="navbar">
      <img src="logo2.png" alt="logo" onClick={() => window.location.href = '/'} style={{ cursor: 'pointer' }} />
      <div className="navbar-right">
        {localStorage.getItem('token') ? (
          <>
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
            <button
              onClick={handleLogout}
              className="logout-btn"
              style={{
                marginLeft: '15px',
                padding: '8px 20px',
                background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <a href="/login" className="login-link">Login</a>
            <a href="/Register" className="signin-link">Sign In</a>
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

export default Navbar
