import React from 'react';
import PostCard from './PostCard';

const Feed = ({ posts }) => {
  const [activeCategory, setActiveCategory] = React.useState('Tất cả');

  const categories = ['Tất cả', 'HọcHômNay', 'TiếnTrình', 'TưVấn', 'TựDo'];

  const filteredPosts = activeCategory === 'Tất cả' 
    ? posts 
    : posts.filter(post => post.tags.includes(activeCategory));

  return (
    <main className="container feed-container">
      {/* Category Filter */}
      <div className="filter-bar-wrapper glass sticky-filter">
        <div className="filter-bar">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`filter-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'Tất cả' ? cat : `#${cat}`}
            </button>
          ))}
        </div>
      </div>

      <div className="posts-list">
        {filteredPosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
        {filteredPosts.length === 0 && (
          <div className="empty-state">Không có bài viết nào trong danh mục này.</div>
        )}
      </div>

      <style jsx>{`
        .feed-container {
          padding-top: 12px;
          padding-bottom: 100px;
        }
        .sticky-filter {
          position: sticky;
          top: 60px; /* Below Navbar */
          z-index: 900;
          margin-bottom: 16px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border);
        }
        .filter-bar {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 0 16px;
          scrollbar-width: none; 
          -ms-overflow-style: none;
        }
        .filter-bar::-webkit-scrollbar {
          display: none;
        }
        .filter-tab {
          padding: 8px 16px;
          border-radius: 20px;
          background: #f1f5f9;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-muted);
          white-space: nowrap;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .filter-tab.active {
          background: #FF6B6B; /* Coral Pink */
          color: white;
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
          transform: translateY(-1px);
        }
        .posts-list {
          padding-top: 4px;
        }
        .empty-state {
          text-align: center;
          padding: 40px;
          color: var(--text-muted);
          font-style: italic;
        }
        @media (max-width: 600px) {
          .sticky-filter {
            top: 56px;
          }
        }
      `}</style>
    </main>
  );
};

export default Feed;
