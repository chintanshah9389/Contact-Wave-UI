import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Typography, Paper, Container } from '@mui/material';
import Navbar from './navbar';
import './SpreadsheetSetup.css';

const SpreadsheetSetup = () => {
    const [spreadsheetLink, setSpreadsheetLink] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const extractSpreadsheetId = (link) => {
        try {
            const url = new URL(link);
            const pathSegments = url.pathname.split('/');
            const spreadsheetId = pathSegments[pathSegments.indexOf('d') + 1];
            return spreadsheetId;
        } catch (err) {
            setError('Invalid Google Spreadsheet link. Please check the link and try again.');
            return null;
        }
    };

    const handleSubmit = async () => {
        const spreadsheetId = extractSpreadsheetId(spreadsheetLink);
        if (!spreadsheetId) return;

        try {
            // Send the spreadsheet ID to the backend
            const response = await axios.post('http://localhost:5000/set-spreadsheet-id', {
                spreadsheetId,
            });

            if (response.data.success) {
                navigate('/create-message'); // Redirect to the createMessage page
            } else {
                setError('Failed to set spreadsheet ID. Please try again.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error('Error setting spreadsheet ID:', err);
        }
    };

    return (
        <>
            <Navbar />
            <Container className="spreadsheet-setup-container">
                <Paper elevation={3} className="spreadsheet-setup-paper">
                    <Typography variant="h4" gutterBottom>
                        Setup Spreadsheet
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        Enter the Google Form spreadsheet link below. Make sure the spreadsheet is shared with the following client email:
                    </Typography>
                    <Typography variant="body2" className="client-email">
                    abc@gmail.com
                    </Typography>
                    <TextField
                        label="Google Spreadsheet Link"
                        variant="outlined"
                        fullWidth
                        value={spreadsheetLink}
                        onChange={(e) => setSpreadsheetLink(e.target.value)}
                        margin="normal"
                    />
                    {error && <Typography color="error">{error}</Typography>}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={!spreadsheetLink}
                    >
                        Submit
                    </Button>
                </Paper>
            </Container>
        </>
    );
};

export default SpreadsheetSetup;