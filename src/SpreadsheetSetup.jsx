import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Typography, Paper, Container, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton'; // If using Material-UI
import Navbar from './navbar';
import './SpreadsheetSetup.css';

const SpreadsheetSetup = () => {
    const [spreadsheetLink, setSpreadsheetLink] = useState('');
    const [spreadsheetName, setSpreadsheetName] = useState('');
    const [error, setError] = useState('');
    const [spreadsheets, setSpreadsheets] = useState([]);
    const [selectedSpreadsheet, setSelectedSpreadsheet] = useState('');
    const navigate = useNavigate();

    // Fetch spreadsheets for the logged-in user
    useEffect(() => {
        const fetchSpreadsheets = async () => {
            try {
                const response = await axios.get('https://contact-wave-backend-1.onrender.com/get-spreadsheets', {
                    withCredentials: true, // Include cookies
                });

                if (response.data.success) {
                    setSpreadsheets(response.data.spreadsheets);
                }
            } catch (err) {
                console.error('Error fetching spreadsheets:', err);
                if (err.response && err.response.status === 401) {
                    navigate('/login'); // Redirect to login if unauthorized
                }
            }
        };

        fetchSpreadsheets();
    }, [navigate]);

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
        if (!spreadsheetId || !spreadsheetName) {
            setError('Spreadsheet link and name are required.');
            return;
        }

        try {
            // Step 1: Append the spreadsheet ID and name to both sheets
            const setSpreadsheetResponse = await axios.post(
                'https://contact-wave-backend-1.onrender.com/set-spreadsheet',
                { spreadsheetId, spreadsheetName },
                { withCredentials: true }
            );

            if (!setSpreadsheetResponse.data.success) {
                setError('Failed to save spreadsheet. Please try again.');
                return;
            }

            // Step 2: Set the active spreadsheet in the backend
            const setActiveResponse = await axios.post(
                'https://contact-wave-backend-1.onrender.com/set-active-spreadsheet',
                { spreadsheetId },
                { withCredentials: true }
            );

            if (!setActiveResponse.data.success) {
                setError('Failed to set active spreadsheet. Please try again.');
                return;
            }

            // Clear the form and redirect to the display page
            setSpreadsheetLink('');
            setSpreadsheetName('');
            setError('');
            navigate('/create-message');
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error('Error saving spreadsheet:', err);
            if (err.response && err.response.status === 401) {
                navigate('/login'); // Redirect to login if unauthorized
            }
        }
    };

    const handleSpreadsheetChange = async (event) => {
        const selectedSpreadsheetId = event.target.value;
        setSelectedSpreadsheet(selectedSpreadsheetId);

        try {
            // Set the active spreadsheet in the backend
            await axios.post(
                'https://contact-wave-backend-1.onrender.com/set-active-spreadsheet',
                { spreadsheetId: selectedSpreadsheetId },
                { withCredentials: true }
            );

            // Redirect to the display page
            navigate('/display');
        } catch (err) {
            console.error('Error setting active spreadsheet:', err);
        }
    };

    const handleRemoveSpreadsheet = async (spreadsheetId) => {
        const confirmRemove = window.confirm('Are you sure you want to remove this spreadsheet?');
        if (!confirmRemove) return;

        try {
            const response = await axios.post(
                'https://contact-wave-backend-1.onrender.com/remove-spreadsheet',
                { spreadsheetId },
                { withCredentials: true }
            );

            if (response.data.success) {
                // Refresh the list of spreadsheets
                const updatedSpreadsheets = spreadsheets.filter(
                    (spreadsheet) => spreadsheet.id !== spreadsheetId
                );
                setSpreadsheets(updatedSpreadsheets);
                setSelectedSpreadsheet(''); // Clear the selected spreadsheet
            } else {
                setError('Failed to remove spreadsheet. Please try again.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error('Error removing spreadsheet:', err);
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
                        Enter the Google Form spreadsheet link and name below.
                    </Typography>
                    <TextField
                        label="Google Spreadsheet Link"
                        variant="outlined"
                        fullWidth
                        value={spreadsheetLink}
                        onChange={(e) => setSpreadsheetLink(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        label="Spreadsheet Name"
                        variant="outlined"
                        fullWidth
                        value={spreadsheetName}
                        onChange={(e) => setSpreadsheetName(e.target.value)}
                        margin="normal"
                    />
                    {error && <Typography color="error">{error}</Typography>}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={!spreadsheetLink || !spreadsheetName}
                    >
                        Submit
                    </Button>

                    <FormControl fullWidth margin="normal">
                        <InputLabel>Select Spreadsheet</InputLabel>
                        <Select
                            value={selectedSpreadsheet}
                            onChange={handleSpreadsheetChange}
                            label="Select Spreadsheet"
                        >
                            {spreadsheets.map((spreadsheet) => (
                                <MenuItem key={spreadsheet.id} value={spreadsheet.id}>
                                    {spreadsheet.name}
                                    <IconButton
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent the dropdown from closing
                                            handleRemoveSpreadsheet(spreadsheet.id);
                                        }}
                                        size="small"
                                        style={{ marginLeft: 'auto' }}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Paper>
            </Container>
        </>
    );
};

export default SpreadsheetSetup;