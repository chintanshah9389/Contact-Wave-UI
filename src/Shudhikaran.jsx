import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ArrowLeft, RefreshCw, Search, X, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './shudhikaran.css';

function Shudhikaran() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Dynamic filter states - object to store selected value for each column
  const [columnFilters, setColumnFilters] = useState({});
  // Dynamic options - object to store unique values for each column
  const [columnOptions, setColumnOptions] = useState({});
  // Track which dropdown is open
  const [openDropdown, setOpenDropdown] = useState(null);

  // Refs for dropdowns
  const dropdownRefs = useRef({});

  const SPREADSHEET_ID = '1p5i-GyWURzC8LrTg7RWsbUPGkOBd81BC9uh8kB26_Rg';
  const GOOGLE_API_KEY = 'AIzaSyB5Szt4xRzKmB8gJLkXH6uQRJdsFXWS3z8';

  // State for dynamically loaded sheets
  const [sheets, setSheets] = useState([]);
  const [activeSheetId, setActiveSheetId] = useState(null);
  const [sheetsLoading, setSheetsLoading] = useState(true);

  // ✅ FULLY DYNAMIC SHEET DETECTION USING GOOGLE SHEETS API
  useEffect(() => {
    const fetchSheets = async () => {
      try {
        setSheetsLoading(true);
        console.log('🔍 Fetching sheets using Google Sheets API...');

        // Use Google Sheets API v4 to get spreadsheet metadata
        const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?key=${GOOGLE_API_KEY}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          const errorData = await response.json();

          // Check if quota exceeded - use hardcoded fallback
          if (response.status === 429 || errorData.error?.message?.includes('quota')) {
            console.warn('⚠️ API quota exceeded, using hardcoded fallback');
            setSheets([
              { id: '0', name: 'Dharamsala Data' },
              { id: '854420671', name: 'Palitana Train Data' }
            ]);
            setActiveSheetId('0');
            setSheetsLoading(false);
            return;
          }

          throw new Error(`API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();

        if (data.sheets && data.sheets.length > 0) {
          const extractedSheets = data.sheets.map(sheet => ({
            id: sheet.properties.sheetId.toString(),
            name: sheet.properties.title
          }));

          console.log('✅ Successfully loaded sheets:', extractedSheets);
          setSheets(extractedSheets);
          setActiveSheetId(extractedSheets[0].id);
        } else {
          console.error('❌ No sheets found in spreadsheet');
          setSheets([]);
          setActiveSheetId(null);
        }
      } catch (error) {
        console.error('❌ Failed to fetch sheets:', error.message);
        console.error('💡 Make sure your spreadsheet is public: Share → Anyone with link → Viewer');
        console.warn('⚠️ Using hardcoded fallback due to error');

        // Hardcoded fallback when API fails
        setSheets([
          { id: '0', name: 'Dharamsala Data' },
          { id: '854420671', name: 'Palitana Train Data' }
        ]);
        setActiveSheetId('0');
      } finally {
        setSheetsLoading(false);
      }
    };

    fetchSheets();
  }, [SPREADSHEET_ID, GOOGLE_API_KEY]);

  // Define fetchSheetData before using it in useEffect
  const fetchSheetData = useCallback(async () => {
    try {
      setLoading(true);
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${activeSheetId}`;
      console.log('Fetching from URL:', csvUrl);

      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error('Failed to load sheet');

      const text = await res.text();
      const rows = text
        .trim()
        .split('\n')
        .map(r => r.split(',').map(c => c.replace(/^"|"$/g, '').trim()));

      const hdrs = rows[0];
      setHeaders(hdrs);
      setData(rows);

      // Build dynamic options for each column
      const options = {};
      hdrs.forEach((header, colIndex) => {
        // Skip 'Unique ID' column
        if (header === 'Unique ID') return;

        const uniqueValues = new Set();
        rows.slice(1).forEach(row => {
          const value = (row[colIndex] || '').trim();
          if (value) uniqueValues.add(value);
        });
        options[header] = [...uniqueValues].sort();
      });

      setColumnOptions(options);
      setColumnFilters({}); // Reset filters
      console.log('Successfully loaded', rows.length - 1, 'rows');
    } catch (err) {
      console.error('Error loading sheet:', err);
    } finally {
      setLoading(false);
    }
  }, [SPREADSHEET_ID, activeSheetId]);

  useEffect(() => {
    if (activeSheetId && !sheetsLoading) {
      console.log('📊 Loading sheet data for ID:', activeSheetId);
      fetchSheetData();
    }
  }, [activeSheetId, sheetsLoading, fetchSheetData]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking inside any dropdown
      const clickedInsideDropdown = Object.values(dropdownRefs.current).some(
        ref => ref && ref.contains(event.target)
      );

      if (!clickedInsideDropdown && openDropdown !== null) {
        const dropdown = dropdownRefs.current[openDropdown];
        if (dropdown && dropdown.open) {
          dropdown.open = false; // Close the details element
          setOpenDropdown(null);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdown]);

  const handleFilterChange = (columnName, value) => {
    setColumnFilters(prev => {
      const currentValues = prev[columnName] || [];

      // Toggle the value in the array
      if (currentValues.includes(value)) {
        // Remove if already selected
        const newValues = currentValues.filter(v => v !== value);
        return {
          ...prev,
          [columnName]: newValues.length > 0 ? newValues : undefined
        };
      } else {
        // Add if not selected
        return {
          ...prev,
          [columnName]: [...currentValues, value]
        };
      }
    });
  };

  const resetFilters = () => {
    setColumnFilters({});
    setSearchTerm('');
  };

  const filteredData = data.slice(1).filter(row => {
    // Apply column filters
    for (const [columnName, selectedValues] of Object.entries(columnFilters)) {
      if (!selectedValues || selectedValues.length === 0) continue; // Skip if no filter selected

      const colIndex = headers.indexOf(columnName);
      if (colIndex === -1) continue;

      const cellValue = (row[colIndex] || '').trim();
      if (!selectedValues.includes(cellValue)) return false;
    }

    // Apply search term
    if (searchTerm && !row.some(c => (c || '').toLowerCase().includes(searchTerm.toLowerCase())))
      return false;

    return true;
  });

  if (loading || sheetsLoading) return <p className="loading">Loading...</p>;

  if (sheets.length === 0) {
    return (
      <div className="shudhikaran-display-container">
        <div className="sticky-header">
          <div className="shudhikaran-header">
            <button onClick={() => navigate('/')}>
              <ArrowLeft size={18} /> Back
            </button>
            <h2>Palitana Yatra Data</h2>
          </div>
        </div>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p style={{ color: '#ff6b6b', fontSize: '18px', marginBottom: '10px' }}>
            ❌ Could not load sheets from spreadsheet
          </p>
          <p style={{ color: '#666' }}>
            Please add a Google Sheets API key or check spreadsheet permissions.
          </p>
          <p style={{ color: '#666', marginTop: '10px', fontSize: '14px' }}>
            Get a free API key: <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">Google Cloud Console</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="shudhikaran-display-container">
      {/* HEADER */}
      <div className="sticky-header">
        <div className="shudhikaran-header">
          <button onClick={() => navigate('/')}>
            <ArrowLeft size={18} /> Back
          </button>
          <h2>Palitana Yatra Data</h2>
          <button onClick={fetchSheetData}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {/* SHEET SELECTOR BUTTONS */}
        {sheets.length > 1 && (
          <div className="sheet-selector">
            {sheets.map(sheet => (
              <button
                key={sheet.id}
                className={`sheet-btn ${activeSheetId === sheet.id ? 'active' : ''}`}
                onClick={() => setActiveSheetId(sheet.id)}
              >
                {sheet.name}
              </button>
            ))}
          </div>
        )}

        {/* SEARCH BOX - Always visible */}
        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Search across all columns..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && <X size={16} onClick={() => setSearchTerm('')} style={{ cursor: 'pointer' }} />}
        </div>

        {/* COLLAPSIBLE FILTER SECTION */}
        <details className="filter-accordion" open>
          <summary className="filter-accordion-header">
            <span>🔍 Filters</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button onClick={resetFilters} className="reset-filters-btn-header" title="Reset all filters">
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
              <span className="accordion-icon">▼</span>
            </div>
          </summary>

          <div className="filter-accordion-content">
            {/* DYNAMIC MULTI-SELECT DROPDOWNS */}
            <div className="train-filter-container">
              {headers.map((header, index) => {
                // Skip 'Unique ID' column
                if (header === 'Unique ID') return null;

                const options = columnOptions[header] || [];
                if (options.length === 0) return null; // Skip if no options

                const selectedValues = columnFilters[header] || [];
                const selectedCount = selectedValues.length;

                return (
                  <div key={index} className="custom-multiselect">
                    <label>{header}</label>
                    <details
                      className="multiselect-dropdown"
                      ref={el => dropdownRefs.current[header] = el}
                      onToggle={(e) => {
                        if (e.target.open) {
                          setOpenDropdown(header);
                        } else if (openDropdown === header) {
                          setOpenDropdown(null);
                        }
                      }}
                    >
                      <summary>
                        {selectedCount > 0 ? `${selectedCount} selected` : 'All'}
                      </summary>
                      <div className="multiselect-options">
                        {options.map(value => (
                          <label key={value} className="multiselect-option">
                            <input
                              type="checkbox"
                              checked={selectedValues.includes(value)}
                              onChange={() => handleFilterChange(header, value)}
                            />
                            <span>{value}</span>
                          </label>
                        ))}
                      </div>
                    </details>
                  </div>
                );
              })}
            </div>
          </div>
        </details>

        {/* RECORD COUNT - Always visible */}
        <div className="record-count-display">
          <span className="count-number">{filteredData.length}</span>
          <span className="count-label">records found</span>
        </div>
      </div>

      {/* TABLE */}
      {filteredData.length > 0 ? (
        <div className="table-wrapper">
          <table className="shudhikaran-table">
            <thead>
              <tr>
                {headers.map((h, i) => h !== 'Unique ID' && <th key={i}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, i) => (
                <tr key={i}>
                  {headers.map((h, j) => h !== 'Unique ID' && (
                    <td key={j} data-label={h}>{row[j] || 'N/A'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="no-data">No records found</p>
      )}
    </div>
  );
}

export default Shudhikaran;
