import React from 'react';

const InitialNavManager = ({ initialNavs, onChange }) => {
  const portfolios = ['Tự doanh', 'QTN', 'QNV'];

  const handleInputChange = (p, val) => {
    const rawValue = val.replace(/,/g, '');
    if (!isNaN(rawValue) || rawValue === '') {
      onChange({ ...initialNavs, [p]: parseFloat(rawValue) || 0 });
    }
  };

  const formatNum = (val) => new Intl.NumberFormat('en-US').format(val || 0);

  return (
    <div className="card">
      <div className="section-header">INITIAL NAV SETTINGS (VỐN ĐẦU KỲ)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {portfolios.map(p => (
          <div key={p} className="form-group">
            <label style={{ fontSize: '0.8rem' }}>{p}</label>
            <input
              type="text"
              value={formatNum(initialNavs[p])}
              onChange={(e) => handleInputChange(p, e.target.value)}
              placeholder="0"
              style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default InitialNavManager;
