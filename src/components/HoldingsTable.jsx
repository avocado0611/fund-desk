import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#1D4477', '#EC2224', '#2E7D32', '#9E9E9E', '#FF9800', '#9C27B0', '#00BCD4', '#795548', '#607D8B', '#03A9F4'];

const HoldingsTable = ({ holdings }) => {
  const [activeTab, setActiveTab] = useState('open'); // 'open' or 'closed'

  const formatNum = (val) => new Intl.NumberFormat('en-US').format(Math.round(val));
  const formatPrice = (val) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val / 1000);
  const formatPercent = (val) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val) + '%';

  const holdingsList = Object.entries(holdings).map(([ticker, data]) => ({
    ticker,
    ...data
  }));

  const filteredHoldings = activeTab === 'open' 
    ? holdingsList.filter(h => h.qty > 0)
    : holdingsList.filter(h => h.qty <= 0);

  // Totals Calculation
  const totals = filteredHoldings.reduce((acc, h) => {
    const pnl = h.qty > 0 ? (h.marketValue - h.totalCost) : h.realizedPnL;
    acc.qty += h.qty;
    acc.marketValue += h.marketValue;
    acc.pnl += pnl;
    acc.weight += h.weight;
    acc.totalCost += h.totalCost;
    return acc;
  }, { qty: 0, marketValue: 0, pnl: 0, weight: 0, totalCost: 0 });

  const totalPnlPercent = totals.totalCost > 0 ? (totals.pnl / totals.totalCost) * 100 : 0;

  // Data for Pie Chart (Only Open Positions)
  const pieData = filteredHoldings
    .filter(h => h.marketValue > 0)
    .map(h => ({
      name: h.ticker,
      value: h.marketValue
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="card">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>POSITION HOLDINGS</span>
        <div className="btn-toggle-group" style={{ marginBottom: 0 }}>
          <button 
            className={`btn-toggle ${activeTab === 'open' ? 'active' : ''}`}
            onClick={() => setActiveTab('open')}
          >
            OPEN POSITIONS
          </button>
          <button 
            className={`btn-toggle ${activeTab === 'closed' ? 'active' : ''}`}
            onClick={() => setActiveTab('closed')}
          >
            CLOSED / SETTLED
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: activeTab === 'open' && pieData.length > 0 ? 'minmax(600px, 1fr) 300px' : '1fr', gap: '2rem' }}>
        {/* Table Section */}
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Ticker</th>
                <th className="mono">Quantity</th>
                <th className="mono">Avg Price</th>
                <th className="mono">Mkt Price</th>
                <th className="mono">Market Value</th>
                <th className="mono">Gain/Loss</th>
                <th className="mono">% P&L</th>
                <th className="mono">% Weight</th>
              </tr>
            </thead>
            <tbody>
              {filteredHoldings.map((h) => {
                const pnl = h.marketValue - h.totalCost;
                const pnlPercent = h.totalCost > 0 ? (pnl / h.totalCost) * 100 : 0;
                
                const displayPnL = h.qty > 0 ? pnl : h.realizedPnL;
                const displayPnLPercent = h.qty > 0 ? pnlPercent : 0;

                return (
                  <tr key={h.ticker}>
                    <td><strong>{h.ticker}</strong></td>
                    <td className="mono">{formatNum(h.qty)}</td>
                    <td className="mono">{formatPrice(h.avgPrice)}</td>
                    <td className="mono" style={{ color: '#666' }}>{formatPrice(h.marketPrice)}</td>
                    <td className="mono">{formatNum(h.marketValue)}</td>
                    <td className={`mono ${displayPnL >= 0 ? 'positive' : 'negative'}`}>
                      {formatNum(displayPnL)}
                    </td>
                    <td className={`mono ${displayPnL >= 0 ? 'positive' : 'negative'}`}>
                      {formatPercent(displayPnLPercent)}
                    </td>
                    <td className="mono">{formatPercent(h.weight)}</td>
                  </tr>
                );
              })}
              {filteredHoldings.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                    No {activeTab} positions found.
                  </td>
                </tr>
              )}
            </tbody>
            {filteredHoldings.length > 0 && (
              <tfoot>
                <tr style={{ borderTop: '2px solid #ccc', background: '#f9f9f9', fontWeight: 'bold' }}>
                  <td>TOTAL</td>
                  <td className="mono">{formatNum(totals.qty)}</td>
                  <td>-</td>
                  <td>-</td>
                  <td className="mono">{formatNum(totals.marketValue)}</td>
                  <td className={`mono ${totals.pnl >= 0 ? 'positive' : 'negative'}`}>
                    {formatNum(totals.pnl)}
                  </td>
                  <td className={`mono ${totals.pnl >= 0 ? 'positive' : 'negative'}`}>
                    {formatPercent(totalPnlPercent)}
                  </td>
                  <td className="mono">{formatPercent(totals.weight)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pie Chart Section - Only for Open Positions */}
        {activeTab === 'open' && pieData.length > 0 && (
          <div style={{ height: '300px', background: '#fcfcfc', borderRadius: '8px', padding: '1rem', border: '1px solid #eee' }}>
            <span style={{ textAlign: 'center', display: 'block', fontSize: '0.8rem', color: '#666', fontWeight: 'bold', marginBottom: '0.5rem' }}>Holdings Portfolio (%)</span>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                    formatter={(value) => `${((value / totals.marketValue) * 100).toFixed(2)}%`}
                    labelStyle={{ color: '#333' }}
                />
                <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default HoldingsTable;
