import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './registration.css';

const Registration = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        surname: '',
        mobile: '',
        email: '',
        gender: '',
        password: '',
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const validateInput = () => {
        const { mobile, email, password } = formData;

        // Validate mobile number
        const mobileRegex = /^[6-9]\d{9}$/;
        if (!mobileRegex.test(mobile)) {
            toast.error('Please enter a valid 10-digit mobile number.');
            return false;
        }

        // Validate email address
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address.');
            return false;
        }

        // Validate password strength
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            toast.error(
                'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.'
            );
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateInput()) return;

        try {
            const response = await axios.post('http://localhost:5000/register', formData);
            toast.success(response.data);

            // Redirect to login page after 3.5 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3500);

            // Clear form fields
            setFormData({
                firstName: '',
                middleName: '',
                surname: '',
                mobile: '',
                email: '',
                gender: '',
                password: '',
            });
        } catch (error) {
            console.error('Error registering user:', error);
            toast.error('Error during registration.');
        }
    };

    return (
        <div className="page-container">
            <ToastContainer />
            <div className="card registration-card">
                <div className="registration-header">
                    <h1>Registration</h1>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="name-row">
                        <div className="form-group">
                            <input
                                className="form-input"
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                placeholder=" "
                            />
                            <label className="form-label">FIRST NAME</label>
                        </div>
                        <div className="form-group">
                            <input
                                className="form-input"
                                type="text"
                                name="middleName"
                                value={formData.middleName}
                                onChange={handleChange}
                                placeholder=" "
                            />
                            <label className="form-label">MIDDLE NAME</label>
                        </div>
                    </div>
                    <div className="name-row">
                        <div className="form-group">
                            <input
                                className="form-input"
                                type="text"
                                name="surname"
                                value={formData.surname}
                                onChange={handleChange}
                                required
                                placeholder=" "
                            />
                            <label className="form-label">SURNAME</label>
                        </div>
                        <div className="form-group">
                            <input
                                className="form-input"
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                required
                                placeholder=" "
                            />
                            <label className="form-label">MOBILE NUMBER</label>
                        </div>
                    </div>
                    <div className="form-group">
                        <input
                            className="form-input"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder=" "
                        />
                        <label className="form-label">EMAIL ADDRESS</label>
                    </div>
                    <div className="form-group">
                        <label className="form-label">GENDER</label>
                        <div className="radio-group">
                            <label className="radio-label">
                                <input
                                    className="radio-input"
                                    type="radio"
                                    name="gender"
                                    value="Male"
                                    onChange={handleChange}
                                    checked={formData.gender === 'Male'}
                                />
                                Male
                            </label>
                            <label className="radio-label">
                                <input
                                    className="radio-input"
                                    type="radio"
                                    name="gender"
                                    value="Female"
                                    onChange={handleChange}
                                    checked={formData.gender === 'Female'}
                                />
                                Female
                            </label>
                        </div>
                    </div>
                    <div className="form-group">
                        <input
                            className="form-input"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder=" "
                        />
                        <label className="form-label">PASSWORD</label>
                    </div>
                    <button type="submit" className="register-button">
                        REGISTER
                    </button>
                </form>
                <div className="auth-footer registration-footer">
                    Already have an account?
                    <Link to="/login">Login here</Link>
                </div>
            </div>
        </div>
    );
};

export default Registration;
