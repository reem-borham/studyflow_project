import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '50px',
      minHeight: '60vh'
    }}>
      <h1 style={{ fontSize: '4rem', color: '#666' }}>404</h1>
      <h2>Page Not Found</h2>
      <p style={{ margin: '20px 0' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={{ marginTop: '30px' }}>
        <Link to="/" style={{ 
          padding: '10px 20px', 
          background: '#007bff', 
          color: 'white', 
          textDecoration: 'none',
          borderRadius: '5px'
        }}>
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;