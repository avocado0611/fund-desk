import React, { useState } from 'react';

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
            
            // For closed positions, use realizedPnL instead
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
      </table>
    </div>
  );
};

export default HoldingsTable;
