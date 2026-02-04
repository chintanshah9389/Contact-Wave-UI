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

  // State for dynamically loaded sheets
  const [sheets, setSheets] = useState([]);
  const [activeSheetId, setActiveSheetId] = useState(null);
  const [sheetsLoading, setSheetsLoading] = useState(true);

  // ✅ AUTOMATICALLY FETCH ALL SHEETS FROM SPREADSHEET
  useEffect(() => {
    const fetchSheets = async () => {
      try {
        setSheetsLoading(true);

        // Use CORS proxy to fetch the spreadsheet HTML
        const corsProxy = 'https://api.allorigins.win/raw?url=';
        const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`;
        const proxyUrl = corsProxy + encodeURIComponent(spreadsheetUrl);

        console.log('🔍 Fetching sheets from spreadsheet...');
        const response = await fetch(proxyUrl);
        const html = await response.text();

        // Extract sheet data from HTML using regex
        const sheetMatches = [...html.matchAll(/"sheetId":(\d+),"title":"([^"]+)"/g)];
        const extractedSheets = sheetMatches.map(match => ({
          id: match[1],
          name: match[2]
        }));

        if (extractedSheets.length > 0) {
          console.log('✅ Found sheets:', extractedSheets);
          setSheets(extractedSheets);
          setActiveSheetId(extractedSheets[0].id);
        } else {
          console.warn('⚠️ No sheets found, using manual configuration');
          setSheets([
            { id: '0', name: 'Sheet 1' },
            { id: '854420671', name: 'Sheet 2' }
          ]);
          setActiveSheetId('0');
        }
      } catch (error) {
        console.error('❌ Failed to fetch sheets dynamically:', error);
        // Fallback to manual configuration with your actual sheet IDs
        setSheets([
          { id: '0', name: 'Sheet 1' },
          { id: '854420671', name: 'Sheet 2' }
        ]);
        setActiveSheetId('0');
      } finally {
        setSheetsLoading(false);
      }
    };

    fetchSheets();
  }, [SPREADSHEET_ID]);

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
      // Check if click is outside all dropdowns
      const clickedOutside = Object.values(dropdownRefs.current).every(
        ref => ref && !ref.contains(event.target)
      );

      if (clickedOutside && openDropdown !== null) {
        const dropdown = dropdownRefs.current[openDropdown];
        if (dropdown) {
          dropdown.removeAttribute('open');
          setOpenDropdown(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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

  if (loading) return <p className="loading">Loading...</p>;

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

        {/* SHEET SELECTOR BUTTONS - Dynamically Loaded */}
        {console.log('Sheets available:', sheets, 'Count:', sheets.length)}
        {sheets.length >= 1 && (
          <div className="sheet-selector">
            <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Sheets ({sheets.length}):</span>
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

          {/* RESET BUTTON */}
          <button className="reset-filters-btn" onClick={resetFilters} title="Reset all filters">
            <RotateCcw size={16} /> Reset
          </button>

          {/* HIGHLIGHTED COUNT */}
          <span className="record-count">{filteredData.length} records</span>
        </div>

        {/* SEARCH */}
        <div className="search-box">
          <Search size={18} />
          <input
            placeholder="Search..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && <X size={16} onClick={() => setSearchTerm('')} />}
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
