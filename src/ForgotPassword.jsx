import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, Link } from 'react-router-dom';
import './forgetpassword.css';

const ForgotPassword = () => {
    const [emailOrMobile, setEmailOrMobile] = useState('');
    const navigate = useNavigate();
    const apiUrl = process.env.NODE_ENV === 'development'
        ? process.env.REACT_APP_LOCAL_API_URL
        : process.env.REACT_APP_PRODUCTION_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${apiUrl}/forgot-password`, { emailOrMobile });
            if (response.data.success) {
                toast.success('Password reset link sent to your email!');
            } else {
                toast.error('User not found. Please check your email or mobile number.');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error sending reset link. Please try again later.');
        }
    };

    return (
        <div className="page-container">
            <ToastContainer autoClose={3000} />
            <div className="card login-card">
                <div className="login-header">
                    <h1>FORGOT PASSWORD</h1>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            className="form-input"
                            type="text"
                            value={emailOrMobile}
                            onChange={(e) => setEmailOrMobile(e.target.value)}
                            required
                            placeholder=" "
                        />
                        <label className="form-label">EMAIL OR MOBILE NUMBER</label>
                    </div>
                    <button type="submit" className="login-button">
                        SEND RESET LINK
                    </button>
                </form>
                <div className="auth-footer login-footer">
                    Remember your password? <Link to="/login">Login here</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;