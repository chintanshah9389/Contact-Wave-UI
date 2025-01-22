import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios'; // Import Axios
import './sessionexpiration.css';

const SessionExpirationPopup = () => {
    const [show, setShow] = useState(false);
    const [intervalId, setIntervalId] = useState(null); // Store the interval ID
    const location = useLocation();

    const checkTokenExpiration = async () => {
        // Disable the popup on login and registration pages
        if (location.pathname === '/login' || location.pathname === '/register') {
            return;
        }

        try {
            const response = await axios.get('https://contact-wave-backend-1.onrender.com/check-token-expiration', {
                withCredentials: true, // Include cookies
            });

            // Show dialog 2 minutes before expiration
            if (response.data.timeLeft <= 120000) { // 2 minutes in milliseconds
                setShow(true);
                clearInterval(intervalId); // Clear the interval when the popup is shown
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                // Token is invalid or expired, show the dialog
                setShow(true);
                clearInterval(intervalId); // Clear the interval when the popup is shown
            } else {
                console.error('Error checking token expiration:', error);
            }
        }
    };

    useEffect(() => {
        const interval = setInterval(checkTokenExpiration, 120000); // Check every 10 seconds
        setIntervalId(interval); // Store the interval ID
        return () => clearInterval(interval);
    }, [location.pathname]); // Re-run effect when the route changes

    const handleContinue = async () => {
        try {
            // Call the /refresh-token endpoint to refresh the token
            const response = await axios.post('https://contact-wave-backend-1.onrender.com/refresh-token', {}, {
                withCredentials: true, // Include cookies
            });

            if (response.status === 200) {
                setShow(false); // Hide the popup
                // Restart the interval after refreshing the token
                const newInterval = setInterval(checkTokenExpiration, 10000);
                setIntervalId(newInterval);
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            // If refreshing fails, force logout
            handleLogout();
        }
    };

    const handleLogout = async () => {
        try {
            // Clear the token and redirect to login
            await axios.post('https://contact-wave-backend-1.onrender.com/logout', {}, {
                withCredentials: true, // Include cookies
            });
            window.location.href = '/login';
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <>
            {show && (
                <div className="dialog-overlay">
                    <div className="dialog-box">
                        <div className="dialog-header">Session Expiration</div>
                        <div className="dialog-body">
                            Your session is about to expire. Do you want to continue or logout?
                        </div>
                        <div className="dialog-footer">
                            <button className="btn-logout" onClick={handleLogout}>
                                Logout
                            </button>
                            <button className="btn-continue" onClick={handleContinue}>
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SessionExpirationPopup;