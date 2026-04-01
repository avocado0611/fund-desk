import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const NAVDashboard = ({ data, onRefresh, initialNav, onInitialNavChange, showInitialNav }) => {
  if (!data) return null;

  const formatNum = (val) => new Intl.NumberFormat('en-US').format(Math.round(val));
  const formatPercent = (val) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(val) + '%';

  // Assets for Pie Chart
  const assetData = [
    { name: 'Equity', value: data.equityValue || 0, color: '#1D4477' },
    { name: 'Bond', value: data.bondValue || 0, color: '#EC2224' },
    { name: 'Cash', value: data.cashAvailable || 0, color: '#2E7D32' },
    { name: 'Margin Debt', value: data.marginDebt || 0, color: '#9E9E9E' }
  ].filter(item => item.value > 0);

  return (
    <div className="card" style={{ borderTop: '4px solid var(--color-primary)' }}>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>NAV SUMMARY: {data.name.toUpperCase()}</span>
        <button className="btn-primary" onClick={onRefresh} style={{ padding: '4px 12px', fontSize: '0.75rem' }}>
          REFRESH PRICES
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 300px', gap: '2rem' }}>
        {/* Assets Metrics */}
        <div className="summary-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          
          <div className="summary-item">
            <span className="label">EQUITY VALUE</span>
            <span className="value">{formatNum(data.equityValue)}</span>
            <span className="weight-label">{formatPercent(data.weights?.equity || 0)}</span>
          </div>

          <div className="summary-item">
            <span className="label">BOND (COUPON BOND)</span>
            <span className="value">{formatNum(data.bondValue || 0)}</span>
            <span className="weight-label">{formatPercent(data.weights?.bond || 0)}</span>
          </div>

          <div className="summary-item">
            <span className="label">CASH AVAILABLE</span>
            <span className="value" style={{ color: 'var(--color-green)' }}>{formatNum(data.cashAvailable)}</span>
            <span className="weight-label">{formatPercent(data.weights?.cash || 0)}</span>
          </div>

          <div className="summary-item">
            <span className="label">MARGIN DEBT</span>
            <span className="value" style={{ color: 'var(--color-red)' }}>{formatNum(data.marginDebt)}</span>
            <span className="weight-label">{formatPercent(data.weights?.margin || 0)}</span>
          </div>

          <div className="summary-item" style={{ borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
            <span className="label">MARGIN INTEREST (9%/Y)</span>
            <span className="value" style={{ color: 'var(--color-red)', fontSize: '0.9rem' }}>
                -{formatNum(data.marginInterestAccrued || 0)}
            </span>
          </div>

          <div className="summary-item" style={{ borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
            <span className="label">REALIZED P&L</span>
            <span className="value" style={{ color: data.realizedPnL >= 0 ? 'var(--color-green)' : 'var(--color-red)' }}>
                {formatNum(data.realizedPnL)}
            </span>
          </div>

          {showInitialNav && (
            <div className="summary-item" style={{ gridColumn: 'span 2', background: '#f9f9f9', padding: '0.5rem' }}>
              <span className="label" style={{ fontSize: '0.65rem' }}>INITIAL NAV (CAPITAL)</span>
              <input 
                type="number" 
                className="input-subtle"
                value={initialNav} 
                onChange={(e) => onInitialNavChange(parseFloat(e.target.value))}
                style={{ fontSize: '0.75rem', fontWeight: 'bold' }}
              />
            </div>
          )}

          <div className="summary-item highlight" style={{ gridColumn: 'span 2', background: 'var(--color-primary)', color: 'white', marginTop: '0.5rem' }}>
            <span className="label" style={{ color: 'rgba(255,255,255,0.7)' }}>CURRENT NAV</span>
            <span className="value-huge">{formatNum(data.nav)}</span>
          </div>
        </div>

        {/* PIE CHART */}
        <div style={{ height: '300px', width: '100%' }}>
            <span className="label" style={{ textAlign: 'center', display: 'block', marginBottom: '0.5rem' }}>ASSET ALLOCATION</span>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={assetData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {assetData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatNum(value)} />
                    <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default NAVDashboard;
