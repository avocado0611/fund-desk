import React, { useState } from 'react';
import { format, parseISO, isSameDay } from 'date-fns';

const TransactionLedger = ({ transactions, onDelete, onEdit }) => {
  const [activeTab, setActiveTab] = useState('today'); // 'today' or 'history'
  const [filterTicker, setFilterTicker] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const formatNum = (val) => new Intl.NumberFormat('en-US').format(Math.round(val));
  const formatPrice = (val) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(val));
  const formatType = (type) => {
    if (!type) return '';
    return type.toLowerCase().split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

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
                <th>Ex-date</th>
                <th>Settlement</th>
                <th>Input Time</th>
                <th>Type</th>
                <th>Ticker</th>
                <th className="mono">Qty / Ratio</th>
                <th className="mono">Price / Div</th>
                <th className="mono">Fee/Tax</th>
                <th className="mono">Cash Impact</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
            </thead>
            <tbody>
            {sortedTx.map((tx, idx) => {
                const displayDate = tx.tradeDate ? format(parseISO(tx.tradeDate), 'dd-MMM') : '';
                const displaySettlement = tx.settlementDate ? format(parseISO(tx.settlementDate), 'dd-MMM') : '-';
                const inputTime = tx.createdAt ? format(parseISO(tx.createdAt), 'HH:mm dd/MM') : '-';

                let cashImpact = tx.type === 'BUY' ? -(tx.qty * tx.price + (tx.fee || 0)) : (tx.qty * tx.price - (tx.fee || 0) - (tx.tax || 0));
                if (tx.type === 'DIV_CASH') cashImpact = 'Auto (95%)';
                if (tx.type === 'DIV_STOCK' || tx.type === 'BONUS_STOCK') cashImpact = 'Auto (Tax 5%)';
                if (tx.type === 'RIGHT_ISSUE') cashImpact = 'Auto (Pa)';

                const typeColor = tx.type === 'BUY' ? 'var(--color-green)' : (tx.type === 'SELL' ? 'var(--color-red)' : 'var(--color-cyan)');
                const typeBg = tx.type === 'BUY' ? '#E8F5E9' : (tx.type === 'SELL' ? '#FFEBEE' : '#E0F7FA');

                const isCorpAction = ['DIV_CASH', 'DIV_STOCK', 'BONUS_STOCK', 'RIGHT_ISSUE', 'STOCK_SPLIT', 'REVERSE_SPLIT'].includes(tx.type);

                return (
                <tr key={tx.id || idx}>
                    <td>{displayDate}</td>
                    <td style={{ fontSize: '0.85rem' }}>{displaySettlement}</td>
                    <td style={{ fontSize: '0.75rem', color: '#666' }}>{inputTime}</td>
                    <td>
                      <span className="badge" style={{ background: typeBg, color: typeColor }}>{formatType(tx.type)}</span>
                    </td>
                    <td><strong>{tx.ticker}</strong></td>
                    <td className="mono">
                        {isCorpAction ? `${(tx.ratio * 100).toFixed(0)}%` : formatNum(tx.qty)}
                    </td>
                    <td className="mono">
                        {tx.type === 'DIV_STOCK' || tx.type === 'BONUS_STOCK' ? '-' : formatPrice(tx.price)}
                    </td>
                    <td className="mono">{formatNum((tx.fee || 0) + (tx.tax || 0))}</td>
                    <td className={`mono ${typeof cashImpact === 'string' ? '' : (cashImpact >= 0 ? 'positive' : 'negative')}`}>
                        {typeof cashImpact === 'string' ? cashImpact : formatNum(cashImpact)}
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
                <td colSpan="10" style={{textAlign: 'center', padding: '2rem', color: '#999'}}>
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
