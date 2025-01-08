import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Menu,
    MenuItem,
    IconButton,
    InputAdornment
} from '@mui/material';
import Paper from '@mui/material/Paper';
import SearchIcon from '@mui/icons-material/Search';
import { ArrowDropDown, ArrowDropUp } from '@mui/icons-material';
import './createMessage.css';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Cookies from 'js-cookie';
import Navbar from './navbar';

const CreateMessage = ({ history }) => {
    const [data, setData] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [filter, setFilter] = useState('');
    const [groupDialogOpen, setGroupDialogOpen] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [selectAllChecked, setSelectAllChecked] = useState(false);
    const [groups, setGroups] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [groupUsers, setGroupUsers] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [exportAnchorEl, setExportAnchorEl] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editUserData, setEditUserData] = useState(null);
    const [existingGroupsDialogOpen, setExistingGroupsDialogOpen] = useState(false);
    const [selectedExistingGroups, setSelectedExistingGroups] = useState([]);
    const [combineGroupsDialogOpen, setCombineGroupsDialogOpen] = useState(false);
    const [newCombinedGroupName, setNewCombinedGroupName] = useState('');
    const [newCombinedGroupDescription, setNewCombinedGroupDescription] = useState('');
    const navigate = useNavigate();

    const columnsToHide = [7, 8,9, 10,11]; // Unique ID (index 7) and Group Name (index 8)

    useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/fetch-registrations', {
          withCredentials: true,
        });
        setData(response.data);
        // setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        // setLoading(false);
      }
    };

    fetchData();
  }, []); // Add dependencies if needed

    const handleChangeSheet = () => {
        navigate('/change-sheet');
    };

    const handleFilterChange = (event) => {
        setFilter(event.target.value.toLowerCase());
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            // Select all rows in the filtered data
            const newSelectedRows = filteredData;
            setSelectedRows(newSelectedRows);
        } else {
            // Deselect all rows
            setSelectedRows([]);
        }
        setSelectAllChecked(event.target.checked);
    };

    const handleRowSelection = (row) => {
        const isSelected = selectedRows.includes(row);
        if (isSelected) {
            const updatedRows = selectedRows.filter((selectedRow) => selectedRow !== row);
            setSelectedRows(updatedRows);
        } else {
            const updatedRows = [...selectedRows, row];
            setSelectedRows(updatedRows);
        }
    };

    const handleCreateGroup = async () => {
        if (selectedRows.length === 0) {
            alert("Please select at least one recipient to create a group.");
            return;
        }

        if (!groupName.trim() || !groupDescription.trim()) {
            alert("Group name and description are required.");
            return;
        }

        try {
            const uniqueRows = Array.from(new Set(selectedRows.map((row) => row[7]))).map((uniqueId) =>
                selectedRows.find((row) => row[7] === uniqueId)
            );

            const selectedFields = uniqueRows.map((row) => ({
                uniqueId: row[7],
                name: row[0],
                email: row[4],
                phone: row[3],
            }));

            const response = await axios.post('http://localhost:5000/create-group', {
                groupName,
                description: groupDescription,
                selectedFields,
            });
            alert(response.data.message || "Group created successfully!");

            setFilter('');
            setSelectedRows([]);
            setGroupName('');
            setGroupDescription('');
            setGroupDialogOpen(false);
            setSelectAllChecked(false);
        } catch (error) {
            console.error("Error creating group:", error);
            alert("Failed to create the group. Please try again.");
        }
    };

    const openGroupDialog = () => {
        if (selectedRows.length === 0) {
            alert("Please select at least one recipient to create a group.");
            return;
        }
        setGroupDialogOpen(true);
    };

    const closeGroupDialog = () => {
        setGroupDialogOpen(false);
        setGroupName('');
        setGroupDescription('');
    };

    const handleAddToExistingGroups = () => {
        setExistingGroupsDialogOpen(true);
    };

    const handleExistingGroupsDialogClose = () => {
        setExistingGroupsDialogOpen(false);
        setSelectedExistingGroups([]);
    };

    const handleExistingGroupsSave = async () => {
        if (selectedExistingGroups.length === 0) {
            alert('Please select at least one group.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/add-to-existing-groups', {
                groupNames: selectedExistingGroups,
                selectedFields: selectedRows.map((row) => ({
                    uniqueId: row[7],
                    name: row[0],
                    email: row[4],
                    phone: row[3],
                })),
            });

            alert(response.data.message || 'Users added to existing groups successfully!');
            setSelectedRows([]);
            setExistingGroupsDialogOpen(false);
        } catch (error) {
            console.error('Error adding users to existing groups:', error);
            alert('Failed to add users to existing groups.');
        }
    };

    const handleSendMessage = () => {
        if (selectedRows.length === 0) {
            alert("Please select at least one recipient.");
            return;
        }

        navigate('/send-message', { state: { selectedRows } });
    };

    const handleShowGroupsClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleCloseGroups = () => {
        setAnchorEl(null);
    };

    const handleGroupSelection = async (groupName) => {
        try {
            const response = await axios.get(`http://localhost:5000/fetch-group-users?groupName=${groupName}`);
            const transformedUsers = response.data.users.map(user => [
                user.name,
                user.middleName,
                user.surname,
                user.mobile,
                user.email,
                user.gender,
                user.password,
                user.uniqueId,
            ]);
            console.log(transformedUsers);
            setGroupUsers(transformedUsers || ["Fail to show Groups"]);
            setSelectedGroup(groupName);
        } catch (error) {
            console.error('Error fetching group users:', error);
        }
        handleCloseGroups();
    };

    const handleCancelGroupFilter = () => {
        setSelectedGroup(null);
        setGroupUsers([]);
    };

    const handleExportClick = (event) => {
        setExportAnchorEl(event.currentTarget);
    };

    const handleExportClose = () => {
        setExportAnchorEl(null);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        const tableData = (selectedGroup ? groupUsers : data.slice(1).filter((row) => row.join(' ').toLowerCase().includes(filter))).map(row =>
            row.filter((_, index) => !columnsToHide.includes(index))
        );
        doc.autoTable({
            head: [data[0].filter((_, index) => !columnsToHide.includes(index))],
            body: tableData,
        });
        doc.save('table.pdf');
        handleExportClose();
    };

    const exportToExcel = () => {
        const tableData = (selectedGroup ? groupUsers : data.slice(1).filter((row) => row.join(' ').toLowerCase().includes(filter))).map(row =>
            row.filter((_, index) => !columnsToHide.includes(index))
        );
        const ws = XLSX.utils.aoa_to_sheet([data[0].filter((_, index) => !columnsToHide.includes(index)), ...tableData]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, 'table.xlsx');
        handleExportClose();
    };

    const handleEditClick = (row) => {
        setEditUserData(row);
        setEditDialogOpen(true);
    };

    const handleEditDialogClose = () => {
        setEditDialogOpen(false);
        setEditUserData(null);
    };

    const handleEditSave = async () => {
        if (!editUserData) return;

        try {
            const response = await axios.post('http://localhost:5000/edit-row', {
                uniqueId: editUserData[7], // Unique ID is at index 7
                firstName: editUserData[0],
                middleName: editUserData[1],
                surname: editUserData[2],
                mobile: editUserData[3],
                email: editUserData[4],
                gender: editUserData[5],
            });

            if (response.data.success) {
                alert('Row updated successfully!');
                const updatedData = data.map((row) =>
                    row[7] === editUserData[7] ? [...editUserData] : row
                );
                setData(updatedData);
                handleEditDialogClose();
            } else {
                alert('Failed to update row.');
            }
        } catch (error) {
            console.error('Error updating row:', error);
            alert('Failed to update row.');
        }
    };

    const handleDeleteClick = async (uniqueId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                // Send the DELETE request with credentials (cookies)
                const response = await axios.delete('http://localhost:5000/delete-user', {
                    data: { uniqueId },
                    withCredentials: true, // Include cookies in the request
                });

                console.log('Response from delete-user:', response.data); // Log the response for debugging

                if (response.data.success) {
                    alert('User deleted successfully!');
                    const updatedData = data.filter((row) => row[7] !== uniqueId);
                    setData(updatedData);
                } else {
                    alert('Failed to delete user.');
                }
            } catch (error) {
                console.error('Error deleting user:', error);
                if (error.response && error.response.status === 401) {
                    alert('Unauthorized: Please log in again.');
                } else {
                    alert('Failed to delete user.');
                }
            }
        }
    };

    const handleDeleteUsers = async () => {
        if (selectedRows.length === 0) {
            alert('Please select at least one user to delete.');
            return;
        }
    
        if (window.confirm('Are you sure you want to delete the selected users?')) {
            try {
                const uniqueIds = selectedRows.map((row) => row[7]); // Extract uniqueIds of selected users
    
                // Send a request to delete multiple users
                const response = await axios.delete('http://localhost:5000/delete-multiple-users', {
                    data: { uniqueIds },
                    withCredentials: true, // Include cookies for authentication
                });
    
                if (response.data.success) {
                    alert('Selected users deleted successfully!');
    
                    // Update the local state to remove the deleted users
                    const updatedData = data.filter((row) => !uniqueIds.includes(row[7]));
                    setData(updatedData);
    
                    // Clear the selected rows
                    setSelectedRows([]);
                } else {
                    alert('Failed to delete users.');
                }
            } catch (error) {
                console.error('Error deleting users:', error);
                if (error.response && error.response.status === 401) {
                    alert('Unauthorized: Please log in again.');
                } else {
                    alert('Failed to delete users.');
                }
            }
        }
    };

    const handleCombineGroups = () => {
        setCombineGroupsDialogOpen(true);
    };


    // const handleCombineGroups = async () => {
    //     if (selectedExistingGroups.length < 2) {
    //         alert('Please select at least two groups to combine.');
    //         return;
    //     }

    //     const newGroupName = 'Combined Group'; // Example new group name
    //     const description = 'Combined group';

    //     try {
    //         const response = await axios.post('http://localhost:5000/combine-groups', {
    //             groupNames: selectedExistingGroups,
    //             newGroupName,
    //             description,
    //         });

    //         alert(response.data.message || 'Groups combined successfully!');
    //     } catch (error) {
    //         console.error('Error combining groups:', error);
    //         alert('Failed to combine groups.');
    //     }
    // };


    // Filter data based on search and group selection
    const filteredData = (selectedGroup
        ? data.slice(1).filter((row) => row[9]?.split(',').includes(selectedGroup))
        : data.slice(1)
    ).filter((row) => row.join(' ').toLowerCase().includes(filter));

    return (
        <>
            <Navbar />
            <div className='create-message-main'>
                <div className="create-message-container">
                    <h2>Create Message</h2>
                    <div className="search-and-buttons">
                        <TextField
                            label="Search"
                            variant="outlined"
                            className="search-field"
                            value={filter}
                            onChange={handleFilterChange}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <div className="buttons-container">
                            <Button variant="contained" color="primary" onClick={handleSendMessage}>
                                Send Message
                            </Button>
                            <Button variant="contained" color="secondary" onClick={openGroupDialog}>
                                Create Group
                            </Button>
                            <Button
                                variant="contained"
                                color="default"
                                onClick={handleShowGroupsClick}
                                aria-controls={anchorEl ? 'group-menu' : undefined}
                                aria-haspopup="true"
                                endIcon={anchorEl ? <ArrowDropUp /> : <ArrowDropDown />}
                            >
                                {selectedGroup || 'Show Groups'} {/* Show just the group name or "Show Groups" */}
                            </Button>
                            {selectedGroup && (
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={handleCancelGroupFilter}
                                >
                                    Cancel Filter
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                color="default"
                                onClick={handleCombineGroups}
                            >
                                Combine Groups
                            </Button>
                            <Button
                                variant="contained"
                                color="default"
                                onClick={handleChangeSheet}
                            >
                                Change Sheet
                            </Button>
                            <Button
                                variant="contained"
                                color="error" // Red color for delete button
                                onClick={handleDeleteUsers} // Function to handle deletion
                            >
                                Delete Users
                            </Button>
                            <Button
                                variant="contained"
                                color="default"
                                onClick={handleExportClick}
                                aria-controls={exportAnchorEl ? 'export-menu' : undefined}
                                aria-haspopup="true"
                                endIcon={exportAnchorEl ? <ArrowDropUp /> : <ArrowDropDown />}
                            >
                                Export
                            </Button>
                            <Menu
                                id="export-menu"
                                anchorEl={exportAnchorEl}
                                open={Boolean(exportAnchorEl)}
                                onClose={handleExportClose}
                            >
                                <MenuItem onClick={exportToPDF}>PDF</MenuItem>
                                <MenuItem onClick={exportToExcel}>Excel</MenuItem>
                            </Menu>
                            <Menu
                                id="group-menu"
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleCloseGroups}
                            >
                                {groups.map((group, index) => (
                                    <MenuItem key={index} onClick={() => handleGroupSelection(group.groupName)}>
                                        {group.groupName}
                                    </MenuItem>
                                ))}
                            </Menu>
                        </div>
                    </div>

                    <TableContainer component={Paper} className="table-container">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            onChange={handleSelectAll}
                                            indeterminate={selectedRows.length > 0 && selectedRows.length < filteredData.length}
                                            checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                                        />
                                    </TableCell>
                                    {data[0]?.map((header, index) => (
                                        !columnsToHide.includes(index) && <TableCell key={index}>{header}</TableCell>
                                    ))}
                                    <TableCell>Group Name</TableCell> {/* Add Group Name header */}
                                    <TableCell>Actions</TableCell> {/* Actions column for Edit/Delete */}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredData
                                    .filter((row) => {
                                        // Check if the row has valid data (e.g., first name, middle name, last name, mobile, email)
                                        const hasValidData =
                                            row[0]?.trim() && // First Name
                                            row[1]?.trim() && // Middle Name
                                            row[2]?.trim() && // Last Name
                                            row[3]?.trim() && // Mobile
                                            row[4]?.trim();   // Email

                                        return hasValidData; // Only include rows with valid data
                                    })
                                    .map((row, index) => {
                                        const groupNameToDisplay = selectedGroup
                                            ? selectedGroup // Always show the selected group name when a filter is applied
                                            : row[9] || 'No groups'; // Show all groups or "No groups" when no filter is applied

                                        return (
                                            <TableRow key={index}>
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        checked={selectedRows.includes(row)}
                                                        onChange={() => handleRowSelection(row)}
                                                    />
                                                </TableCell>
                                                {row.map((cell, cellIndex) => (
                                                    !columnsToHide.includes(cellIndex) && (
                                                        <TableCell key={cellIndex}>{cell}</TableCell>
                                                    )
                                                ))}
                                                <TableCell>
                                                    {groupNameToDisplay} {/* Display the correct group name */}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="actions-container">
                                                        <Button
                                                            className="edit-button"
                                                            variant="contained"
                                                            onClick={() => handleEditClick(row)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            className="delete-button"
                                                            variant="contained"
                                                            onClick={() => handleDeleteClick(row[7])} // Pass uniqueId
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Dialog open={combineGroupsDialogOpen} onClose={() => setCombineGroupsDialogOpen(false)}>
                        <DialogTitle>Combine Groups</DialogTitle>
                        <DialogContent>
                            <TextField
                                label="New Group Name"
                                fullWidth
                                margin="normal"
                                value={newCombinedGroupName}
                                onChange={(e) => setNewCombinedGroupName(e.target.value)}
                            />
                            <TextField
                                label="New Group Description"
                                fullWidth
                                margin="normal"
                                multiline
                                minRows={3}
                                value={newCombinedGroupDescription}
                                onChange={(e) => setNewCombinedGroupDescription(e.target.value)}
                            />
                            <div>
                                <h4>Select Groups to Combine</h4>
                                {groups.map((group) => (
                                    <div key={group.groupName}>
                                        <Checkbox
                                            checked={selectedExistingGroups.includes(group.groupName)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedExistingGroups([...selectedExistingGroups, group.groupName]);
                                                } else {
                                                    setSelectedExistingGroups(selectedExistingGroups.filter((name) => name !== group.groupName));
                                                }
                                            }}
                                        />
                                        {group.groupName}
                                    </div>
                                ))}
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setCombineGroupsDialogOpen(false)} color="secondary">
                                Cancel
                            </Button>
                            <Button
                                onClick={async () => {
                                    if (selectedExistingGroups.length < 2) {
                                        alert('Please select at least two groups to combine.');
                                        return;
                                    }
                                    if (!newCombinedGroupName.trim() || !newCombinedGroupDescription.trim()) {
                                        alert('Please provide a group name and description.');
                                        return;
                                    }
                                    try {
                                        const response = await axios.post('http://localhost:5000/combine-groups', {
                                            groupNames: selectedExistingGroups,
                                            newGroupName: newCombinedGroupName,
                                            description: newCombinedGroupDescription,
                                        });
                                        alert(response.data.message || 'Groups combined successfully!');
                                        setCombineGroupsDialogOpen(false);
                                        setSelectedExistingGroups([]);
                                        setNewCombinedGroupName('');
                                        setNewCombinedGroupDescription('');
                                    } catch (error) {
                                        console.error('Error combining groups:', error);
                                        alert('Failed to combine groups.');
                                    }
                                }}
                                color="primary"
                            >
                                Combine
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Dialog open={groupDialogOpen} onClose={closeGroupDialog}>
                        <DialogTitle>Create Group</DialogTitle>
                        <DialogContent>
                            <TextField
                                label="Group Name"
                                fullWidth
                                margin="normal"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                            />
                            <TextField
                                label="Group Description"
                                fullWidth
                                margin="normal"
                                multiline
                                minRows={3}
                                value={groupDescription}
                                onChange={(e) => setGroupDescription(e.target.value)}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleAddToExistingGroups}
                            >
                                Add to Existing Groups
                            </Button>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={closeGroupDialog} color="secondary">
                                Cancel
                            </Button>
                            <Button onClick={handleCreateGroup} color="primary">
                                Create Group
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Dialog open={existingGroupsDialogOpen} onClose={handleExistingGroupsDialogClose}>
                        <DialogTitle>Add to Existing Groups</DialogTitle>
                        <DialogContent>
                            {groups.map((group) => (
                                <div key={group.groupName}>
                                    <Checkbox
                                        checked={selectedExistingGroups.includes(group.groupName)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedExistingGroups([...selectedExistingGroups, group.groupName]);
                                            } else {
                                                setSelectedExistingGroups(selectedExistingGroups.filter((name) => name !== group.groupName));
                                            }
                                        }}
                                    />
                                    {group.groupName}
                                </div>
                            ))}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleExistingGroupsDialogClose} color="secondary">
                                Cancel
                            </Button>
                            <Button onClick={handleExistingGroupsSave} color="primary">
                                Save
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Dialog open={editDialogOpen} onClose={handleEditDialogClose}>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogContent>
                            <TextField
                                label="First Name"
                                fullWidth
                                margin="normal"
                                value={editUserData ? editUserData[0] : ''}
                                onChange={(e) => setEditUserData([e.target.value, editUserData[1], editUserData[2], editUserData[3], editUserData[4], editUserData[5], editUserData[6], editUserData[7]])}
                            />
                            <TextField
                                label="Middle Name"
                                fullWidth
                                margin="normal"
                                value={editUserData ? editUserData[1] : ''}
                                onChange={(e) => setEditUserData([editUserData[0], e.target.value, editUserData[2], editUserData[3], editUserData[4], editUserData[5], editUserData[6], editUserData[7]])}
                            />
                            <TextField
                                label="Surname"
                                fullWidth
                                margin="normal"
                                value={editUserData ? editUserData[2] : ''}
                                onChange={(e) => setEditUserData([editUserData[0], editUserData[1], e.target.value, editUserData[3], editUserData[4], editUserData[5], editUserData[6], editUserData[7]])}
                            />
                            <TextField
                                label="Mobile"
                                fullWidth
                                margin="normal"
                                value={editUserData ? editUserData[3] : ''}
                                onChange={(e) => setEditUserData([editUserData[0], editUserData[1], editUserData[2], e.target.value, editUserData[4], editUserData[5], editUserData[6], editUserData[7]])}
                            />
                            <TextField
                                label="Email"
                                fullWidth
                                margin="normal"
                                value={editUserData ? editUserData[4] : ''}
                                onChange={(e) => setEditUserData([editUserData[0], editUserData[1], editUserData[2], editUserData[3], e.target.value, editUserData[5], editUserData[6], editUserData[7]])}
                            />
                            <div>
                                <label>Gender:</label>
                                <label>
                                    <input
                                        type="radio"
                                        value="Male"
                                        checked={editUserData && editUserData[5] === 'Male'}
                                        onChange={(e) => setEditUserData([editUserData[0], editUserData[1], editUserData[2], editUserData[3], editUserData[4], e.target.value, editUserData[6], editUserData[7]])}
                                    />
                                    Male
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        value="Female"
                                        checked={editUserData && editUserData[5] === 'Female'}
                                        onChange={(e) => setEditUserData([editUserData[0], editUserData[1], editUserData[2], editUserData[3], editUserData[4], e.target.value, editUserData[6], editUserData[7]])}
                                    />
                                    Female
                                </label>
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleEditDialogClose} color="secondary">
                                Cancel
                            </Button>
                            <Button onClick={handleEditSave} color="primary">
                                Save
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </div>
        </>
    );
};

export default CreateMessage;