import React, { useEffect, useState } from 'react';
import { ArrowLeft, RefreshCw, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './shudhikaran.css';

function Shudhikaran() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');

  // Dropdown states
  const [selectedLokShakti, setSelectedLokShakti] = useState('');
  const [selectedAravali, setSelectedAravali] = useState('');
  const [selectedRanakpur, setSelectedRanakpur] = useState('');

  const [aravaliOptions, setAravaliOptions] = useState([]);
  const [ranakpurOptions, setRanakpurOptions] = useState([]);

  const SPREADSHEET_ID = '1p5i-GyWURzC8LrTg7RWsbUPGkOBd81BC9uh8kB26_Rg';
  const SHEET_ID = '0';

  const ALL_SEATS = ['S1', 'S2', 'S3', 'S4', 'S5'];

  const findColumnIndexContains = (headers, keyword) =>
    headers.findIndex(h => h.toLowerCase().includes(keyword.toLowerCase()));

  useEffect(() => {
    fetchSheetData();
  }, []);

  const fetchSheetData = async () => {
    try {
      setLoading(true);
      const csvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${SHEET_ID}`;
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

      const trainIdx = findColumnIndexContains(hdrs, 'train');
      const returnIdx = findColumnIndexContains(hdrs, 'return');

      const aravaliSet = new Set();
      const ranakpurSet = new Set();

      rows.slice(1).forEach(row => {
        const trainVal = (row[trainIdx] || '').toLowerCase();
        const returnRaw = (row[returnIdx] || '').trim();
        const returnKey = returnRaw.split('-')[0].trim();

        if (trainVal.includes('aravali') && ALL_SEATS.includes(returnKey)) {
          aravaliSet.add(returnKey);
        }
        if (trainVal.includes('ranakpur') && ALL_SEATS.includes(returnKey)) {
          ranakpurSet.add(returnKey);
        }
      });

      setAravaliOptions([...aravaliSet].sort());
      setRanakpurOptions([...ranakpurSet].sort());
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load spreadsheet');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- FILTER DATA ----------------
  const filteredData = data.slice(1).filter(row => {
    if (selectedLokShakti) {
      const depIdx = findColumnIndexContains(headers, 'depature');
      const depValue = (row[depIdx] || '').trim();
      if (!depValue.startsWith(selectedLokShakti)) return false;
    }

    if (selectedAravali) {
      const trainIdx = findColumnIndexContains(headers, 'train');
      const returnIdx = findColumnIndexContains(headers, 'return');
      const trainVal = (row[trainIdx] || '').toLowerCase();
      const returnVal = (row[returnIdx] || '').trim();
      if (!trainVal.includes('aravali') || !returnVal.startsWith(selectedAravali))
        return false;
    }

    if (selectedRanakpur) {
      const trainIdx = findColumnIndexContains(headers, 'train');
      const returnIdx = findColumnIndexContains(headers, 'return');
      const trainVal = (row[trainIdx] || '').toLowerCase();
      const returnVal = (row[returnIdx] || '').trim();
      if (!trainVal.includes('ranakpur') || !returnVal.startsWith(selectedRanakpur))
        return false;
    }

    if (searchTerm && !row.some(c => (c || '').toLowerCase().includes(searchTerm.toLowerCase())))
      return false;

    return true;
  });

  if (loading) return <p className="loading">Loading...</p>;

  // ---------------- HANDLE DROPDOWN SELECTION ----------------
  const handleLokShakti = val => {
    setSelectedLokShakti(val);
    setSelectedAravali('');
    setSelectedRanakpur('');
  };
  const handleAravali = val => {
    setSelectedAravali(val);
    setSelectedLokShakti('');
    setSelectedRanakpur('');
  };
  const handleRanakpur = val => {
    setSelectedRanakpur(val);
    setSelectedLokShakti('');
    setSelectedAravali('');
  };

  return (
    <div className="shudhikaran-display-container">
      {/* HEADER */}
      <div className="shudhikaran-header">
        <button onClick={() => navigate('/')}>
          <ArrowLeft size={18} /> Back
        </button>
        <h2>Shudhikaran Data</h2>
        <button onClick={fetchSheetData}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}

      {/* DROPDOWNS */}
      <div className="train-filter-container">
        <div className="custom-dropdown">
          <label>Lok Shakti</label>
          <select value={selectedLokShakti} onChange={e => handleLokShakti(e.target.value)}>
            <option value="">All</option>
            {ALL_SEATS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="custom-dropdown">
          <label>ARAVALI</label>
          <select value={selectedAravali} onChange={e => handleAravali(e.target.value)}>
            <option value="">All</option>
            {aravaliOptions.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div className="custom-dropdown">
          <label>RANAKPUR</label>
          <select value={selectedRanakpur} onChange={e => handleRanakpur(e.target.value)}>
            <option value="">All</option>
            {ranakpurOptions.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <span>{filteredData.length} records</span>
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

      {/* TABLE */}
      {filteredData.length > 0 ? (
        <table className="shudhikaran-table">
          <thead>
            <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {filteredData.map((row, i) => (
              <tr key={i}>
                {headers.map((_, j) => <td key={j}>{row[j] || 'N/A'}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="no-data">No records found</p>
      )}
    </div>
  );
}

export default Shudhikaran;
