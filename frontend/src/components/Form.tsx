import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Form = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        }),
      });

      if (response.ok) {
        // Registration successful
        alert('Registration successful! Please login.');
        navigate('/login');
      } else {
        const data = await response.json();
        const errorMessage = Object.values(data).flat().join(' ');
        setError(errorMessage || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <StyledWrapper>
      <form className="form" onSubmit={handleSubmit}>
        <p className="title">Register </p>
        <p className="message">Signup now and get full access to our app. </p>

        {error && <p style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>{error}</p>}

        <label>
          <input
            className="input"
            type="text"
            name="username"
            placeholder=" "
            required
            value={formData.username}
            onChange={handleChange}
          />
          <span>Username</span>
        </label>

        <div className="flex">
          <label>
            <input
              className="input"
              type="text"
              name="first_name"
              placeholder=" "
              required
              value={formData.first_name}
              onChange={handleChange}
            />
            <span>Firstname</span>
          </label>
          <label>
            <input
              className="input"
              type="text"
              name="last_name"
              placeholder=" "
              required
              value={formData.last_name}
              onChange={handleChange}
            />
            <span>Lastname</span>
          </label>
        </div>

        <label>
          <select
            className="input"
            name="role"
            value={formData.role}
            onChange={handleChange}
            style={{ color: '#fff', appearance: 'none' }}
          >
            <option value="student" style={{ color: '#000' }}>Student</option>
            <option value="instructor" style={{ color: '#000' }}>Instructor</option>
          </select>
          <span>I am a...</span>
        </label>

        <label>
          <input
            className="input"
            type="email"
            name="email"
            placeholder=" "
            required
            value={formData.email}
            onChange={handleChange}
          />
          <span>Email</span>
        </label>
        <label>
          <input
            className="input"
            type="password"
            name="password"
            placeholder=" "
            required
            value={formData.password}
            onChange={handleChange}
          />
          <span>Password</span>
        </label>
        <label>
          <input
            className="input"
            type="password"
            name="confirmPassword"
            placeholder=" "
            required
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <span>Confirm password</span>
        </label>
        <button className="submit">Submit</button>
        <p className="signin">Already have an acount ? <a href="/login">Signin</a> </p>
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
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #fff;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
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
  .signin {
    font-size: 14.5px;
    color: rgba(255, 255, 255, 0.7);
  }

  .signin {
    text-align: center;
  }

  .signin a:hover {
    text-decoration: underline #a29bfe;
  }

  .signin a {
    color: #6c5ce7;
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

  .form label .input:focus + span,
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
