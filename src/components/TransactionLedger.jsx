import React, { useState } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';

const TransactionLedger = ({ transactions, onDelete, onEdit }) => {
  const [activeTab, setActiveTab] = useState('today'); // 'today' or 'history'
  const [filterTicker, setFilterTicker] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const formatNum = (val) => new Intl.NumberFormat('en-US').format(Math.round(val));
  const formatPrice = (val) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val / 1000);

  const now = new Date();
  
  // Filtering Logic
  let filtered = [...transactions];

  // 1. Tab filtering (Today vs History)
  if (activeTab === 'today') {
    filtered = filtered.filter(tx => isSameDay(parseISO(tx.tradeDate), now));
  } else {
    filtered = filtered.filter(tx => !isSameDay(parseISO(tx.tradeDate), now));
  }

  // 2. Ticker search
  if (filterTicker) {
    filtered = filtered.filter(tx => tx.ticker.includes(filterTicker.toUpperCase()));
  }

  // 3. Date Range (Timeline)
  if (dateRange.start) {
    filtered = filtered.filter(tx => tx.tradeDate >= dateRange.start);
  }
  if (dateRange.end) {
    filtered = filtered.filter(tx => tx.tradeDate <= dateRange.end);
  }

  // Sort: newest first
  const sortedTx = filtered.sort((a, b) => 
    parseISO(b.tradeDate).getTime() - parseISO(a.tradeDate).getTime()
  );

  return (
    <div className="card">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>TRANSACTION LEDGER</span>
        <div className="btn-toggle-group" style={{ marginBottom: 0 }}>
          <button 
            className={`btn-toggle ${activeTab === 'today' ? 'active' : ''}`}
            onClick={() => setActiveTab('today')}
          >
            TODAY
          </button>
          <button 
            className={`btn-toggle ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            HISTORY
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'end', background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
        <div className="form-group" style={{ flex: 1 }}>
            <label>Search Ticker</label>
            <input 
                type="text" 
                value={filterTicker} 
                onChange={(e) => setFilterTicker(e.target.value)} 
                placeholder="BY TICKER..."
                style={{ fontSize: '0.8rem' }}
            />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
            <label>From Date</label>
            <input 
                type="date" 
                value={dateRange.start} 
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                style={{ fontSize: '0.8rem' }}
            />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
            <label>To Date</label>
            <input 
                type="date" 
                value={dateRange.end} 
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                style={{ fontSize: '0.8rem' }}
            />
        </div>
        <button 
            className="btn-toggle" 
            style={{ height: '36px' }}
            onClick={() => { setFilterTicker(''); setDateRange({ start: '', end: '' }); }}
        >
            RESET
        </button>
      </div>

      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table>
            <thead>
            <tr>
                <th>Date</th>
                <th>Input Time</th>
                <th>Type</th>
                <th>Ticker</th>
                <th className="mono">Qty</th>
                <th className="mono">Price (x1,000đ)</th>
                <th className="mono">Fee/Tax</th>
                <th className="mono">Cash Impact</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
            </thead>
            <tbody>
            {sortedTx.map((tx, idx) => {
                const cashImpact = tx.type === 'BUY' ? -(tx.qty * (tx.price / 1) + (tx.fee || 0)) : (tx.qty * (tx.price / 1) - (tx.fee || 0) - (tx.tax || 0));
                
                const typeColor = tx.type === 'BUY' ? 'var(--color-green)' : (tx.type === 'SELL' ? 'var(--color-red)' : 'var(--color-cyan)');
                const typeBg = tx.type === 'BUY' ? '#E8F5E9' : (tx.type === 'SELL' ? '#FFEBEE' : '#E0F7FA');

                const displayDate = tx.tradeDate ? format(parseISO(tx.tradeDate), 'dd-MMM-yyyy') : '';
                const inputTime = tx.createdAt ? format(parseISO(tx.createdAt), 'HH:mm dd/MM') : '-';

                return (
                <tr key={tx.id || idx}>
                    <td>{displayDate}</td>
                    <td style={{ fontSize: '0.75rem', color: '#666' }}>{inputTime}</td>
                    <td>
                      <span className="badge" style={{ background: typeBg, color: typeColor }}>{tx.type}</span>
                    </td>
                    <td><strong>{tx.ticker}</strong></td>
                    <td className="mono">{formatNum(tx.qty)}</td>
                    <td className="mono">{formatPrice(tx.price)}</td>
                    <td className="mono">{formatNum((tx.fee || 0) + (tx.tax || 0))}</td>
                    <td className={`mono ${cashImpact >= 0 ? 'positive' : 'negative'}`}>
                        {formatNum(cashImpact)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                        <button onClick={() => onEdit(tx)} style={{ border: 'none', background: 'none', cursor: 'pointer', marginRight: '8px', color: 'var(--color-primary)' }}>✎</button>
                        <button onClick={() => onDelete(tx.id || idx)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-red)' }}>✕</button>
                    </td>
                </tr>
                );
            })}
            {sortedTx.length === 0 && (
                <tr>
                <td colSpan="9" style={{textAlign: 'center', padding: '2rem', color: '#999'}}>
                    No transactions found matches your filters.
                </td>
                </tr>
            )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionLedger;
