import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
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

const App = () => {
    return (
        <Router>
            <AppContent />
        </Router>
    );
};

const AppContent = () => {
    const location = useLocation();

    // Define the routes where the SessionExpirationPopup should not appear
    const noPopupRoutes = ['/login', '/register', '/home'];

    // Check if the current route is in the noPopupRoutes array
    const shouldShowPopup = !noPopupRoutes.includes(location.pathname);

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
            </Routes>
        </>
    );
};

export default App;