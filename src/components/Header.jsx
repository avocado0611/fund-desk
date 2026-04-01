import React from 'react';

const Header = ({ onLogout }) => {
  return (
    <header className="header" style={{ borderBottom: '2px solid var(--color-red)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <img src="/sgi-logo.png" alt="SGI Logo" style={{ height: '24px', filter: 'brightness(0) invert(1)' }} />
        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '1px' }}>FUND-DESK</span>
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: 'normal' }}>ACCOUNTING SYSTEM v2.0</span>
        {onLogout && (
            <button 
                onClick={onLogout}
                style={{ 
                    background: 'rgba(255,255,255,0.1)', 
                    color: 'white', 
                    border: '1px solid rgba(255,255,255,0.3)', 
                    padding: '4px 12px', 
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                }}
            >
                LOG OUT / CHANGE CODE
            </button>
        )}
      </div>
    </header>
  );
};

export default Header;
