import React, { useEffect, useState } from 'react';
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

  const [selectedTrain, setSelectedTrain] = useState('');
  const [selectedAravali, setSelectedAravali] = useState('');
  const [selectedRanakpur, setSelectedRanakpur] = useState('');

  const [aravaliOptions, setAravaliOptions] = useState([]);
  const [ranakpurOptions, setRanakpurOptions] = useState([]);

  const SPREADSHEET_ID = '1p5i-GyWURzC8LrTg7RWsbUPGkOBd81BC9uh8kB26_Rg';
  const SHEET_ID = '0';

  /* ---------------- HELPERS ---------------- */

  const findColumnIndexContains = (headers, keyword) =>
    headers.findIndex(h => h.toLowerCase().includes(keyword.toLowerCase()));

  /* ---------------- FETCH DATA ---------------- */

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

      console.log('HEADERS FROM SHEET 👇', hdrs);

      const trainIdx = findColumnIndexContains(hdrs, 'train');
      const returnIdx = findColumnIndexContains(hdrs, 'return');

      console.log('TRAIN INDEX 👉', trainIdx);
      console.log('RETURN INDEX 👉', returnIdx);

      const valid = ['S1', 'S2', 'S3', 'S4', 'S5'];
      const aravaliSet = new Set();
      const ranakpurSet = new Set();

      rows.slice(1).forEach(row => {
        const trainVal = (row[trainIdx] || '').toLowerCase();
        const returnRaw = (row[returnIdx] || '').trim();
        const returnKey = returnRaw.split('-')[0].trim();

        if (trainVal.includes('aravali') && valid.includes(returnKey)) {
          aravaliSet.add(returnKey);
        }

        if (trainVal.includes('ranakpur') && valid.includes(returnKey)) {
          ranakpurSet.add(returnKey);
        }
      });

      const finalAravali = [...aravaliSet].sort();
      const finalRanakpur = [...ranakpurSet].sort();

      console.log('FINAL ARAVALI OPTIONS 👉', finalAravali);

      setAravaliOptions(finalAravali);
      setRanakpurOptions(finalRanakpur);

      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load spreadsheet');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FILTER DATA ---------------- */

  const filteredData = data.slice(1).filter(row => {
    // Lokshakti filter
    if (selectedTrain) {
      const idx = findColumnIndexContains(headers, 'depature');
      if (idx !== -1 && !(row[idx] || '').includes(selectedTrain)) return false;
    }

    // ARAVALI filter
    if (selectedAravali) {
      const trainIdx = findColumnIndexContains(headers, 'train');
      const returnIdx = findColumnIndexContains(headers, 'return');

      const trainVal = (row[trainIdx] || '').toLowerCase();
      const returnVal = (row[returnIdx] || '').trim();

      if (
        !trainVal.includes('aravali') ||
        !returnVal.startsWith(selectedAravali)
      ) {
        return false;
      }
    }

    // RANAKPUR filter
    if (selectedRanakpur) {
      const trainIdx = findColumnIndexContains(headers, 'train');
      const returnIdx = findColumnIndexContains(headers, 'return');

      const trainVal = (row[trainIdx] || '').toLowerCase();
      const returnVal = (row[returnIdx] || '').trim();

      if (
        !trainVal.includes('ranakpur') ||
        !returnVal.startsWith(selectedRanakpur)
      ) {
        return false;
      }
    }

    // Global search
    if (
      searchTerm &&
      !row.some(c => (c || '').toLowerCase().includes(searchTerm.toLowerCase()))
    ) {
      return false;
    }

    // Column filters
    for (const [i, v] of Object.entries(filters)) {
      if (v && !(row[i] || '').toLowerCase().includes(v)) return false;
    }

    return true;
  });

  /* ---------------- UI ---------------- */

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div className="shudhikaran-display-container">
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

      {/* TRAIN FILTERS */}
      <div className="train-filter-container">
        <select value={selectedAravali} onChange={e => setSelectedAravali(e.target.value)}>
          <option value="">All ARAVALI</option>
          {aravaliOptions.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        <select value={selectedRanakpur} onChange={e => setSelectedRanakpur(e.target.value)}>
          <option value="">All RANAKPUR</option>
          {ranakpurOptions.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

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
        {searchTerm && <X onClick={() => setSearchTerm('')} />}
      </div>

      {/* TABLE */}
      {filteredData.length > 0 ? (
        <table className="shudhikaran-table">
          <thead>
            <tr>
              {headers.map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, i) => (
              <tr key={i}>
                {headers.map((_, j) => (
                  <td key={j}>{row[j] || 'N/A'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ padding: 20 }}>No records found</p>
      )}
    </div>
  );
}

export default Shudhikaran;
