import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, RefreshCw, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './shudhikaran.css';

function Shudhikaran() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const SPREADSHEET_ID = '1p5i-GyWURzC8LrTg7RWsbUPGkOBd81BC9uh8kB26_Rg';
  const SHEET_ID = '0';

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

  const downloadAsCSV = () => {
    let csv = filteredData.map(row => 
      headers.map((_, idx) => `"${row[idx] || ''}"`).join(',')
    ).join('\n');

    csv = headers.map(h => `"${h}"`).join(',') + '\n' + csv;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shudhikaran-data.csv';
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
      <div className="shudhikaran-display-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading Shudhikaran data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shudhikaran-display-container">
      <div className="shudhikaran-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
          Back
        </button>
        <h1>Shudhikaran Data</h1>
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
          <table className="shudhikaran-table">
            <thead>
              <tr>
                {headers.map((header, idx) => (
                  <th key={idx}>{header || `Column ${idx + 1}`}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, rowIdx) => (
                <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'even' : 'odd'}>
                  {headers.map((header, cellIdx) => (
                    <td key={cellIdx}>{row[cellIdx] || 'N/A'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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

export default Shudhikaran;
