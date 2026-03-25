import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Feed from './components/Feed';
import Profile from './components/Profile';
import PostModal from './components/PostModal';
import { samplePosts as initialPosts } from './data/samplePosts';
import { Home, User, PlusCircle } from 'lucide-react';

function App() {
  const [posts, setPosts] = useState(initialPosts);
  const [activeView, setActiveView] = useState('home'); // 'home' or 'profile'
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddPost = (newPost) => {
    const postToAdd = {
      ...newPost,
      id: posts.length + 1,
      author: "Me (Builder)",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Me",
      time: "Vừa xong",
      likes: 0,
      comments: 0,
      isMe: true
    };
    setPosts([postToAdd, ...posts]);
    setIsModalOpen(false);
    setActiveView('home');
  };

  return (
    <div className="App">
      <Navbar onAddClick={() => setIsModalOpen(true)} />
      
      {activeView === 'home' ? (
        <Feed posts={posts} />
      ) : (
        <Profile posts={posts.filter(p => p.isMe)} />
      )}

      {isModalOpen && (
        <PostModal 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleAddPost} 
        />
      )}
      
      {/* Bottom Nav */}
      <div className="bottom-nav glass">
        <div className="nav-items">
          <button 
            className={`nav-item ${activeView === 'home' ? 'active' : ''}`}
            onClick={() => setActiveView('home')}
          >
            <Home size={24} />
            <span>Trang chủ</span>
          </button>
          <button 
            className="nav-item plus-item"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircle size={32} color="#FF6B6B" />
          </button>
          <button 
            className={`nav-item ${activeView === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveView('profile')}
          >
            <User size={24} />
            <span>Cá nhân</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-top: 1px solid var(--border);
          padding-bottom: env(safe-area-inset-bottom);
          z-index: 1000;
        }
        .nav-items {
          display: flex;
          justify-content: space-around;
          align-items: center;
          width: 100%;
          max-width: 500px;
        }
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 500;
        }
        .nav-item.active {
          color: var(--primary);
        }
        .plus-item {
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  );
}

export default App;
