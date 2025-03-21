import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Avatar, Menu, MenuItem } from '@mui/material';
import { Logout, Home, DisplaySettings } from '@mui/icons-material'; // Icons for navigation
import { MdAccountCircle } from 'react-icons/md'; // Default profile icon
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './navbar.css'; // Import the CSS file

const Navbar = ({ userName }) => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState(null); // For profile menu
    const profilePic = null; // Replace with actual profile picture URL if available
    const apiUrl = process.env.NODE_ENV === 'development'
        ? process.env.REACT_APP_LOCAL_API_URL
        : process.env.REACT_APP_PRODUCTION_API_URL;

    // Handle profile menu open
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    // Handle profile menu close
    const handleMenuClose = (action) => {
        setAnchorEl(null);
        if (action === 'profile') {
            navigate('/profile');
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await axios.post(`${apiUrl}/logout`, {}, { withCredentials: true });
            navigate('/login');
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <div className='navbar-container'>
            <AppBar position="static" className="navbar">
                <Toolbar>
                    {/* Title on the left */}
                    <Typography variant="h6" component="div" className="navbar-title">
                        Contact Wave
                    </Typography>

                    {/* Navigation Links */}
                    <div className="navbar-links">
                        <Button color="inherit" startIcon={<DisplaySettings />} className="navbar-button" onClick={() => navigate('/home')}>
                        Home
                    </Button>
                        <Button color="inherit" startIcon={<DisplaySettings />} className="navbar-button" onClick={() => navigate('/display')}>
                            Display
                        </Button>
                        <Button color="inherit" startIcon={<DisplaySettings />} className="navbar-button" onClick={() => navigate('/create-message')}>
                            Create Message
                        </Button>
                        <Button color="inherit" startIcon={<DisplaySettings />} className="navbar-button" onClick={() => navigate('/payment')}>
                            Payment
                        </Button>
                        {/* <Button color="inherit" startIcon={<DisplaySettings />} className="navbar-button" onClick={() => navigate('/send-message')}>
                        Send Message
                    </Button> */}
                    </div>

                    {/* Profile Section */}
                    <div className="navbar-profile">
                        <Typography variant="subtitle1" className="user-name">
                            {userName}
                        </Typography>
                        <IconButton color="inherit" onClick={handleMenuOpen} className="profile-icon">
                            {profilePic ? (
                                <Avatar alt="Profile" src={profilePic} className="profile-pic" />
                            ) : (
                                <MdAccountCircle size={30} className="profile-icon-default" />
                            )}
                        </IconButton>

                        {/* Profile Menu */}
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={() => handleMenuClose()}
                            className="profile-menu"
                        >
                            <MenuItem onClick={() => handleMenuClose('profile')}>Profile</MenuItem>
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </div>
                </Toolbar>
            </AppBar>
        </div>
    );
};

export default Navbar;