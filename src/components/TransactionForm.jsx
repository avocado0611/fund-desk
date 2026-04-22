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

const CORPORATE_ACTIONS = ['DIV_CASH', 'DIV_STOCK', 'BONUS_STOCK', 'RIGHT_ISSUE', 'STOCK_SPLIT', 'REVERSE_SPLIT'];

const TransactionForm = ({ onAdd, onUpdate, editingTx, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    tradeDate: new Date().toISOString().split('T')[0],
    type: 'BUY',
    ticker: '',
    qty: '',
    price: '',
    total: '',
    settlementDate: '',
    broker: 'SSI',
    portfolio: 'Tự doanh'
  });

  const isCashFlow = formData.type === 'DEPOSIT' || formData.type === 'WITHDRAW';
  const isCorpAction = CORPORATE_ACTIONS.includes(formData.type);
  const isStockDiv = formData.type === 'DIV_STOCK' || formData.type === 'BONUS_STOCK';
  const isRightIssue = formData.type === 'RIGHT_ISSUE';

  useEffect(() => {
    if (editingTx) {
      setFormData({
        ...editingTx,
        qty: editingTx.qty.toString(),
        price: editingTx.price.toString(),
        total: (editingTx.qty * editingTx.price).toString(),
      });
    } else {
        setFormData(prev => ({
            ...prev,
            ticker: '',
            qty: '',
            price: '',
            total: '',
            settlementDate: ''
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
      const price = rawValue;
      const qty = parseFloat(formData.qty.toString().replace(/,/g, '')) || 0;
      const total = (price && qty) ? Math.round(parseFloat(price) * qty).toString() : formData.total;
      setFormData(prev => ({ ...prev, price, total }));
    }
  };

  const handleTotalChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (!isNaN(rawValue) || rawValue === '' || rawValue === '.') {
      const total = rawValue;
      const qty = parseFloat(formData.qty.toString().replace(/,/g, '')) || 0;
      const price = (total && qty && qty !== 0) ? Math.round(parseFloat(total) / qty).toString() : formData.price;
      setFormData(prev => ({ ...prev, total, price }));
    }
  };

  const handleQtyChange = (e) => {
    const rawValue = e.target.value.replace(/,/g, '');
    if (!isNaN(rawValue) || rawValue === '') {
      const qty = rawValue;
      const priceVal = parseFloat(formData.price.toString().replace(/,/g, '')) || 0;
      const totalVal = parseFloat(formData.total.toString().replace(/,/g, '')) || 0;
      
      let newTotal = formData.total;
      let newPrice = formData.price;

      if (qty && priceVal) {
        newTotal = Math.round(parseFloat(qty) * priceVal).toString();
      } else if (qty && totalVal) {
        newPrice = Math.round(totalVal / parseFloat(qty)).toString();
      }

      setFormData(prev => ({ ...prev, qty, total: newTotal, price: newPrice }));
    }
  };

  const isDivStock = formData.type === 'DIV_STOCK';

  const autoFee = () => {
    if (isDivStock || isCashFlow) return 0;
    const qtyValue = parseFloat(formData.qty.toString().replace(/,/g, '')) || 0;
    const priceValue = parseFloat(formData.price.toString().replace(/,/g, '')) || 0;
    const rate = BROKERS[formData.broker] || 0.0015;
    return Math.round(qtyValue * priceValue * rate); 
  };

  const autoTax = () => {
    const qtyValue = parseFloat(formData.qty.toString().replace(/,/g, '')) || 0;
    const priceValue = parseFloat(formData.price.toString().replace(/,/g, '')) || 0;

    if (formData.type === 'SELL') {
      return Math.round(qtyValue * priceValue * 0.001); 
    }
    if (formData.type === 'DIV_CASH') {
      return Math.round(qtyValue * priceValue * 0.05);
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
      qty: (isCashFlow || isCorpAction) ? 0 : parseFloat(formData.qty.toString().replace(/,/g, '')),
      price: isStockDiv ? 0 : parseFloat(formData.price.toString().replace(/,/g, '')),
      ratio: isCorpAction ? (parseFloat(formData.price.toString().replace(/,/g, '')) / 100) : undefined,
      fee: autoFee(),
      tax: autoTax(),
      id: editingTx ? editingTx.id : Date.now(),
      createdAt: (editingTx && editingTx.createdAt) ? editingTx.createdAt : new Date().toISOString()
    };

    if (formData.type === 'DIV_CASH') {
      finalTx.price = 10000 * (parseFloat(formData.price) / 100);
      finalTx.qty = 0;
    } else if (isRightIssue) {
        finalTx.price = parseFloat(formData.qty.toString().replace(/,/g, '')); // Pa
        finalTx.qty = 0;
    }

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
      total: ''
    }));
  };

  return (
    <div className="card">
      <div className="section-header">{editingTx ? 'EDIT TRANSACTION' : 'ADD TRANSACTION'}</div>
      <form onSubmit={handleSubmit}>
        {/* ROW 1: Meta settings */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
                <label>{isCorpAction ? 'Ex-date' : 'Date'}</label>
                <input type="date" name="tradeDate" value={formData.tradeDate} onChange={handleChange} required />
            </div>
            {isCorpAction && (
                <div className="form-group">
                    <label>Settlement Date</label>
                    <input type="date" name="settlementDate" value={formData.settlementDate} onChange={handleChange} required />
                </div>
            )}
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
                    <option value="BUY">Buy</option>
                    <option value="SELL">Sell</option>
                    <option value="DEPOSIT">Deposit</option>
                    <option value="WITHDRAW">Withdraw</option>
                    <option value="DIV_CASH">Div Cash</option>
                    <option value="DIV_STOCK">Div Stock</option>
                    <option value="BONUS_STOCK">Bonus Stock</option>
                    <option value="RIGHT_ISSUE">Right Issue</option>
                    <option value="STOCK_SPLIT">Stock Split</option>
                    <option value="REVERSE_SPLIT">Reverse Split</option>
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
                <label>
                    {isRightIssue ? 'Issue Price (Pa)' : 
                    (isCorpAction ? 'Auto (Ratio-based)' : 
                    (isCashFlow ? 'Quantity (Fixed 1)' : 'Quantity (Shares)'))}
                </label>
                <input 
                    type="text" 
                    name="qty" 
                    value={isCashFlow ? '1' : (isStockDiv || formData.type === 'DIV_CASH' ? 'Auto' : formatInput(formData.qty))} 
                    onChange={handleQtyChange} 
                    placeholder={isRightIssue ? "e.g. 10,000" : "e.g. 1,000"}
                    required={!isCashFlow && !isStockDiv && formData.type !== 'DIV_CASH'}
                    disabled={isCashFlow || isStockDiv || formData.type === 'DIV_CASH'}
                />
            </div>
            <div className="form-group">
                <label>
                    {formData.type === 'DIV_CASH' ? 'Div (%)' : 
                    (isCorpAction ? 'Ratio (%)' : 
                    (isCashFlow ? 'Amount (VNĐ)' : 'Price (VNĐ)'))}
                </label>
                <input 
                    type="text" 
                    name="price" 
                    value={isDivStock ? '0' : formatInput(formData.price)} 
                    onChange={handlePriceChange} 
                    required={!isDivStock}
                    disabled={isDivStock && !isCorpAction}
                />
            </div>
            <div className="form-group">
                <label>Total Value (VNĐ)</label>
                <input 
                    type="text" 
                    name="total" 
                    value={isDivStock ? '0' : formatInput(formData.total)} 
                    onChange={handleTotalChange} 
                    placeholder="Auto or Manual"
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
                <label>Tax {(formData.type === 'DIV_CASH' || formData.type === 'DIV_STOCK' || formData.type === 'BONUS_STOCK') ? '(5%)' : '(0.1%)'}</label>
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
