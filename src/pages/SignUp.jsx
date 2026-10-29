import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import './SignUp.css';

function SignUp() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp(event) {
    event.preventDefault();

    setMessage('');

    //check that all fields have been entered
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setMessage('Please fill in all fields.');
      return;
    }

    //check that the email contains an @ symbol
    if (!email.includes('@')) {
      setMessage('Please enter a valid email address.');
      return;
    }

    //check password length
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }

    //check that both passwords are the same
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const cleanEmail = email.toLowerCase().trim();

      //send registration details to the backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: cleanEmail,
          password: password
        })
      });

      const data = await response.json();

      //check whether registration was successful
      if (!response.ok) {
        setMessage(data.message || 'Unable to create your account.');
        return;
      }

      //show a success message
      setMessage('Account created successfully! Redirecting to login...');

      //redirect to login after successful registration
      setTimeout(() => {
        navigate('/login');
      }, 1000);

    } catch (error) {
      console.error('Sign up error:', error);
      setMessage('Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-card">
        <div className="signup-heading">
          <h1>Create your account</h1>
        </div>

        <form className="signup-form" onSubmit={handleSignUp}>

          <div className="signup-field">
            <label htmlFor="fullName">Full name</label>
            <input
              type="text"
              id="fullName"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </div>

          <div className="signup-field">
            <label htmlFor="signupEmail">Email address</label>
            <input
              type="email"
              id="signupEmail"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="signup-field">
            <label htmlFor="signupPassword">Password</label>
            <input
              type="password"
              id="signupPassword"
              placeholder="Create a password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <div className="signup-field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Enter your password again"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>

          {message && (
            <p className="signup-message-text">{message}</p>
          )}

          <button
            type="submit"
            className="signup-button"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

        </form>

        <div className="login-message">
          <span>Already have an account?</span>{' '}
          <Link to="/login">Login</Link>
        </div>

      </div>
    </div>
  );
}

export default SignUp;