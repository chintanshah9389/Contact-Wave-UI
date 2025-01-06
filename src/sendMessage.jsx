import React, { useState } from 'react';
import axios from 'axios';
import './sendMessage.css';
import {
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormLabel,
    Button,
    TextareaAutosize,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Cancel } from '@mui/icons-material';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Navbar from './navbar';

const SendMessage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { selectedRows } = location.state || {};

    const [message, setMessage] = useState('');
    const [sendMode, setSendMode] = useState('sms');
    const [results, setResults] = useState([]);
    const [showReportButton, setShowReportButton] = useState(false);
    const [showReportPopup, setShowReportPopup] = useState(false); // Controls the report popup

    const handleSendMessage = async () => {
        if (!message.trim()) {
            alert("Please enter a message to send.");
            return;
        }

        if (!selectedRows || selectedRows.length === 0) {
            alert("Please select at least one recipient.");
            return;
        }

        // Format recipients with all required fields
        const formattedRecipients = selectedRows.map((row) => ({
            firstName: row[0] || "", // First Name
            middleName: row[1] || "", // Middle Name
            lastName: row[2] || "", // Last Name
            phone: row[3]?.trim(), // Phone Number
            email: row[4] || "", // Email Address
        }));

        const apiUrl =
            sendMode === 'sms'
                ? 'http://localhost:5000/send-sms'
                : sendMode === 'whatsapp'
                ? 'http://localhost:5000/send-whatsapp'
                : 'http://localhost:5000/send-telegram';

        try {
            const response = await axios.post(apiUrl, {
                message,
                recipients: formattedRecipients,
            });

            setResults(response.data.results);
            setShowReportButton(true); // Show the "Show Report" button
            alert(response.data.message);
        } catch (error) {
            console.error(`Error sending ${sendMode} messages:`, error);
            alert(`Failed to send ${sendMode} messages.`);
        }
    };

    const handleShowReport = () => {
        setShowReportPopup(true); // Open the report popup
    };

    const handleCloseReportPopup = () => {
        setShowReportPopup(false); // Close the report popup
    };

    const handleDownloadPDF = () => {
        const input = document.getElementById('report-table'); // Get the table element
        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4'); // Create a PDF in portrait mode
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width; // Calculate height
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save('report.pdf'); // Download the PDF
        });
    };

    return (
        <>
            <Navbar/>
        <div className="send-message-container">
            <h2>Send Messages</h2>
            <TextareaAutosize
                placeholder="Enter your message here"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                    width: '100%',
                    height: '100px',
                    marginBottom: '20px',
                    fontSize: '16px',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                }}
            />
            <FormControl component="fieldset" className="send-mode-selector">
                <FormLabel component="legend">Send via</FormLabel>
                <RadioGroup
                    row
                    value={sendMode}
                    onChange={(e) => setSendMode(e.target.value)}
                >
                    <FormControlLabel value="sms" control={<Radio />} label="SMS" />
                    <FormControlLabel value="whatsapp" control={<Radio />} label="WhatsApp" />
                    <FormControlLabel value="telegram" control={<Radio />} label="Telegram" />
                </RadioGroup>
            </FormControl>
            <div className="actions">
                <Button variant="contained" color="primary" onClick={handleSendMessage}>
                    Send
                </Button>
                <Button variant="outlined" onClick={() => navigate('/create-message')}>
                    Cancel
                </Button>
            </div>

            {/* Show Report Button */}
            {showReportButton && (
                <div className="report-button-container">
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleShowReport}
                        style={{ marginTop: '20px' }}
                    >
                        Show Report
                    </Button>
                </div>
            )}

            {/* Report Popup */}
            <Dialog
                open={showReportPopup}
                onClose={handleCloseReportPopup}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Message Report</DialogTitle>
                <DialogContent>
                    <TableContainer component={Paper} id="report-table">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>First Name</TableCell>
                                    <TableCell>Middle Name</TableCell>
                                    <TableCell>Last Name</TableCell>
                                    <TableCell>Mobile</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Message Sent</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {results.map((result, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{result.firstName}</TableCell>
                                        <TableCell>{result.middleName}</TableCell>
                                        <TableCell>{result.lastName}</TableCell>
                                        <TableCell>{result.phone}</TableCell>
                                        <TableCell>{result.email}</TableCell>
                                        <TableCell>
                                            {result.status === 'success' ? (
                                                <CheckCircle style={{ color: 'green' }} />
                                            ) : (
                                                <Cancel style={{ color: 'red' }} />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseReportPopup} color="primary">
                        Close
                    </Button>
                    <Button onClick={handleDownloadPDF} color="primary">
                        Download PDF
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
        </>
    );
};

export default SendMessage;