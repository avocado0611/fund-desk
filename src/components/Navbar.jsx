import React from 'react';
import { Plus, Bell } from 'lucide-react';

const Navbar = ({ onAddClick }) => {
  return (
    <nav className="glass sticky-top">
      <div className="navbar-content">
        <h1 className="logo">Vibe<span>Feed</span></h1>
        <div className="nav-actions">
          <button className="icon-btn">
            <Bell size={22} />
          </button>
          <button className="post-btn" onClick={onAddClick}>
            <Plus size={24} />
          </button>
        </div>
      </div>
      <style jsx>{`
        .sticky-top {
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 8px 0;
          border-bottom: 1px solid var(--border);
        }
        .navbar-content {
          max-width: 500px;
          margin: 0 auto;
          padding: 8px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.5px;
          color: var(--text-main);
        }
        .logo span {
          color: var(--primary);
        }
        .nav-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .icon-btn {
          color: var(--text-muted);
          padding: 4px;
        }
        .post-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
        }
        .post-btn:hover {
          background: var(--primary-hover);
          transform: translateY(-2px);
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
