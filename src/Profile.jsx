import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './profile.css';
import Navbar from './navbar';

const Profile = () => {
    const [userData, setUserData] = useState({
        firstName: '',
        middleName: '',
        surname: '',
        mobile: '',
        email: '',
        gender: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();
    const apiUrl = process.env.NODE_ENV === 'development'
        ? process.env.REACT_APP_LOCAL_API_URL
        : process.env.REACT_APP_PRODUCTION_API_URL;

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`${apiUrl}/fetch-user`, {
                    withCredentials: true, // Ensure this is set
                });

                setUserData(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
                toast.error('Failed to fetch user data. Please log in again.');
                // navigate('/login');
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = async () => {
        try {
            const response = await axios.post(
                `${apiUrl}/edit-profile`,
                userData,
                { withCredentials: true }
            );

            if (response.data.success) {
                toast.success('Profile updated successfully');
                setIsEditing(false);
            } else {
                toast.error('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    };

    return (
        <>
            <Navbar />
            <div className="profile-component">
                <div className="profile-container">
                    <ToastContainer />
                    <div className="profile-wrapper">
                        {/* Left Card: Profile Picture */}
                        <div className="profile-left-card">
                            <div className="profile-picture-container">
                                <img
                                    src="https://bootdey.com/img/Content/avatar/avatar7.png"
                                    alt="Profile"
                                    className="profile-picture"
                                />
                            </div>
                            <div className="profile-actions">
                                <button className="btn btn-primary">Follow</button>
                                <button className="btn btn-outline-primary">Message</button>
                            </div>
                        </div>

                        {/* Right Card: User Information */}
                        <div className="profile-right-card">
                            <div className="profile-info">
                                <div className="info-item">
                                    <label>Full Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={userData.firstName}
                                            onChange={handleChange}
                                            placeholder="First Name"
                                        />
                                    ) : (
                                        <p>{`${userData.firstName} ${userData.middleName || ''} ${userData.surname}`}</p>
                                    )}
                                </div>
                                <div className="info-item">
                                    <label>Middle Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="middleName"
                                            value={userData.middleName}
                                            onChange={handleChange}
                                            placeholder="Middle Name"
                                        />
                                    ) : (
                                        <p>{userData.middleName || 'N/A'}</p>
                                    )}
                                </div>
                                <div className="info-item">
                                    <label>Surname</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="surname"
                                            value={userData.surname}
                                            onChange={handleChange}
                                            placeholder="Surname"
                                        />
                                    ) : (
                                        <p>{userData.surname}</p>
                                    )}
                                </div>
                                <div className="info-item">
                                    <label>Email</label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            name="email"
                                            value={userData.email}
                                            onChange={handleChange}
                                            placeholder="Email"
                                        />
                                    ) : (
                                        <p>{userData.email}</p>
                                    )}
                                </div>
                                <div className="info-item">
                                    <label>Phone</label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            name="mobile"
                                            value={userData.mobile}
                                            onChange={handleChange}
                                            placeholder="Phone"
                                        />
                                    ) : (
                                        <p>{userData.mobile}</p>
                                    )}
                                </div>
                                <div className="info-item">
                                    <label>Gender</label>
                                    {isEditing ? (
                                        <select
                                            name="gender"
                                            value={userData.gender}
                                            onChange={handleChange}
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    ) : (
                                        <p>{userData.gender}</p>
                                    )}
                                </div>
                            </div>
                            <div className="edit-button">
                                {isEditing ? (
                                    <button className="btn btn-info" onClick={handleSave}>
                                        Save
                                    </button>
                                ) : (
                                    <button className="btn btn-info" onClick={handleEdit}>
                                        Edit
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;