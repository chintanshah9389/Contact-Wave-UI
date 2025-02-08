import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios'; // Import Axios
import './sessionexpiration.css';

const SessionExpirationPopup = () => {
    const [show, setShow] = useState(false);
    const [intervalId, setIntervalId] = useState(null); // Store the interval ID
    const location = useLocation();
    const apiUrl = process.env.NODE_ENV === 'development'
        ? process.env.REACT_APP_LOCAL_API_URL
        : process.env.REACT_APP_PRODUCTION_API_URL;

        const checkTokenExpiration = async () => {
            // Disable the popup on login and registration pages
            if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/home') {
                return;
            }
        
            try {
                const response = await axios.get(`${apiUrl}/check-token-expiration`, {
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
            const checkInitialToken = async () => {
                try {
                    const response = await axios.get(`${apiUrl}/check-token-expiration`, {
                        withCredentials: true,
                    });
                    if (response.data.timeLeft <= 0) {
                        setShow(true);
                    }
                } catch (error) {
                    if (error.response && error.response.status === 401) {
                        setShow(true);
                    } else {
                        console.error('Error checking initial token:', error);
                    }
                }
            };
        
            if (location.pathname !== '/login' && location.pathname !== '/register' && location.pathname !=="/home") {
                checkInitialToken();
            }
        }, [location.pathname]);

    useEffect(() => {
        checkTokenExpiration();
        const interval = setInterval(checkTokenExpiration, 300000); // Check every 5 minutes
        setIntervalId(interval);
        return () => clearInterval(interval);
    }, [location.pathname]); // Re-run effect when the route changes

    const handleContinue = async () => {
        try {
            // Call the /refresh-token endpoint to refresh the token
            const response = await axios.post(`${apiUrl}/refresh-token`, {}, {
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
            await axios.post(`${apiUrl}/logout`, {}, {
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