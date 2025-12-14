// Add this button in your Login component

// Find where your login button is and add this auto-login button nearby:

<div className="login-buttons">
  <button 
    type="submit" 
    className="login-button"
  >
    Login
  </button>
  
  <button 
    type="button" 
    className="auto-login-button"
    onClick={handleAutoLogin}
  >
    🚀 Auto Login (Demo)
  </button>
</div>

// Add this handler function in your Login component:

const handleAutoLogin = async () => {
  try {
    // Set credentials
    setUsername('9175366700');
    setPassword('Moon@11light');
    
    // Call the login API
    const apiUrl = process.env.NODE_ENV === 'development'
      ? process.env.REACT_APP_LOCAL_API_URL
      : process.env.REACT_APP_PRODUCTION_API_URL;

    const response = await axios.post(`${apiUrl}/login`, {
      username: '9175366700',
      password: 'Moon@11light'
    }, {
      withCredentials: true
    });

    if (response.data.success || response.status === 200) {
      alert('Auto login successful!');
      navigate('/home'); // or wherever you want to redirect
    }
  } catch (err) {
    console.error('Auto login error:', err);
    alert('Auto login failed: ' + err.message);
  }
};

// Add this CSS for the button styling:

.auto-login-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.auto-login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.auto-login-button:active {
  transform: translateY(0);
}
