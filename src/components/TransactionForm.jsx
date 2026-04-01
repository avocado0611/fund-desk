import React, { useState, useEffect } from 'react';

const BROKERS = {
  'MBS': 0.0012,
  'VPBankS': 0.0012,
  'SSI': 0.0015,
  'HSC': 0.0015,
  'VPS': 0.0015,
  'VDSC': 0.0015,
  'DNSE': 0.0010,
  'VND': 0.00147,
  'OTHER': 0.0015
};

const TransactionForm = ({ onAdd, onUpdate, editingTx, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    tradeDate: new Date().toISOString().split('T')[0],
    type: 'BUY',
    ticker: '',
    qty: '',
    price: '',
    broker: 'SSI',
    portfolio: 'Tự doanh'
  });

  const isCashFlow = formData.type === 'DEPOSIT' || formData.type === 'WITHDRAW';

  useEffect(() => {
    if (editingTx) {
      setFormData({
        ...editingTx,
        qty: editingTx.qty.toString(),
        price: (editingTx.price / 1000).toString(),
      });
    } else {
        setFormData(prev => ({
            ...prev,
            ticker: '',
            qty: '',
            price: ''
        }));
    }
  }, [editingTx]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: (name === 'ticker' ? value.toUpperCase() : value) }));
  };

  const handlePriceChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (!isNaN(rawValue) || rawValue === '' || rawValue === '.') {
      setFormData(prev => ({ ...prev, price: rawValue }));
    }
  };

  const handleQtyChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (!isNaN(rawValue) || rawValue === '') {
      setFormData(prev => ({ ...prev, qty: rawValue }));
    }
  };

  const isDivStock = formData.type === 'DIV_STOCK';

  const autoFee = () => {
    if (isDivStock || isCashFlow) return 0;
    const qtyValue = parseFloat(formData.qty.toString().replace(/,/g, '')) || 0;
    const priceValue = parseFloat(formData.price.toString().replace(/,/g, '')) || 0;
    const rate = BROKERS[formData.broker] || 0.0015;
    return Math.round(qtyValue * priceValue * rate * 1000); 
  };

  const autoTax = () => {
    if (formData.type === 'SELL') {
      const qtyValue = parseFloat(formData.qty.toString().replace(/,/g, '')) || 0;
      const priceValue = parseFloat(formData.price.toString().replace(/,/g, '')) || 0;
      return Math.round(qtyValue * priceValue * 1000 * 0.001); 
    }
    return 0; 
  };

  const formatNum = (val) => new Intl.NumberFormat('en-US').format(Math.round(val));
  const formatInput = (val) => {
    if (val === '' || val === undefined || val === null) return '';
    const parts = val.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join('.');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isCashFlow && !formData.ticker) return;
    if (!isCashFlow && !formData.qty) return;
    if (!isDivStock && !formData.price) return;
    
    const finalTx = {
      ...formData,
      qty: isCashFlow ? 1 : parseFloat(formData.qty.toString().replace(/,/g, '')),
      price: isDivStock ? 0 : parseFloat(formData.price.toString().replace(/,/g, '')) * 1000, 
      fee: autoFee(),
      tax: autoTax(),
      id: editingTx ? editingTx.id : Date.now(),
      createdAt: (editingTx && editingTx.createdAt) ? editingTx.createdAt : new Date().toISOString()
    };

    if (editingTx) {
      onUpdate(finalTx);
    } else {
      onAdd(finalTx);
    }
    
    setFormData(prev => ({
      ...prev,
      ticker: '',
      qty: '',
      price: '',
    }));
  };

  return (
    <div className="card">
      <div className="section-header">{editingTx ? 'EDIT TRANSACTION' : 'ADD TRANSACTION'}</div>
      <form onSubmit={handleSubmit}>
        {/* ROW 1: Meta settings */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
                <label>Date</label>
                <input type="date" name="tradeDate" value={formData.tradeDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Portfolio</label>
                <select name="portfolio" value={formData.portfolio} onChange={handleChange}>
                    <option value="Tự doanh">Tự doanh</option>
                    <option value="QTN">QTN</option>
                    <option value="QNV">QNV</option>
                </select>
            </div>
            <div className="form-group">
                <label>Type</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                    <option value="DEPOSIT">DEPOSIT</option>
                    <option value="WITHDRAW">WITHDRAW</option>
                    <option value="DIV_CASH">DIV_CASH</option>
                    <option value="DIV_STOCK">DIV_STOCK</option>
                </select>
            </div>
            <div className="form-group">
                <label>Broker</label>
                <select name="broker" value={formData.broker} onChange={handleChange}>
                    {Object.keys(BROKERS).map(b => <option key={b} value={b}>{b}</option>)}
                </select>
            </div>
        </div>

        {/* ROW 2: Values & Action */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
            <div className="form-group">
                <label>Ticker</label>
                <input 
                  type="text" 
                  name="ticker" 
                  value={formData.ticker} 
                  onChange={handleChange} 
                  placeholder={isCashFlow ? "Optional" : "e.g. VNM"} 
                  required={!isCashFlow} 
                />
            </div>
            <div className="form-group">
                <label>{isCashFlow ? 'Quantity (Fixed 1)' : 'Quantity (Shares)'}</label>
                <input 
                    type="text" 
                    name="qty" 
                    value={isCashFlow ? '1' : formatInput(formData.qty)} 
                    onChange={handleQtyChange} 
                    placeholder="e.g. 1,000"
                    required={!isCashFlow}
                    disabled={isCashFlow}
                />
            </div>
            <div className="form-group">
                <label>{isCashFlow ? 'Amount (x1,000)' : (formData.type === 'DIV_CASH' ? 'Div (x1,000)' : 'Price (x1,000)')}</label>
                <input 
                    type="text" 
                    name="price" 
                    value={isDivStock ? '0' : formatInput(formData.price)} 
                    onChange={handlePriceChange} 
                    required={!isDivStock}
                    disabled={isDivStock}
                />
            </div>
            <div className="form-group">
                <label>Fee ({((BROKERS[formData.broker] || 0) * 100).toFixed(2)}%)</label>
                <input 
                  type="text" 
                  className="mono" 
                  value={formatNum(autoFee())} 
                  disabled 
                  style={{ background: '#f5f5f5', border: '1px solid #ddd' }}
                />
            </div>
            <div className="form-group">
                <label>Tax (0.1%)</label>
                <input 
                  type="text" 
                  className="mono" 
                  value={formatNum(autoTax())} 
                  disabled 
                  style={{ background: '#f5f5f5', border: '1px solid #ddd' }}
                />
            </div>
            <div className="form-group">
                <button type="submit" className="btn-primary" style={{ minWidth: '100px', padding: '0.6rem' }}>
                    {editingTx ? 'UPDATE' : 'ADD'}
                </button>
            </div>
        </div>
        
        {editingTx && (
            <button type="button" className="btn-toggle" style={{ marginTop: '0.5rem' }} onClick={onCancelEdit}>
                CANCEL EDIT
            </button>
        )}
      </form>
    </div>
  );
};

export default TransactionForm;
