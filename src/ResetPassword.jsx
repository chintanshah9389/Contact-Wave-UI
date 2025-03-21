import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams, useNavigate } from 'react-router-dom';
import './forgetpassword.css';


const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { token } = useParams(); // Get token from URL
    const navigate = useNavigate();
    const apiUrl = process.env.NODE_ENV === 'development'
        ? process.env.REACT_APP_LOCAL_API_URL
        : process.env.REACT_APP_PRODUCTION_API_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            toast.error(
                'Password must be at least 8 characters long, contain uppercase, lowercase, a number, and a special character'
            );
            return;
        }

        try {
            const response = await axios.post(`${apiUrl}/reset-password`, { token, newPassword });
            if (response.data.success) {
                toast.success('Password reset successful!');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                toast.error('Password reset failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error resetting password. Please try again later.');
        }
    };

    return (
        <div className="page-container">
            <ToastContainer autoClose={3000} />
            <div className="card login-card">
                <div className="login-header">
                    <h1>RESET PASSWORD</h1>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            className="form-input"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            placeholder=" "
                        />
                        <label className="form-label">NEW PASSWORD</label>
                    </div>
                    <div className="form-group">
                        <input
                            className="form-input"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            placeholder=" "
                        />
                        <label className="form-label">CONFIRM PASSWORD</label>
                    </div>
                    <button type="submit" className="login-button">
                        RESET PASSWORD
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;