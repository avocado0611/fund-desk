import React, { useState } from 'react';
import { getPortfolioByCode, createPortfolio } from '../logic/supabase';

const AccessGuard = ({ onAccess }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    const savedCode = localStorage.getItem('sgi_access_code');
    if (savedCode) {
      autoLogin(savedCode);
    }
  }, []);

  const autoLogin = async (savedCode) => {
    setLoading(true);
    try {
      const data = await getPortfolioByCode(savedCode);
      if (data) onAccess(data);
    } catch (err) {
      console.error("Auto-login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnter = async (e) => {
    e.preventDefault();
    if (!code) return;
    setLoading(true);
    setError('');

    try {
      const data = await getPortfolioByCode(code);
      if (data) {
        localStorage.setItem('sgi_access_code', code);
        onAccess(data);
      } else {
        if (window.confirm('Mã truy cập mới? Hệ thống sẽ tạo một quỹ mới cho mã này.')) {
          const newData = await createPortfolio(code);
          if (newData) {
            localStorage.setItem('sgi_access_code', code);
            onAccess(newData);
          }
        }
      }
    } catch (err) {
      setError('Lỗi kết nối database. Hãy kiểm tra Anon Key và Internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F5F5F5'
    }}>
      <div className="card" style={{ width: '400px', textAlign: 'center', padding: '3rem', borderTop: '4px solid var(--color-primary)' }}>
        <h1 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '4px' }}>FUND-DESK</h1>
        <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.85rem', letterSpacing: '1px' }}>ACCOUNTING ACCESS CONTROL</p>
        <p style={{ color: '#888', marginBottom: '2rem', fontSize: '0.75rem', fontStyle: 'italic' }}>
          If you are a public user, please enter the code "123456"
        </p>

        <form onSubmit={handleEnter}>
          <div className="form-group">
            <label style={{ textAlign: 'center', fontSize: '0.75rem', color: '#999', marginBottom: '0.5rem' }}>ENTER YOUR SECRET CODE</label>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="••••••••"
              style={{
                textAlign: 'center',
                fontSize: '1.5rem',
                letterSpacing: '0.5rem',
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: '1.5rem', padding: '1.2rem', borderRadius: '8px', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? 'AUTHENTICATING...' : 'LOGIN TO FUND'}
          </button>
        </form>
        {error && <p style={{ color: 'red', marginTop: '1.5rem', fontSize: '0.8rem', background: '#FFEBEE', padding: '0.5rem', borderRadius: '4px' }}>{error}</p>}

        <div style={{ marginTop: '2rem', fontSize: '0.7rem', color: '#AAA' }}>
          &copy; 2026 FUND-DESK. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default AccessGuard;
