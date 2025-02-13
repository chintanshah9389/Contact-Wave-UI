import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
    const [originalHeaders, setOriginalHeaders] = useState([]);
    const [filter, setFilter] = useState('');
    const [groupDialogOpen, setGroupDialogOpen] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [selectAllChecked, setSelectAllChecked] = useState(false);
    const [groups, setGroups] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [isTestMessage, setIsTestMessage] = useState(false);
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
    const [existingGroups, setExistingGroups] = useState([]); // Add this line
    const [selectedFields, setSelectedFields] = useState([]); // Add this line
    const [activeSpreadsheetId, setActiveSpreadsheetId] = useState(null);
    const [selectedGroups, setSelectedGroups] = useState([]); // For selected groups
    const [groupFilteredData, setGroupFilteredData] = useState([]); // Use a different name
    const [deleteGroupDialogOpen, setDeleteGroupDialogOpen] = useState(false);
    const [selectedGroupsToDelete, setSelectedGroupsToDelete] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [addRowDialogOpen, setAddRowDialogOpen] = useState(false);
    const [dynamicHeaders, setDynamicHeaders] = useState([]);
    const [newRowData, setNewRowData] = useState({});
    const navigate = useNavigate();
    const apiUrl = process.env.NODE_ENV === 'development'
        ? process.env.REACT_APP_LOCAL_API_URL
        : process.env.REACT_APP_PRODUCTION_API_URL;

    // const columnsToHide = [7, 8, 9, 10, 11]; // Unique ID (index 7) and Group Name (index 8)
    const columnsToHide = ['Group ID', 'Spreadsheet Name', 'Spreadsheet ID'];

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             // Fetch the active spreadsheet ID
    //             const activeSpreadsheetResponse = await axios.get(`${apiUrl}/get-active-spreadsheet`, {
    //                 withCredentials: true,
    //             });
    //             const activeSpreadsheetId = activeSpreadsheetResponse.data.activeSpreadsheetId;

    //             if (!activeSpreadsheetId) {
    //                 toast.error('No active spreadsheet found. Please set an active spreadsheet first.');
    //                 return;
    //             }

    //             // Fetch data from the active spreadsheet
    //             const response = await axios.get(`${apiUrl}/fetch-registrations`, {
    //                 withCredentials: true,
    //             });

    //             console.log('Fetched data:', response.data); // Log the fetched data

    //             setData(response.data);

    //             // Fetch headers dynamically
    //             const headersResponse = await axios.get(`${apiUrl}/get-spreadsheet-headers`, {
    //                 params: { spreadsheetId: activeSpreadsheetId },
    //                 withCredentials: true,
    //             });
    //             const allHeaders = headersResponse.data.headers;

    //             // Store original headers
    //             setOriginalHeaders(allHeaders);

    //             // Filter out unwanted columns
    //             const filteredHeaders = allHeaders.filter(
    //                 (header) => !columnsToHide.includes(header)
    //             );
    //             setHeaders(filteredHeaders);
    //         } catch (error) {
    //             console.error('Error fetching data:', error);
    //         }
    //     };

    //     fetchData();
    // }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch the active spreadsheet ID
                const activeSpreadsheetResponse = await axios.get(`${apiUrl}/get-active-spreadsheet`, {
                    withCredentials: true,
                });
                const activeSpreadsheetId = activeSpreadsheetResponse.data.activeSpreadsheetId;
    
                if (!activeSpreadsheetId) {
                    toast.error('No active spreadsheet found. Please set an active spreadsheet first.');
                    return;
                }
    
                // Fetch data from the active spreadsheet
                const response = await axios.get(`${apiUrl}/fetch-registrations`, {
                    withCredentials: true,
                });
    
                console.log('Fetched data:', response.data); // Log the fetched data
    
                setData(response.data);
    
                // Fetch headers dynamically
                const headersResponse = await axios.get(`${apiUrl}/get-spreadsheet-headers`, {
                    params: { spreadsheetId: activeSpreadsheetId },
                    withCredentials: true,
                });
                const allHeaders = headersResponse.data.headers;
    
                // Store original headers
                setOriginalHeaders(allHeaders);
    
                // Filter out unwanted columns
                const filteredHeaders = allHeaders.filter(
                    (header) => !columnsToHide.includes(header)
                );
                setHeaders(filteredHeaders);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
    
        fetchData();
    
        // Set up the interval to auto-fill unique IDs every 10 seconds
        const intervalId = setInterval(async () => {
            try {
                const activeSpreadsheetResponse = await axios.get(`${apiUrl}/get-active-spreadsheet`, {
                    withCredentials: true,
                });
                const activeSpreadsheetId = activeSpreadsheetResponse.data.activeSpreadsheetId;
    
                if (!activeSpreadsheetId) {
                    console.error('No active spreadsheet found. Please set an active spreadsheet first.');
                    return;
                }
    
                await axios.post(`${apiUrl}/auto-fill-unique-ids`, {
                    activeSpreadsheetId,
                });
            } catch (error) {
                console.error('Error auto-filling unique IDs:', error);
            }
        }, 10000);
    
        // Clean up the interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

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
            toast.error("Please select at least one recipient to create a group.");
            return;
        }

        if (!groupName.trim() || !groupDescription.trim()) {
            toast.error("Group name and description are required.");
            return;
        }

        try {
            // Step 1: Fetch the active spreadsheet ID from the backend
            const activeSpreadsheetResponse = await axios.get(`${apiUrl}/get-active-spreadsheet`, {
                withCredentials: true,
            });

            const activeSpreadsheetId = activeSpreadsheetResponse.data.activeSpreadsheetId;

            if (!activeSpreadsheetId) {
                toast.error('No active spreadsheet found. Please set an active spreadsheet first.');
                return;
            }

            // Step 2: Fetch the headers (first row) of the active spreadsheet
            const headersResponse = await axios.get(`${apiUrl}/get-spreadsheet-headers`, {
                params: { spreadsheetId: activeSpreadsheetId },
                withCredentials: true,
            });

            const headers = headersResponse.data.headers;

            if (!headers || headers.length === 0) {
                toast.error("Unable to fetch spreadsheet headers. Please try again.");
                return;
            }

            // Step 3: Dynamically identify the Unique ID column based on headers
            const uniqueIdColumnIndex = headers.findIndex(header =>
                header.toLowerCase().includes('unique') || header.toLowerCase().includes('_id')
            );

            if (uniqueIdColumnIndex === -1) {
                toast.error("Unique ID column not found in the spreadsheet.");
                return;
            }

            console.log(`Unique ID column index: ${uniqueIdColumnIndex}`);
            console.log(`Headers: ${headers}`);
            console.log(`Selected Rows:`, selectedRows);

            // Step 4: Create the selectedFields array dynamically
            const uniqueRows = Array.from(new Set(selectedRows.map((row) => row[uniqueIdColumnIndex]))).map((uniqueId) =>
                selectedRows.find((row) => row[uniqueIdColumnIndex] === uniqueId)
            );

            const selectedFields = uniqueRows.map((row) => {
                const field = {
                    uniqueId: row[uniqueIdColumnIndex], // Ensure the Unique ID is mapped to 'uniqueId'
                };

                // Dynamically add other fields if they exist (excluding the Unique ID column)
                headers.forEach((header, index) => {
                    if (index !== uniqueIdColumnIndex && row[index]) {
                        field[header] = row[index]; // Add all columns except the Unique ID column
                    }
                });

                return field;
            });

            console.log("Selected Fields:", selectedFields);

            // Step 5: Send the request to create the group
            const response = await axios.post(`${apiUrl}/create-group`, {
                groupName,
                description: groupDescription,
                selectedFields,
                activeSpreadsheetId, // Pass the active spreadsheet ID to the backend
            });

            toast.success(response.data.message || "Group created successfully!");

            // Step 6: Reset the form and state
            setFilter('');
            setSelectedRows([]);
            setGroupName('');
            setGroupDescription('');
            setGroupDialogOpen(false);
            setSelectAllChecked(false);
        } catch (error) {
            console.error("Error creating group:", error);
            toast.error("Failed to create the group. Please try again.");
        }
    };

    const openGroupDialog = () => {
        if (selectedRows.length === 0) {
            toast.error("Please select at least one recipient to create a group.");
            return;
        }
        setGroupDialogOpen(true);
    };

    const closeGroupDialog = () => {
        setGroupDialogOpen(false);
        setGroupName('');
        setGroupDescription('');
    };

    const handleDeleteGroupClick = async () => {
        try {
            // Fetch the active spreadsheet ID
            const activeSpreadsheetResponse = await axios.get(`${apiUrl}/get-active-spreadsheet`, {
                withCredentials: true,
            });
            const activeSpreadsheetId = activeSpreadsheetResponse.data.activeSpreadsheetId;

            if (!activeSpreadsheetId) {
                toast.error('No active spreadsheet found. Please set an active spreadsheet first.');
                return;
            }

            // Fetch all groups from the backend
            const response = await axios.get(`${apiUrl}/fetch-groups`, {
                params: { spreadsheetId: activeSpreadsheetId },
                withCredentials: true,
            });

            if (response.data.groups) {
                setGroups(response.data.groups); // Update the groups state
                setDeleteGroupDialogOpen(true); // Open the dialog after fetching groups
            } else {
                toast.error('No groups found.');
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
            toast.error('Failed to fetch groups. Please try again.');
        }
    };

    const handleDeleteGroups = async () => {
        if (selectedGroupsToDelete.length === 0) {
            toast.error('Please select at least one group to delete.');
            return;
        }

        try {
            // Fetch the active spreadsheet ID
            const activeSpreadsheetResponse = await axios.get(`${apiUrl}/get-active-spreadsheet`, {
                withCredentials: true,
            });
            const activeSpreadsheetId = activeSpreadsheetResponse.data.activeSpreadsheetId;

            if (!activeSpreadsheetId) {
                toast.error('No active spreadsheet found. Please set an active spreadsheet first.');
                return;
            }

            // Send a request to delete the selected groups
            const response = await axios.post(`${apiUrl}/delete-groups`, {
                groupNames: selectedGroupsToDelete,
                activeSpreadsheetId,
            }, {
                withCredentials: true,
            });

            if (response.data.success) {
                toast.success('Groups deleted successfully!');
                setDeleteGroupDialogOpen(false);
                setSelectedGroupsToDelete([]);
                // Refresh the page to update the table
                window.location.reload();
            } else {
                toast.error('Failed to delete groups.');
            }
        } catch (error) {
            console.error('Error deleting groups:', error);
            toast.error('Failed to delete groups.');
        }
    };

    // const handleAddToExistingGroups = () => {
    //     setExistingGroupsDialogOpen(true);
    // };

    const handleExistingGroupsDialogClose = () => {
        setExistingGroupsDialogOpen(false);
        setSelectedExistingGroups([]);
    };

    // const handleExistingGroupsSave = async () => {
    //     if (selectedExistingGroups.length === 0) {
    //         toast.error('Please select at least one group.');
    //         return;
    //     }

    //     try {
    //         const response = await axios.post(`${apiUrl}/add-to-existing-groups`, {
    //             groupNames: selectedExistingGroups,
    //             selectedFields: selectedRows.map((row) => ({
    //                 uniqueId: row[7],
    //                 name: row[0],
    //                 email: row[4],
    //                 phone: row[3],
    //             })),
    //         });

    //         toast.success(response.data.message || 'Users added to existing groups successfully!');
    //         setSelectedRows([]);
    //         setExistingGroupsDialogOpen(false);
    //     } catch (error) {
    //         console.error('Error adding users to existing groups:', error);
    //         toast.error('Failed to add users to existing groups.');
    //     }
    // };

    const handleAddToExistingGroups = async () => {
        if (selectedRows.length === 0) {
            toast.error("Please select at least one recipient to add to existing groups.");
            return;
        }

        try {
            // Step 1: Fetch the active spreadsheet ID from the backend
            const activeSpreadsheetResponse = await axios.get(`${apiUrl}/get-active-spreadsheet`, {
                withCredentials: true,
            });

            const activeSpreadsheetId = activeSpreadsheetResponse.data.activeSpreadsheetId;

            if (!activeSpreadsheetId) {
                toast.error('No active spreadsheet found. Please set an active spreadsheet first.');
                return;
            }

            // Step 2: Fetch the headers (first row) of the active spreadsheet
            const headersResponse = await axios.get(`${apiUrl}/get-spreadsheet-headers`, {
                params: { spreadsheetId: activeSpreadsheetId },
                withCredentials: true,
            });

            const headers = headersResponse.data.headers;

            if (!headers || headers.length === 0) {
                toast.error("Unable to fetch spreadsheet headers. Please try again.");
                return;
            }

            // Step 3: Dynamically identify the Unique ID column based on headers
            const uniqueIdColumnIndex = headers.findIndex(header =>
                header.toLowerCase().includes('unique') || header.toLowerCase().includes('_id')
            );

            if (uniqueIdColumnIndex === -1) {
                toast.error("Unique ID column not found in the spreadsheet.");
                return;
            }

            // Step 4: Create the selectedFields array dynamically
            const uniqueRows = Array.from(new Set(selectedRows.map((row) => row[uniqueIdColumnIndex]))).map((uniqueId) =>
                selectedRows.find((row) => row[uniqueIdColumnIndex] === uniqueId)
            );

            const selectedFields = uniqueRows.map((row) => {
                const field = {
                    uniqueId: row[uniqueIdColumnIndex], // Ensure the Unique ID is mapped to 'uniqueId'
                };

                // Dynamically add other fields if they exist (excluding the Unique ID column)
                headers.forEach((header, index) => {
                    if (index !== uniqueIdColumnIndex && row[index]) {
                        field[header] = row[index]; // Add all columns except the Unique ID column
                    }
                });

                return field;
            });

            // Step 5: Fetch the existing groups from the backend
            const existingGroupsResponse = await axios.get(`${apiUrl}/fetch-groups`, {
                params: { spreadsheetId: activeSpreadsheetId },
                withCredentials: true,
            });

            const existingGroups = existingGroupsResponse.data.groups;

            if (!existingGroups || existingGroups.length === 0) {
                toast.error("No existing groups found.");
                return;
            }

            // Step 6: Open the dialog to select existing groups
            setExistingGroupsDialogOpen(true);
            setExistingGroups(existingGroups); // Update the existingGroups state
            setSelectedFields(selectedFields); // Update the selectedFields state
            setActiveSpreadsheetId(activeSpreadsheetId); // Update the activeSpreadsheetId state
        } catch (error) {
            console.error("Error fetching existing groups:", error);
            toast.error("Failed to fetch existing groups. Please try again.");
        }
    };

    const handleExistingGroupsSave = async () => {
        if (selectedExistingGroups.length === 0) {
            toast.error('Please select at least one group.');
            return;
        }

        try {
            const response = await axios.post(`${apiUrl}/add-to-existing-groups`, {
                groupNames: selectedExistingGroups,
                selectedFields: selectedFields,
                activeSpreadsheetId: activeSpreadsheetId,
            });

            toast.success(response.data.message || 'Users added to existing groups successfully!');
            setSelectedRows([]);
            setExistingGroupsDialogOpen(false);
        } catch (error) {
            console.error('Error adding users to existing groups:', error);
            toast.error('Failed to add users to existing groups.');
        }
    };

    const handleMenuOpen = (event) => {
        setMenuAnchor(event.currentTarget); // Set the anchor element for the menu
    };

    const handleMenuClose = () => {
        setMenuAnchor(null); // Close the menu by resetting the anchor
    };

    const handleSendMessage = () => {
        if (selectedRows.length === 0) {
            toast.error("Please select at least one recipient.");
            return;
        }

        navigate('/send-message', { state: { selectedRows, isTestMessage: false } });
    };

    const handleTestMessage = () => {
        setIsTestMessage(true);
        navigate('/send-message', { state: { isTestMessage: true } });
        handleMenuClose();
    };

    const handleCloseGroups = () => {
        setAnchorEl(null);
    };

    const handleShowGroupsClick = async (event) => {
        setAnchorEl(event.currentTarget);

        try {
            // Fetch the active spreadsheet ID
            const activeSpreadsheetResponse = await axios.get(`${apiUrl}/get-active-spreadsheet`, {
                withCredentials: true,
            });
            const activeSpreadsheetId = activeSpreadsheetResponse.data.activeSpreadsheetId;

            if (!activeSpreadsheetId) {
                toast.error('No active spreadsheet found. Please set an active spreadsheet first.');
                return;
            }

            // Fetch all groups from the backend
            const response = await axios.get(`${apiUrl}/fetch-groups`, {
                params: { spreadsheetId: activeSpreadsheetId },
                withCredentials: true,
            });

            if (response.data.groups) {
                setGroups(response.data.groups);
            } else {
                toast.error("No groups found.");
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
            toast.error("Failed to fetch groups. Please try again.");
        }
    };

    const handleGroupSelection = async (groupName) => {
        const updatedSelectedGroups = selectedGroups.includes(groupName)
            ? selectedGroups.filter((group) => group !== groupName) // Deselect if already selected
            : [...selectedGroups, groupName]; // Select if not already selected

        setSelectedGroups(updatedSelectedGroups);

        // Fetch users for the updated selected groups
        if (updatedSelectedGroups.length > 0) {
            try {
                // Fetch the active spreadsheet ID
                const activeSpreadsheetResponse = await axios.get(`${apiUrl}/get-active-spreadsheet`, {
                    withCredentials: true,
                });
                const activeSpreadsheetId = activeSpreadsheetResponse.data.activeSpreadsheetId;

                if (!activeSpreadsheetId) {
                    toast.error('No active spreadsheet found. Please set an active spreadsheet first.');
                    return;
                }

                // Fetch users for the selected groups
                const response = await axios.post(`${apiUrl}/fetch-group-users`, {
                    groupNames: updatedSelectedGroups,
                    activeSpreadsheetId: activeSpreadsheetId,
                });

                if (response.data.users) {
                    const transformedUsers = response.data.users.map((user) =>
                        Object.values(user) // Dynamically map user data
                    );
                    setGroupFilteredData(transformedUsers); // Update the group-filtered data
                } else {
                    setGroupFilteredData([]); // Clear the data if no users are found
                }
            } catch (error) {
                console.error('Error fetching group users:', error);
                toast.error("Failed to fetch group users. Please try again.");
            }
        } else {
            setGroupFilteredData(data); // Reset to the original data if no groups are selected
        }
    };

    const applyGroupFilter = async () => {
        if (selectedGroups.length === 0) {
            setGroupUsers([]); // Clear the table if no groups are selected
            return;
        }

        try {
            const response = await axios.post(`${apiUrl}/fetch-group-users`, {
                groupNames: selectedGroups,
            });
            const transformedUsers = response.data.users.map((user) => [
                user.name,
                user.middleName,
                user.surname,
                user.mobile,
                user.email,
                user.gender,
                user.password,
                user.uniqueId,
            ]);
            setGroupUsers(transformedUsers);
        } catch (error) {
            console.error('Error fetching group users:', error);
        }
        handleCloseGroups(); // Close the dropdown after applying the filter
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

    const handleEditClick = async (row) => {
        try {
            // Fetch the active spreadsheet ID
            const activeSpreadsheetResponse = await axios.get(`${apiUrl}/get-active-spreadsheet`, {
                withCredentials: true,
            });
            const activeSpreadsheetId = activeSpreadsheetResponse.data.activeSpreadsheetId;

            if (!activeSpreadsheetId) {
                toast.error('No active spreadsheet found. Please set an active spreadsheet first.');
                return;
            }

            // Fetch the headers to dynamically generate the edit form
            const headersResponse = await axios.get(`${apiUrl}/get-spreadsheet-headers`, {
                params: { spreadsheetId: activeSpreadsheetId },
                withCredentials: true,
            });

            const headers = headersResponse.data.headers;
            if (!headers || headers.length === 0) {
                toast.error('Unable to fetch spreadsheet headers. Please try again.');
                return;
            }

            // Dynamically identify the Unique ID and Group Name columns
            const uniqueIdColumnIndex = headers.findIndex((header) =>
                header.toLowerCase().includes('unique') || header.toLowerCase().includes('_id')
            );
            const groupNameColumnIndex = headers.findIndex((header) =>
                header.toLowerCase().includes('group') && header.toLowerCase().includes('name')
            );

            if (uniqueIdColumnIndex === -1) {
                toast.error('Unique ID column not found in the spreadsheet.');
                return;
            }

            // Set the edit user data and open the dialog
            setEditUserData({ row, headers, uniqueIdColumnIndex, groupNameColumnIndex });
            setEditDialogOpen(true);
        } catch (error) {
            console.error('Error fetching headers:', error);
            toast.error('Failed to fetch headers. Please try again.');
        }
    };

    const handleEditDialogClose = () => {
        setEditDialogOpen(false);
        setEditUserData(null);
    };

    const handleEditSave = async () => {
        if (!editUserData) return;

        try {
            // Fetch the active spreadsheet ID
            const activeSpreadsheetResponse = await axios.get(`${apiUrl}/get-active-spreadsheet`, {
                withCredentials: true,
            });
            const activeSpreadsheetId = activeSpreadsheetResponse.data.activeSpreadsheetId;

            if (!activeSpreadsheetId) {
                toast.error('No active spreadsheet found. Please set an active spreadsheet first.');
                return;
            }

            // Send a request to update the row
            const response = await axios.post(`${apiUrl}/edit-row`, {
                uniqueId: editUserData.row[editUserData.uniqueIdColumnIndex], // Use the dynamically identified Unique ID column
                updatedRow: editUserData.row,
                activeSpreadsheetId,
            });

            if (response.data.success) {
                toast.success('Row updated successfully!');
                const updatedData = data.map((row) =>
                    row[editUserData.uniqueIdColumnIndex] === editUserData.row[editUserData.uniqueIdColumnIndex] ? editUserData.row : row
                );
                setData(updatedData);
                handleEditDialogClose();
            } else {
                toast.error('Failed to update row.');
            }
        } catch (error) {
            console.error('Error updating row:', error);
            toast.error('Failed to update row.');
        }
    };

    // const handleDeleteClick = async (uniqueId) => {
    //     if (window.confirm('Are you sure you want to delete this user?')) {
    //         try {
    //             // Fetch the active spreadsheet ID
    //             const activeSpreadsheetResponse = await axios.get(`${apiUrl}/get-active-spreadsheet`, {
    //                 withCredentials: true,
    //             });
    //             const activeSpreadsheetId = activeSpreadsheetResponse.data.activeSpreadsheetId;

    //             if (!activeSpreadsheetId) {
    //                 toast.error('No active spreadsheet found. Please set an active spreadsheet first.');
    //                 return;
    //             }

    //             // Fetch the headers to dynamically identify the Unique ID column
    //             const headersResponse = await axios.get(`${apiUrl}/get-spreadsheet-headers`, {
    //                 params: { spreadsheetId: activeSpreadsheetId },
    //                 withCredentials: true,
    //             });

    //             const headers = headersResponse.data.headers;
    //             if (!headers || headers.length === 0) {
    //                 toast.error('Unable to fetch spreadsheet headers. Please try again.');
    //                 return;
    //             }

    //             // Dynamically identify the Unique ID column
    //             const uniqueIdColumnIndex = headers.findIndex((header) =>
    //                 header.toLowerCase().includes('unique') || header.toLowerCase().includes('_id')
    //             );

    //             if (uniqueIdColumnIndex === -1) {
    //                 toast.error('Unique ID column not found in the spreadsheet.');
    //                 return;
    //             }

    //             // Send the DELETE request with credentials (cookies)
    //             const response = await axios.delete(`${apiUrl}/delete-user`, {
    //                 data: { uniqueId, activeSpreadsheetId },
    //                 withCredentials: true, // Include cookies in the request
    //             });

    //             console.log('Response from delete-user:', response.data); // Log the response for debugging

    //             if (response.data.success) {
    //                 toast.success('User deleted successfully!');
    //                 const updatedData = data.filter((row) => row[uniqueIdColumnIndex] !== uniqueId);
    //                 setData(updatedData);
    //             } else {
    //                 toast.error('Failed to delete user.');
    //             }
    //         } catch (error) {
    //             console.error('Error deleting user:', error);
    //             if (error.response && error.response.status === 401) {
    //                 toast.error('Unauthorized: Please log in again.');
    //             } else {
    //                 toast.error('Failed to delete user.');
    //             }
    //         }
    //     }
    // };

    const handleDeleteUsers = async () => {
        if (selectedRows.length === 0) {
            toast.error('Please select at least one user to delete.');
            return;
        }

        if (window.confirm('Are you sure you want to delete the selected users?')) {
            try {
                // Fetch the active spreadsheet ID
                const activeSpreadsheetResponse = await axios.get(`${apiUrl}/get-active-spreadsheet`, {
                    withCredentials: true,
                });
                const activeSpreadsheetId = activeSpreadsheetResponse.data.activeSpreadsheetId;

                if (!activeSpreadsheetId) {
                    toast.error('No active spreadsheet found. Please set an active spreadsheet first.');
                    return;
                }

                // Fetch the headers to dynamically identify the Unique ID column
                const headersResponse = await axios.get(`${apiUrl}/get-spreadsheet-headers`, {
                    params: { spreadsheetId: activeSpreadsheetId },
                    withCredentials: true,
                });

                const headers = headersResponse.data.headers;
                if (!headers || headers.length === 0) {
                    toast.error('Unable to fetch spreadsheet headers. Please try again.');
                    return;
                }

                // Dynamically identify the Unique ID column
                const uniqueIdColumnIndex = headers.findIndex((header) =>
                    header.toLowerCase().includes('unique') || header.toLowerCase().includes('_id')
                );

                if (uniqueIdColumnIndex === -1) {
                    toast.error('Unique ID column not found in the spreadsheet.');
                    return;
                }

                // Extract uniqueIds from the selected rows using the dynamic column index
                const uniqueIds = selectedRows.map((row) => row[uniqueIdColumnIndex]);

                // Send a request to delete multiple users
                const response = await axios.delete(`${apiUrl}/delete-multiple-users`, {
                    data: { uniqueIds, activeSpreadsheetId },
                    withCredentials: true, // Include cookies for authentication
                });

                if (response.data.success) {
                    toast.success('Selected users deleted successfully!');

                    // Refresh the page to update the table
                    window.location.reload();
                } else {
                    toast.error('Failed to delete users.');
                }
            } catch (error) {
                console.error('Error deleting users:', error);
                if (error.response && error.response.status === 401) {
                    toast.error('Unauthorized: Please log in again.');
                } else {
                    toast.error('Failed to delete users.');
                }
            }
        }
    };

    const handleCombineGroups = async () => {
        try {
            // Fetch the active spreadsheet ID
            const activeSpreadsheetResponse = await axios.get(`${apiUrl}/get-active-spreadsheet`, {
                withCredentials: true,
            });
            const activeSpreadsheetId = activeSpreadsheetResponse.data.activeSpreadsheetId;

            if (!activeSpreadsheetId) {
                toast.error('No active spreadsheet found. Please set an active spreadsheet first.');
                return;
            }

            // Fetch all groups from the backend
            const response = await axios.get(`${apiUrl}/fetch-groups`, {
                params: { spreadsheetId: activeSpreadsheetId },
                withCredentials: true,
            });

            if (response.data.groups) {
                setGroups(response.data.groups); // Update the groups state
                setCombineGroupsDialogOpen(true); // Open the dialog after fetching groups
            } else {
                toast.error('No groups found.');
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
            toast.error('Failed to fetch groups. Please try again.');
        }
    };


    // const handleCombineGroups = async () => {
    //     if (selectedExistingGroups.length < 2) {
    //         toast.error('Please select at least two groups to combine.');
    //         return;
    //     }

    //     const newGroupName = 'Combined Group'; // Example new group name
    //     const description = 'Combined group';

    //     try {
    //         const response = await axios.post(`${apiUrl}/combine-groups`, {
    //             groupNames: selectedExistingGroups,
    //             newGroupName,
    //             description,
    //         });

    //         toast.error(response.data.message || 'Groups combined successfully!');
    //     } catch (error) {
    //         console.error('Error combining groups:', error);
    //         toast.error('Failed to combine groups.');
    //     }
    // };
    const handleAddToTableClick = async () => {
        try {
            // Fetch the active spreadsheet ID from the backend
            const activeSpreadsheetResponse = await axios.get(`${apiUrl}/get-active-spreadsheet`, {
                withCredentials: true,
            });

            const activeSpreadsheetId = activeSpreadsheetResponse.data.activeSpreadsheetId;

            if (!activeSpreadsheetId) {
                toast.error('No active spreadsheet found. Please set an active spreadsheet first.');
                return;
            }

            // Set the active spreadsheet ID in the state
            setActiveSpreadsheetId(activeSpreadsheetId);

            // Use the headers fetched in the useEffect
            setDynamicHeaders(headers);
            setAddRowDialogOpen(true);
        } catch (error) {
            console.error('Error fetching active spreadsheet:', error);
            toast.error('Failed to fetch active spreadsheet. Please try again.');
        }
    };

    const isNonEditableHeader = (header) => {
    const lowerCaseHeader = header.toLowerCase();
    return lowerCaseHeader.includes('unique') || lowerCaseHeader.includes('group');
};

    const handleAddRowDialogClose = () => {
        setAddRowDialogOpen(false);
        setNewRowData({});
    };
    

    const handleInputChange = (header, value) => {
        setNewRowData({ ...newRowData, [header]: value });
    };

    const handleSaveNewRow = async () => {
        if (!activeSpreadsheetId) {
            toast.error('No active spreadsheet found. Please set an active spreadsheet first.');
            return;
        }

        try {
            // Filter out non-editable headers from the new row data
            const editableRowData = {};
            for (const header of dynamicHeaders) {
                if (!isNonEditableHeader(header)) {
                    editableRowData[header] = newRowData[header] || '';
                }
            }

            const response = await axios.post(`${apiUrl}/add-new-row`, {
                newRowData: editableRowData,
                activeSpreadsheetId,
            });

            toast.success(response.data.message || 'New row added successfully!');
            setAddRowDialogOpen(false);
            setNewRowData({});
        } catch (error) {
            console.error('Error adding new row:', error);
            toast.error('Failed to add new row.');
        }
    };

    const isPasswordColumn = (header) => {
        return header.toLowerCase().includes('password');
    };

    // Mask password values
    const maskPassword = (value, header) => {
        return isPasswordColumn(header) ? '*'.repeat(value.length) : value;
    };

    const getGroupName = (row) => {
        const groupNameIndex = originalHeaders.indexOf('Group Name'); // Use original headers
        return groupNameIndex !== -1 && row[groupNameIndex] ? row[groupNameIndex] : 'No groups';
    };

    // Filter data based on search and group selection
    const filteredData = (selectedGroups.length > 0
        ? groupFilteredData.filter((row) => row.join(' ').toLowerCase().includes(filter))
        : data.slice(1).filter((row) => row.join(' ').toLowerCase().includes(filter))
    );

    return (
        <>
            <ToastContainer autoClose={3000} />
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
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleMenuOpen}
                                endIcon={<ArrowDropDown />}
                            >
                                Add/Group
                            </Button>
                            <Menu
                                anchorEl={menuAnchor}
                                open={Boolean(menuAnchor)}
                                onClose={handleMenuClose}
                            >
                                <MenuItem onClick={openGroupDialog}>Create Group</MenuItem>
                                <MenuItem onClick={handleTestMessage}>Test Message</MenuItem>
                                <MenuItem onClick={handleAddToTableClick}>Add to Table</MenuItem>
                            </Menu>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={handleDeleteGroupClick}
                            >
                                Delete Groups
                            </Button>
                            <Button
                                variant="contained"
                                color="default"
                                onClick={handleShowGroupsClick}
                                aria-controls={anchorEl ? 'group-menu' : undefined}
                                aria-haspopup="true"
                                endIcon={anchorEl ? <ArrowDropUp /> : <ArrowDropDown />}
                            >
                                {selectedGroups.length > 0 ? selectedGroups.join(', ') : 'Show Groups'}
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
                                color="error"
                                onClick={handleDeleteUsers}
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
                                    <MenuItem key={index}>
                                        <Checkbox
                                            checked={selectedGroups.includes(group.groupName)}
                                            onChange={() => handleGroupSelection(group.groupName)}
                                        />
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
                                    {headers.map((header, index) => (
                                        <TableCell key={index}>{header}</TableCell>
                                    ))}
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredData
                                    .filter((row) => {
                                        // Check if the row has at least one valid column
                                        const hasValidData = row.some((cell) => cell?.trim()); // Check if any cell has non-empty data
                                        return hasValidData;
                                    })
                                    .map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selectedRows.includes(row)}
                                                    onChange={() => handleRowSelection(row)}
                                                />
                                            </TableCell>
                                            {headers.map((header, cellIndex) => (
                                                <TableCell key={cellIndex}>
                                                    {row[cellIndex] || 'N/A'} {/* Display cell data or 'N/A' if empty */}
                                                </TableCell>
                                            ))}
                                            <TableCell>
                                                <div className="actions-container">
                                                    <Button
                                                        className="edit-button"
                                                        variant="contained"
                                                        onClick={() => handleEditClick(row)}
                                                    >
                                                        Edit
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
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
                                        toast.error('Please select at least two groups to combine.');
                                        return;
                                    }
                                    if (!newCombinedGroupName.trim() || !newCombinedGroupDescription.trim()) {
                                        toast.error('Please provide a group name and description.');
                                        return;
                                    }

                                    try {
                                        // Fetch the active spreadsheet ID
                                        const activeSpreadsheetResponse = await axios.get(`${apiUrl}/get-active-spreadsheet`, {
                                            withCredentials: true,
                                        });
                                        const activeSpreadsheetId = activeSpreadsheetResponse.data.activeSpreadsheetId;

                                        if (!activeSpreadsheetId) {
                                            toast.error('No active spreadsheet found. Please set an active spreadsheet first.');
                                            return;
                                        }

                                        // Send a request to combine groups
                                        const response = await axios.post(`${apiUrl}/combine-groups`, {
                                            groupNames: selectedExistingGroups,
                                            newGroupName: newCombinedGroupName,
                                            description: newCombinedGroupDescription,
                                            activeSpreadsheetId: activeSpreadsheetId,
                                        });

                                        toast.success(response.data.message || 'Groups combined successfully!');
                                        setCombineGroupsDialogOpen(false);
                                        setSelectedExistingGroups([]);
                                        setNewCombinedGroupName('');
                                        setNewCombinedGroupDescription('');
                                    } catch (error) {
                                        console.error('Error combining groups:', error);
                                        toast.error('Failed to combine groups.');
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

                    <Dialog open={deleteGroupDialogOpen} onClose={() => setDeleteGroupDialogOpen(false)}>
                        <DialogTitle>Delete Groups</DialogTitle>
                        <DialogContent>
                            {groups.map((group) => (
                                <div key={group.groupName}>
                                    <Checkbox
                                        checked={selectedGroupsToDelete.includes(group.groupName)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedGroupsToDelete([...selectedGroupsToDelete, group.groupName]);
                                            } else {
                                                setSelectedGroupsToDelete(selectedGroupsToDelete.filter((name) => name !== group.groupName));
                                            }
                                        }}
                                    />
                                    {group.groupName}
                                </div>
                            ))}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setDeleteGroupDialogOpen(false)} color="secondary">
                                Cancel
                            </Button>
                            <Button onClick={handleDeleteGroups} color="primary">
                                Delete
                            </Button>
                        </DialogActions>
                    </Dialog>

                    <Dialog open={existingGroupsDialogOpen} onClose={handleExistingGroupsDialogClose}>
                        <DialogTitle>Add to Existing Groups</DialogTitle>
                        <DialogContent>
                            {existingGroups.map((group) => (
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
                            {editUserData && (
                                <>
                                    {editUserData.headers.map((header, index) => {
                                        // Check if the column is non-editable (Unique ID or Group Name)
                                        const isNonEditable =
                                            index === editUserData.uniqueIdColumnIndex ||
                                            index === editUserData.groupNameColumnIndex;

                                        return (
                                            <TextField
                                                key={index}
                                                label={header}
                                                fullWidth
                                                margin="normal"
                                                value={editUserData.row[index] || ''}
                                                onChange={(e) => {
                                                    const updatedRow = [...editUserData.row];
                                                    updatedRow[index] = e.target.value;
                                                    setEditUserData({ ...editUserData, row: updatedRow });
                                                }}
                                                disabled={isNonEditable} // Disable non-editable fields
                                            />
                                        );
                                    })}
                                </>
                            )}
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

                    <Dialog open={addRowDialogOpen} onClose={handleAddRowDialogClose}>
    <DialogTitle>Add New Row</DialogTitle>
    <DialogContent>
        {dynamicHeaders.map((header, index) => (
            <TextField
                key={index}
                label={header}
                fullWidth
                margin="normal"
                value={newRowData[header] || ''}
                onChange={(e) => handleInputChange(header, e.target.value)}
                disabled={isNonEditableHeader(header)} // Disable non-editable fields
            />
        ))}
    </DialogContent>
    <DialogActions>
        <Button onClick={handleAddRowDialogClose} color="secondary">
            Cancel
        </Button>
        <Button onClick={handleSaveNewRow} color="primary">
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