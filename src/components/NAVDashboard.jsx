import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const NAVDashboard = ({ data, onRefresh, initialNav, onInitialNavChange, showInitialNav }) => {
  if (!data) return null;

  const formatNum = (val) => new Intl.NumberFormat('en-US').format(Math.round(val));
  const formatPercent = (val) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(val) + '%';

  const assetData = [
    { name: 'Equity', value: data.equityValue || 0, color: '#1D4477' },
    { name: 'Bond', value: data.bondValue || 0, color: '#EC2224' },
    { name: 'Cash', value: data.cashAvailable || 0, color: '#2E7D32' },
    { name: 'Margin Debt', value: data.marginDebt || 0, color: '#9E9E9E' }
  ].filter(item => item.value > 0);

  return (
    <div className="card" style={{ borderTop: '4px solid var(--color-primary)', padding: '2rem' }}>
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>NAV SUMMARY: {data.name.toUpperCase()}</span>
        <button className="btn-primary" onClick={onRefresh} style={{ padding: '6px 16px', fontSize: '0.8rem' }}>
          REFRESH MARKET PRICES
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 300px', gap: '3rem' }}>
        {/* Assets Table - No Borders */}
        <div>
          <table className="nav-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              <tr>
                <td style={{ padding: '0.8rem 0', color: '#666', textTransform: 'lowercase' }}>equity value</td>
                <td style={{ padding: '0.8rem 0', textAlign: 'right', fontWeight: '500' }}>{formatNum(data.equityValue)}</td>
                <td style={{ padding: '0.8rem 0', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>{formatPercent(data.weights?.equity || 0)}</td>
              </tr>
              <tr>
                <td style={{ padding: '0.8rem 0', color: '#666', textTransform: 'lowercase' }}>bond (coupon bond)</td>
                <td style={{ padding: '0.8rem 0', textAlign: 'right', fontWeight: '500' }}>{formatNum(data.bondValue || 0)}</td>
                <td style={{ padding: '0.8rem 0', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>{formatPercent(data.weights?.bond || 0)}</td>
              </tr>
              <tr>
                <td style={{ padding: '0.8rem 0', color: '#666', textTransform: 'lowercase' }}>cash available</td>
                <td style={{ padding: '0.8rem 0', textAlign: 'right', fontWeight: '500', color: 'var(--color-green)' }}>{formatNum(data.cashAvailable)}</td>
                <td style={{ padding: '0.8rem 0', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>{formatPercent(data.weights?.cash || 0)}</td>
              </tr>
              <tr>
                <td style={{ padding: '0.8rem 0', color: '#666', textTransform: 'lowercase' }}>margin debt</td>
                <td style={{ padding: '0.8rem 0', textAlign: 'right', fontWeight: '500', color: 'var(--color-red)' }}>{formatNum(data.marginDebt)}</td>
                <td style={{ padding: '0.8rem 0', textAlign: 'right', fontWeight: 'bold', color: '#000' }}>{formatPercent(data.weights?.margin || 0)}</td>
              </tr>
              <tr style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: '0.8rem 0', color: '#999', fontSize: '0.85rem', textTransform: 'lowercase' }}>margin interest (9%/y)</td>
                <td style={{ padding: '0.8rem 0', textAlign: 'right', color: 'var(--color-red)', fontSize: '0.85rem' }}>-{formatNum(data.marginInterestAccrued || 0)}</td>
                <td></td>
              </tr>
              <tr>
                <td style={{ padding: '0.8rem 0', color: '#999', fontSize: '0.85rem', textTransform: 'lowercase' }}>realized p&l</td>
                <td style={{ padding: '0.8rem 0', textAlign: 'right', color: data.realizedPnL >= 0 ? 'var(--color-green)' : 'var(--color-red)', fontSize: '0.85rem' }}>{formatNum(data.realizedPnL)}</td>
                <td></td>
              </tr>
              
              {showInitialNav && (
                <tr style={{ background: '#fcfcfc' }}>
                  <td style={{ padding: '1rem 0', color: '#888', fontStyle: 'italic', textTransform: 'lowercase' }}>initial nav (capital)</td>
                  <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                    <input 
                      type="text" 
                      className="input-subtle"
                      value={new Intl.NumberFormat('en-US').format(initialNav)} 
                      onChange={(e) => {
                        const val = parseFloat(e.target.value.replace(/,/g, ''));
                        if (!isNaN(val)) onInitialNavChange(val);
                      }}
                      style={{ fontSize: '0.9rem', fontWeight: 'bold', textAlign: 'right', width: '150px' }}
                    />
                  </td>
                  <td></td>
                </tr>
              )}

              <tr style={{ borderTop: '2px solid var(--color-primary)' }}>
                <td style={{ padding: '1.5rem 0', color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.1rem', textTransform: 'lowercase' }}>current nav</td>
                <td style={{ padding: '1.5rem 0', textAlign: 'right', fontWeight: 'bold', fontSize: '1.8rem', color: 'var(--color-primary)' }}>
                    {formatNum(data.nav)}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PIE CHART */}
        <div style={{ height: '350px', width: '100%' }}>
            <span style={{ textAlign: 'center', display: 'block', fontSize: '0.75rem', color: '#999', textTransform: 'lowercase', marginBottom: '1rem' }}>asset allocation</span>
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={assetData}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={95}
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
