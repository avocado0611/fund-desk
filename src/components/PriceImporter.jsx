import React, { useState } from 'react';

const PriceImporter = ({ onImport }) => {
  const [data, setData] = useState('');
  const [error, setError] = useState('');

  const handleImport = () => {
    try {
      const lines = data.split('\n').filter(line => line.trim());
      const prices = {};
      lines.forEach(line => {
        // Expected format: Ticker | Price OR Ticker Tab Price
        // Common copy-paste from Sheet is Ticker \t Price
        const parts = line.split(/[\t|]/).map(p => p.trim());
        if (parts.length >= 2) {
          const ticker = parts[0].toUpperCase();
          const price = parseFloat(parts[1].replace(/,/g, ''));
          if (!isNaN(price)) {
            prices[ticker] = price;
          }
        }
      });
      
      if (Object.keys(prices).length > 0) {
        onImport(prices);
        setData('');
        setError('');
        alert(`Imported ${Object.keys(prices).length} ticker prices.`);
      } else {
        setError('No valid data found. Format: TICKER | PRICE');
      }
    } catch (e) {
      setError('Import failed: ' + e.message);
    }
  };

  return (
    <div className="card">
      <div className="section-header">MARKET PRICE IMPORT</div>
      <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>
        Paste from Google Sheet (column format: Ticker | Price)
      </p>
      <textarea
        className="import-area"
        placeholder="VNM 105.500&#10;FPT 98.000"
        value={data}
        onChange={(e) => setData(e.target.value)}
      />
      {error && <div style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.5rem' }}>{error}</div>}
      <button 
        className="btn-primary" 
        style={{ marginTop: '1rem', width: '100%' }}
        onClick={handleImport}
      >
        APPLY PRICES
      </button>
    </div>
  );
};

export default PriceImporter;
