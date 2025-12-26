import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Form = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setError('You are already signed in. Redirecting to home...');
      setTimeout(() => {
        navigate('/home');
      }, 1500);
    }
  }, [navigate]);

  // Explicit handler for username since type might be ambiguous in the generic handler above if we had more fields
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, username: e.target.value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, password: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token); // Save token
        console.log('Login successful', data);
        // Redirect to home page first
        navigate('/home');
      } else {
        const data = await response.json();
        // data might be { non_field_errors: [...] } or other structure
        const errorMessage = data.non_field_errors ? data.non_field_errors[0] : 'Login failed';
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <StyledWrapper>
      <form className="form" onSubmit={handleSubmit}>
        <p className="title">Sign in </p>

        {error && <p style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>{error}</p>}

        <div className="flex">
          <label>
            <input
              className="input"
              type="text"
              placeholder=" "
              required
              value={formData.username}
              onChange={handleUsernameChange}
            />
            <span>Username</span>
          </label>
          <label>
            <input
              className="input"
              type="password"
              placeholder=" "
              required
              value={formData.password}
              onChange={handlePasswordChange}
            />
            <span>Password</span>
          </label>
        </div>
        <button className="submit">Sign in</button>
        <p className="signup">
          Don't have an account? <a href="/Register">Sign up</a>
        </p>
      </form>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  * {
    box-sizing: border-box;
  }
  
  .form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 350px;
    padding: 20px;
    border-radius: 20px;
    position: relative;
    background: rgba(48, 52, 76, 0.4);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255, 255, 255, 0.08); /* More subtle border */
    color: #fff;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); /* Deep shadow */
  }

  .title {
    font-size: 28px;
    font-weight: 600;
    letter-spacing: -1px;
    position: relative;
    display: flex;
    align-items: center;
    padding-left: 30px;
    color: #fff;
    background: linear-gradient(135deg, #fff 0%, #a5b1c2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .title::before {
    width: 18px;
    height: 18px;
  }

  .title::after {
    width: 18px;
    height: 18px;
    animation: pulse 1s linear infinite;
  }

  .title::before,
  .title::after {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    border-radius: 50%;
    left: 0px;
    background: linear-gradient(135deg, #6c5ce7, #ff00cc);
  }

  .message, 
  .signin,
  .signup {
    font-size: 14.5px;
    color: rgba(255, 255, 255, 0.7);
  }

  .signin,
  .signup {
    text-align: center;
  }

  .signin a:hover,
  .signup a:hover {
    text-decoration: underline #a29bfe;
  }

  .signin a,
  .signup a {
    color: #a29bfe;
    font-weight: 600;
  }

  .flex {
    display: flex;
    width: 100%;
    gap: 6px;
  }

  .form label {
    position: relative;
  }

  .form label .input {
    background-color: #333;
    color: #fff;
    width: 100%;
    padding: 20px 05px 05px 10px;
    outline: 0;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background-color: rgba(20, 20, 30, 0.6);
    border-radius: 10px;
  }

  .form label .input + span {
    color: rgba(255, 255, 255, 0.5);
    position: absolute;
    left: 10px;
    top: 0px;
    font-size: 0.9em;
    cursor: text;
    transition: 0.3s ease;
  }

  .form label .input:placeholder-shown + span {
    top: 12.5px;
    font-size: 0.9em;
  }

  .form label .input:valid + span {
    color: #a29bfe;
    top: 0px;
    font-size: 0.7em;
    font-weight: 600;
  }

  .input {
    font-size: medium;
  }

  .submit {
    border: none;
    outline: none;
    padding: 10px;
    border-radius: 10px;
    color: #fff;
    font-size: 16px;
    transform: .3s ease;
    background: linear-gradient(135deg, #6c5ce7, #a55eea);
    box-shadow: 0 4px 15px rgba(108, 92, 231, 0.4);
    font-weight: 600;
  }

  .submit:hover {
    background: linear-gradient(135deg, #a55eea, #6c5ce7);
    transform: translateY(-2px);
  }

  @keyframes pulse {
    from {
      transform: scale(0.9);
      opacity: 1;
    }

    to {
      transform: scale(1.8);
      opacity: 0;
    }
  }`;

export default Form;