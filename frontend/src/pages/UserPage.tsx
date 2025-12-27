import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentDashboard from './student/Dashboard';
import InstructorDashboard from './instructor/Dashboard';
import { apiUrl } from "../config";

/**
 * UserPage - Smart router that shows the appropriate dashboard based on user role
 * - Students see the Student Dashboard
 * - Instructors see the Instructor Dashboard
 * 
 * This component fetches the user's role from the API and renders the correct dashboard.
 */
export default function UserPage() {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await fetch(apiUrl("api/dashboard/"), {
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                });

                if (response.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    return;
                }

                if (response.ok) {
                    const data = await response.json();
                    console.log('👤 User role detected:', data.role);
                    console.log('📧 User email:', data.email);
                    setUserRole(data.role);
                } else {
                    setError('Failed to fetch user data');
                }
            } catch (err) {
                console.error('Failed to fetch user role:', err);
                setError('Connection error');
            } finally {
                setLoading(false);
            }
        };

        fetchUserRole();
    }, [navigate]);

    // Loading state with premium design
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
                color: '#fff',
                fontFamily: 'Inter, system-ui, sans-serif'
            }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    border: '4px solid rgba(139, 92, 246, 0.2)',
                    borderTop: '4px solid #8b5cf6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginBottom: '20px'
                }} />
                <style>
                    {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
                </style>
                <span style={{ fontSize: '1.2rem', opacity: 0.8 }}>Loading your dashboard...</span>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
                color: '#fff',
                fontFamily: 'Inter, system-ui, sans-serif',
                textAlign: 'center',
                padding: '20px'
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⚠️</div>
                <h2 style={{ margin: '0 0 10px 0' }}>{error}</h2>
                <p style={{ opacity: 0.7, margin: '0 0 20px 0' }}>Please try again or contact support.</p>
                <button
                    onClick={() => navigate('/login')}
                    style={{
                        padding: '12px 28px',
                        background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    Go to Login
                </button>
            </div>
        );
    }

    // Route to appropriate dashboard based on role
    if (userRole === 'instructor') {
        console.log('🎓 Rendering Instructor Dashboard');
        return <InstructorDashboard />;
    }

    console.log('📚 Rendering Student Dashboard');
    return <StudentDashboard />;
}
