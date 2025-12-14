import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const apiUrl = process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_LOCAL_API_URL
    : process.env.REACT_APP_PRODUCTION_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axios.post(`${apiUrl}/login`, {
        username,
        password
      }, {
        withCredentials: true
      });

      if (response.data.success || response.status === 200) {
        navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Auto-fill credentials
      setUsername('9175366700');
      setPassword('Moon@11light');

      // Call login API
      const response = await axios.post(`${apiUrl}/login`, {
        username: '9175366700',
        password: 'Moon@11light'
      }, {
        withCredentials: true
      });

      if (response.data.success || response.status === 200) {
        alert('✅ Auto login successful!');
        navigate('/home');
      }
    } catch (err) {
      setError('Auto login failed: ' + (err.response?.data?.message || err.message));
      console.error('Auto login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <Zap size={48} className="logo-icon" />
          <h1>Brain Beat Productions</h1>
          <p>Welcome Back</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && (
            <div className="error-message">
              <p>❌ {error}</p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username or Phone</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username or phone number"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="buttons-container">
            <button 
              type="submit" 
              className="login-button"
              disabled={loading}
            >
              {loading ? '🔄 Logging in...' : '🔐 Login'}
            </button>

            <button 
              type="button" 
              className="auto-login-button"
              onClick={handleAutoLogin}
              disabled={loading}
            >
              {loading ? '⏳ Processing...' : '🚀 Auto Login (Demo)'}
            </button>
          </div>
        </form>

        <div className="demo-credentials">
          <p>Demo Credentials:</p>
          <small>Username: 9175366700</small><br/>
          <small>Password: Moon@11light</small>
        </div>

        <div className="login-footer">
          <p>Don't have an account? 
            <button 
              type="button" 
              className="register-link"
              onClick={handleRegisterClick}
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
