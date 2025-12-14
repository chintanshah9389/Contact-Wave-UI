import React, { useEffect } from 'react';
import { HashRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Login from './Login';
import Registration from './Registration';
import './App.css';
import Display from './Display';
import CreateMessage from './createMessage';
import SendMessage from './sendMessage';
import Profile from './Profile';
import SessionExpirationPopup from './sessionexpiration';
import SpreadsheetSetup from './SpreadsheetSetup';
import Payment from './Payment';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import Home from './home';
import PrivacyPolicy from './PrivacyPolicy';
import Shudhikaran from './Shudhikaran';
import SpreadsheetDisplay from './SpreadsheetDisplay';

const App = () => {
    useEffect(() => {
        // Auto-login on app start
        const autoLogin = async () => {
            try {
                const apiUrl = process.env.NODE_ENV === 'development'
                    ? process.env.REACT_APP_LOCAL_API_URL
                    : process.env.REACT_APP_PRODUCTION_API_URL;

                await axios.post(`${apiUrl}/login`, {
                    username: '9175366700',
                    password: 'Moon@11light'
                }, {
                    withCredentials: true
                });
                
                console.log('Auto-login successful');
            } catch (err) {
                console.log('Auto-login info:', err.message);
                // Silently fail - user can still browse public pages
            }
        };

        autoLogin();
    }, []);

    return (
        <Router>
            <AppContent />
        </Router>
    );
};

const AppContent = () => {
    const location = useLocation();

    // Define the routes where the SessionExpirationPopup should not appear
    // LOGIN DISABLED TEMPORARILY - All routes bypass authentication
    const noPopupRoutes = ['/login', '/register', '/home', '/shudhikaran', '/privacy-policy', '/spreadsheet-display', '/display', '/create-message', '/send-message', '/profile', '/payment', '/change-sheet'];

    // Check if the current route is in the noPopupRoutes array
    // CHANGE TO (Login Enabled):
    //const shouldShowPopup = !noPopupRoutes.includes(location.pathname);
    const shouldShowPopup = false; // Disabled temporarily

    return (
        <>
            {shouldShowPopup && <SessionExpirationPopup />}
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Registration />} />
                <Route path="/home" element={<Home />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/display" element={<Display />} />
                <Route path="/create-message" element={<CreateMessage />} />
                <Route path="/change-sheet" element={<SpreadsheetSetup />} />
                <Route path="/send-message" element={<SendMessage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/shudhikaran" element={<Shudhikaran />} />
                <Route path="/spreadsheet-display" element={<SpreadsheetDisplay />} />
            </Routes>
        </>
    );
};

export default App;