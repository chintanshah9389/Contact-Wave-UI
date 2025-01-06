import React, { useEffect, useState } from 'react';
import './sessionexpiration.css'; // Import the CSS

const SessionExpirationPopup = () => {
    const [show, setShow] = useState(false);

    const checkTokenExpiration = async () => {
        try {
            const response = await fetch('http://localhost:5000/check-token-expiration', {
                credentials: 'include', // Include cookies
            });

            // Check if the response is OK (status code 200-299)
            if (!response.ok) {
                if (response.status === 401) {
                    // Token is invalid or expired, show the dialog
                    setShow(true);
                    return;
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // Parse the response as JSON
            const data = await response.json();

            // Show dialog 2 minutes before expiration
            if (data.timeLeft <= 120000) { // 2 minutes in milliseconds
                setShow(true);
            }
        } catch (error) {
            console.error('Error checking token expiration:', error);
        }
    };

    useEffect(() => {
        const interval = setInterval(checkTokenExpiration, 10000); // Check every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const handleContinue = async () => {
        // Refresh the token or extend the session
        const response = await fetch('/refresh-token', {
            credentials: 'include',
        });
        if (response.ok) {
            setShow(false);
        }
    };

    const handleLogout = async () => {
        // Clear the token and redirect to login
        await fetch('/logout', {
            method: 'POST',
            credentials: 'include',
        });
        window.location.href = '/login';
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