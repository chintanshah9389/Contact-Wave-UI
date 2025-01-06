import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './display.css';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import Navbar from './navbar';

const Display = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate(); // Use navigate hook for routing

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/fetch-registrations');
                setData(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (!data.length) {
        return <div className="no-data">No registrations found</div>;
    }

    // Filter out rows where required fields are missing
    const filteredData = data.slice(1).filter((row) => {
        const hasValidData =
            row[0]?.trim() && // First Name
            row[1]?.trim() && // Middle Name
            row[2]?.trim() && // Surname
            row[3]?.trim() && // Mobile
            row[4]?.trim();   // Email

        return hasValidData; // Only include rows with valid data
    });

    return (
        <>
            <Navbar />
            <div className="display-container">
                <div className="profile-container">
                    <h2>Registered Profiles</h2>
                    <div className="profiles">
                        {filteredData.map((row, index) => (
                            <div className="profile-card" key={index}>
                                <h3>{`${row[0]} ${row[1]} ${row[2]}`}</h3>
                                <p><strong>Mobile:</strong> {row[3]}</p>
                                <p><strong>Email:</strong> {row[4]}</p>
                                <p><strong>Gender:</strong> {row[5]}</p>
                                <p><strong>Password:</strong> {row[6]}</p>
                            </div>
                        ))}
                    </div>
                    <Button
                        variant="contained"
                        className="create-message-button"
                        onClick={() => navigate('/create-message')} // Updated to use navigate
                    >
                        Create Message
                    </Button>
                </div>
            </div>
        </>
    );
};

export default Display;