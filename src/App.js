import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './Login';
import Registration from './Registration';
import './App.css';
import Display from './Display';
import CreateMessage from './createMessage';
import SendMessage from './sendMessage';
import Profile from './Profile';
import SessionExpirationPopup from './sessionexpiration';
import SpreadsheetSetup from './SpreadsheetSetup';

const App = () => {
    return (
        <Router>
            <SessionExpirationPopup />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Registration />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/display" element={<Display/>}/>
                <Route path="/create-message" element={<CreateMessage />} />
                <Route path="/change-sheet" element={<SpreadsheetSetup />} />
                <Route path="/send-message" element={<SendMessage />} />
                <Route path="/profile" element={<Profile/>} />
            </Routes>
        </Router>
    );
};

export default App;