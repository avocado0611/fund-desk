import React from 'react';

const Header = ({ onLogout }) => {
  return (
    <header className="header" style={{ 
        backgroundColor: '#FFFFFF', 
        borderBottom: '3px solid var(--color-primary)', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        color: 'var(--color-primary)' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <img src="/sgi-logo.png" alt="SGI Logo" style={{ height: '40px' }} />
        <div style={{ width: '1px', height: '24px', background: '#ddd', margin: '0 0.5rem' }}></div>
        <span style={{ fontWeight: 'bold', fontSize: '1.4rem', letterSpacing: '2px', color: '#1D4477' }}>FUND-DESK</span>
      </div>
      
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <img src="/sgi-logo.png" alt="SGI Branding" style={{ height: '28px', opacity: 0.6 }} />
        {onLogout && (
            <button 
                onClick={onLogout}
                style={{ 
                    background: 'white', 
                    color: 'var(--color-primary)', 
                    border: '1px solid var(--color-primary)', 
                    padding: '6px 16px', 
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.target.style.background = 'var(--color-primary)'; e.target.style.color = 'white'; }}
                onMouseOut={(e) => { e.target.style.background = 'white'; e.target.style.color = 'var(--color-primary)'; }}
            >
                LOG OUT / CHANGE CODE
            </button>
        )}
      </div>
    </header>
  );
};

export default Header;
