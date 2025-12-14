import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, RefreshCw, Search, X, Edit2, Trash2, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './spreadsheetDisplay.css';

function SpreadsheetDisplay() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editedRow, setEditedRow] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const SPREADSHEET_ID = '1p5i-GyWURzC8LrTg7RWsbUPGkOBd81BC9uh8kB26_Rg';
  const SHEET_ID = '0';

  const apiUrl = process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_LOCAL_API_URL
    : process.env.REACT_APP_PRODUCTION_API_URL;

  useEffect(() => {
    fetchSheetData();
  }, []);

  const fetchSheetData = async () => {
    try {
      setLoading(true);
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${SHEET_ID}`;
      const response = await fetch(csvUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch data from Google Sheets');
      }

      const csvText = await response.text();
      const rows = csvText.trim().split('\n').map(row => {
        return row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim());
      });

      if (rows.length > 0) {
        setData(rows);
        setHeaders(rows[0]);
        setError(null);
        setFilters({});
      } else {
        setError('No data found in the spreadsheet');
      }
    } catch (err) {
      console.error('Error fetching sheet data:', err);
      setError('Failed to load spreadsheet. Make sure it is publicly accessible.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (headerIndex, value) => {
    setFilters(prev => ({
      ...prev,
      [headerIndex]: value.toLowerCase()
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const handleEditClick = (rowIndex) => {
    const actualRowIndex = rowIndex + 1;
    setEditingRowIndex(rowIndex);
    setEditedRow({ ...data[actualRowIndex] });
  };

  const handleEditChange = (colIndex, value) => {
    setEditedRow(prev => ({
      ...prev,
      [colIndex]: value
    }));
  };

  const handleSaveEdit = async (rowIndex) => {
    try {
      const actualRowIndex = rowIndex + 1;
      
      const response = await axios.post(`${apiUrl}/sheets/update-row`, {
        rowIndex: actualRowIndex,
        rowData: Object.values(editedRow)
      });

      if (response.data.success) {
        const newData = [...data];
        newData[actualRowIndex] = Object.values(editedRow);
        setData(newData);
        setEditingRowIndex(null);
        setEditedRow({});
        alert('Row updated successfully!');
        fetchSheetData(); // Refresh to ensure sync
      }
    } catch (err) {
      console.error('Error updating row:', err);
      alert('Failed to update row. Make sure your backend is configured.');
    }
  };

  const handleDeleteClick = (rowIndex) => {
    setDeleteConfirm(rowIndex);
  };

  const handleConfirmDelete = async (rowIndex) => {
    try {
      const actualRowIndex = rowIndex + 1;
      
      const response = await axios.post(`${apiUrl}/sheets/delete-row`, {
        rowIndex: actualRowIndex
      });

      if (response.data.success) {
        const newData = data.filter((_, idx) => idx !== actualRowIndex);
        setData(newData);
        setDeleteConfirm(null);
        alert('Row deleted successfully!');
        fetchSheetData(); // Refresh to ensure sync
      }
    } catch (err) {
      console.error('Error deleting row:', err);
      alert('Failed to delete row. Make sure your backend is configured.');
    }
  };

  const handleCancelEdit = () => {
    setEditingRowIndex(null);
    setEditedRow({});
  };

  const downloadAsCSV = () => {
    let csv = filteredData.map(row => 
      headers.map((_, idx) => `"${row[idx] || ''}"`).join(',')
    ).join('\n');

    csv = headers.map(h => `"${h}"`).join(',') + '\n' + csv;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spreadsheet-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredData = data.slice(1).filter(row => {
    if (searchTerm) {
      const matchesSearch = row.some(cell =>
        cell.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (!matchesSearch) return false;
    }

    for (const [colIndex, filterValue] of Object.entries(filters)) {
      if (filterValue) {
        const cellValue = row[colIndex] ? row[colIndex].toLowerCase() : '';
        if (!cellValue.includes(filterValue)) {
          return false;
        }
      }
    }

    return true;
  });

  if (loading) {
    return (
      <div className="spreadsheet-display-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading spreadsheet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="spreadsheet-display-container">
      <div className="spreadsheet-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Back
        </button>
        <h1>Spreadsheet Data</h1>
        <div className="action-buttons">
          <button className="refresh-button" onClick={fetchSheetData}>
            <RefreshCw size={20} />
            Refresh
          </button>
          <button className="download-button" onClick={downloadAsCSV}>
            <Download size={20} />
            Download CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
          <small>Make sure the Google Sheet is publicly accessible</small>
        </div>
      )}

      {headers.length > 0 && (
        <div className="search-filter-container">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search all columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                <X size={18} />
              </button>
            )}
          </div>

          <button 
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters {Object.values(filters).some(v => v) && '✓'}
          </button>

          {Object.values(filters).some(v => v) && (
            <button className="clear-filters" onClick={clearFilters}>
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {showFilters && headers.length > 0 && (
        <div className="filters-panel">
          <h3>Filter by Column</h3>
          <div className="filters-grid">
            {headers.map((header, idx) => (
              <div key={idx} className="filter-item">
                <label>{header}</label>
                <input
                  type="text"
                  placeholder={`Filter ${header}...`}
                  value={filters[idx] || ''}
                  onChange={(e) => handleFilterChange(idx, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {headers.length > 0 && (
        <div className="results-info">
          Showing {filteredData.length} of {data.length - 1} records
        </div>
      )}

      {headers.length > 0 && filteredData.length > 0 && (
        <div className="table-container">
          <table className="spreadsheet-table">
            <thead>
              <tr>
                {headers.map((header, idx) => (
                  <th key={idx}>{header || `Column ${idx + 1}`}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, rowIdx) => (
                <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'even' : 'odd'}>
                  {editingRowIndex === rowIdx ? (
                    <>
                      {headers.map((header, cellIdx) => (
                        <td key={cellIdx}>
                          <input
                            type="text"
                            value={editedRow[cellIdx] || ''}
                            onChange={(e) => handleEditChange(cellIdx, e.target.value)}
                            className="edit-input"
                          />
                        </td>
                      ))}
                      <td className="action-cell">
                        <button 
                          className="save-btn" 
                          onClick={() => handleSaveEdit(rowIdx)}
                          title="Save"
                        >
                          <Save size={18} />
                        </button>
                        <button 
                          className="cancel-btn" 
                          onClick={handleCancelEdit}
                          title="Cancel"
                        >
                          <X size={18} />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      {headers.map((header, cellIdx) => (
                        <td key={cellIdx}>{row[cellIdx] || 'N/A'}</td>
                      ))}
                      <td className="action-cell">
                        <button 
                          className="edit-btn" 
                          onClick={() => handleEditClick(rowIdx)}
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          className="delete-btn" 
                          onClick={() => handleDeleteClick(rowIdx)}
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleteConfirm !== null && (
        <div className="delete-confirm-modal">
          <div className="modal-content">
            <p>Are you sure you want to delete this row?</p>
            <div className="modal-buttons">
              <button 
                className="confirm-delete-btn" 
                onClick={() => handleConfirmDelete(deleteConfirm)}
              >
                Delete
              </button>
              <button 
                className="cancel-delete-btn" 
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredData.length === 0 && !loading && data.length > 1 && (
        <div className="no-data-message">
          <p>No records match your search or filters</p>
          <button className="reset-button" onClick={clearFilters}>
            Reset Filters
          </button>
        </div>
      )}

      {!loading && data.length === 1 && (
        <div className="no-data-message">
          <p>No data rows available to display</p>
        </div>
      )}
    </div>
  );
}

export default SpreadsheetDisplay;
