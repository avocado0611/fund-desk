import React, { useState } from 'react';

const MarketPriceManager = ({ prices, onChange }) => {
  const [newTicker, setNewTicker] = useState('');

  const handleAdd = () => {
    if (!newTicker) return;
    const ticker = newTicker.toUpperCase().trim();
    if (!prices[ticker]) {
      onChange({ ...prices, [ticker]: 0 });
    }
    setNewTicker('');
  };

  const handleDelete = (ticker) => {
    if (window.confirm(`Xóa mã ${ticker} khỏi danh sách giá?`)) {
      const newPrices = { ...prices };
      delete newPrices[ticker];
      onChange(newPrices);
    }
  };

  const handlePriceChange = (ticker, val) => {
    const rawValue = val.replace(/,/g, '');
    if (!isNaN(rawValue) || rawValue === '' || rawValue === '.') {
      // Store in VNĐ directly (rounded)
      const vndValue = rawValue === '' ? 0 : Math.round(parseFloat(rawValue));
      onChange({ ...prices, [ticker]: vndValue });
    }
  };

  const formatInput = (val) => {
    if (val === 0) return '0';
    if (!val) return '';
    const roundedVal = Math.round(val);
    const parts = roundedVal.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join('.');
  };

  return (
    <div className="card">
      <div className="section-header">MARKET PRICES</div>
      
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input 
          type="text" 
          value={newTicker} 
          onChange={(e) => setNewTicker(e.target.value.toUpperCase())}
          placeholder="TICKER (VNM...)"
          style={{ flex: 1 }}
        />
        <button className="btn-toggle active" onClick={handleAdd}>ADD</button>
      </div>

      <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
        <table style={{ width: '100%', fontSize: '0.9rem' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Ticker</th>
              <th style={{ textAlign: 'right' }}>Price (VNĐ)</th>
              <th style={{ textAlign: 'center' }}>X</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(prices).sort().map(ticker => (
              <tr key={ticker}>
                <td style={{ fontWeight: 'bold' }}>{ticker}</td>
                <td>
                  <input 
                    type="text"
                    value={formatInput(prices[ticker])} 
                    onChange={(e) => handlePriceChange(ticker, e.target.value)}
                    style={{ textAlign: 'right', padding: '0.4rem', border: '1px solid #ddd', borderRadius: '4px', width: '120px' }}
                  />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button 
                    onClick={() => handleDelete(ticker)} 
                    style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'red', fontSize: '1.2rem' }}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketPriceManager;
