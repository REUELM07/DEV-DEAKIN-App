import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    setMessage('');

    //check that both fields have been entered
    if (!email.trim() || !password) {
      setMessage('Please enter your email and password.');
      return;
    }

    setLoading(true);

    try {
      const cleanEmail = email.toLowerCase().trim();

      //send login details to the backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: cleanEmail,
          password: password
        })
      });

      const data = await response.json();

      //check whether login was successful
      if (!response.ok) {
        setMessage(data.message || 'Unable to log in. Please try again.');
        return;
      }

      //save the user's login state and jwt token
      login(data.user, data.token);

      //go to the home page after successful login
      navigate('/');

    } catch (error) {
      console.error('Login error:', error);
      setMessage('Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-heading">
          <h2>Login to your DEV@Deakin account</h2>
        </div>

        <form className="login-form" onSubmit={handleLogin}>

          <div className="login-field">
            <label htmlFor="email">Your email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Your password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {message && (
            <p className="login-message-text">{message}</p>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

        </form>

        <div className="signup-message">
          <span>Don't have an account?</span>{' '}
          <Link to="/signup">Sign up</Link>
        </div>

      </div>
    </div>
  );
}

export default Login;