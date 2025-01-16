import React, { useState } from 'react';
import axios from 'axios';
import {
    Button,
    TextField,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import Navbar from './navbar';
import qrCodeImage from './qr-code-img.jpg'; // Import the local QR code image
import { saveAs } from 'file-saver'; // For downloading PDF
import './payment.css'; // Import CSS for animations

const Payment = () => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showAnimation, setShowAnimation] = useState(false);
    const [receipt, setReceipt] = useState(null);
    const [openPopup, setOpenPopup] = useState(false);

    const handlePayment = async () => {
        if (!amount) {
            setError('Please enter the amount.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccessMessage('');
        setShowAnimation(true);

        // Simulate scanning and payment process
        setTimeout(() => {
            const isPaymentSuccessful = Math.random() > 0.5; // Randomly simulate success/failure
            const paymentId = `pay_${Math.floor(Math.random() * 1000000)}`;
            const receiptData = {
                amount: parseFloat(amount),
                paymentId,
                status: isPaymentSuccessful ? 'Success' : 'Failed',
                date: new Date().toLocaleString(),
                message: isPaymentSuccessful
                    ? 'Payment successful! Thank you for your payment.'
                    : 'Payment failed. Please try again.',
            };

            setReceipt(receiptData);
            setOpenPopup(true);
            setShowAnimation(false);
            setLoading(false);

            if (isPaymentSuccessful) {
                setSuccessMessage('Payment successful!');
            } else {
                setError('Payment failed. Please try again.');
            }
        }, 3000); // Simulate a 3-second delay for the animation
    };

    const handleClosePopup = () => {
        setOpenPopup(false);
    };

    const handleDownloadReceipt = () => {
        if (!receipt) return;

        const receiptText = `
            Payment Receipt
            -------------------------
            Amount: ₹${receipt.amount}
            Payment ID: ${receipt.paymentId}
            Status: ${receipt.status}
            Date: ${receipt.date}
            Message: ${receipt.message}
        `;

        const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, `receipt_${receipt.paymentId}.txt`);
    };

    return (
        <>
            <Navbar />
            <div className="payment-container">
                <Paper elevation={3} style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
                    <Typography variant="h5" gutterBottom>
                        UPI Payment
                    </Typography>
                    <div className="qr-code-container">
                        <img src={qrCodeImage} alt="QR Code" className="qr-code-image" />
                        {showAnimation && (
                            <div className="scanning-animation">
                                <div className="scan-line"></div>
                            </div>
                        )}
                    </div>
                    <TextField
                        label="Amount"
                        type="number"
                        fullWidth
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        style={{ marginBottom: '20px' }}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handlePayment}
                        disabled={loading}
                        fullWidth
                    >
                        {loading ? <CircularProgress size={24} /> : 'Pay Now'}
                    </Button>

                    {successMessage && (
                        <Alert severity="success" style={{ marginTop: '20px' }}>
                            {successMessage}
                        </Alert>
                    )}

                    {error && (
                        <Alert severity="error" style={{ marginTop: '20px' }}>
                            {error}
                        </Alert>
                    )}
                </Paper>

                {/* Receipt Popup */}
                <Dialog open={openPopup} onClose={handleClosePopup}>
                    <DialogTitle>Payment Receipt</DialogTitle>
                    <DialogContent>
                        {receipt && (
                            <div>
                                <Typography variant="body1">
                                    <strong>Amount:</strong> ₹{receipt.amount}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Payment ID:</strong> {receipt.paymentId}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Status:</strong> {receipt.status}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Date:</strong> {receipt.date}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Message:</strong> {receipt.message}
                                </Typography>
                            </div>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClosePopup}>Close</Button>
                        <Button onClick={handleDownloadReceipt} color="primary">
                            Download Receipt
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </>
    );
};

export default Payment;