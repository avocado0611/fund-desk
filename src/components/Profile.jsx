import React from 'react';
import PostCard from './PostCard';

const Profile = ({ posts }) => {
  const stats = {
    posts: posts.length,
    likes: posts.reduce((acc, p) => acc + p.likes, 0),
    followers: 128
  };

  return (
    <div className="container profile-container">
      {/* Profile Header */}
      <div className="profile-header glass">
        <div className="profile-main">
          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Me" alt="Me" className="profile-avatar" />
          <div className="profile-info">
            <h2 className="profile-name">Me (Builder)</h2>
            <p className="profile-bio">Đam mê VibeCoding và đang xây dựng cộng đồng WIV rực rỡ! ✨</p>
          </div>
        </div>
        
        <div className="profile-stats">
          <div className="stat-item">
            <span className="stat-value">{stats.posts}</span>
            <span className="stat-label">Bài viết</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.likes}</span>
            <span className="stat-label">Lượt thích</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.followers}</span>
            <span className="stat-label">Người theo dõi</span>
          </div>
        </div>
      </div>

      {/* My Posts Section */}
      <div className="my-posts">
        <h3 className="section-title">Bài viết của tôi</h3>
        {posts.length > 0 ? (
          posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="empty-state">Bạn chưa có bài viết nào. Hãy bắt đầu chia sẻ nhé!</div>
        )}
      </div>

      <style jsx>{`
        .profile-container {
          padding-top: 20px;
          padding-bottom: 100px;
        }
        .profile-header {
          padding: 24px;
          border-radius: 20px;
          margin-bottom: 24px;
          border: 1px solid var(--border);
        }
        .profile-main {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
        }
        .profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 3px solid var(--primary);
          padding: 3px;
        }
        .profile-name {
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .profile-bio {
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .profile-stats {
          display: flex;
          justify-content: space-around;
          padding-top: 20px;
          border-top: 1px solid var(--border);
        }
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .stat-value {
          font-weight: 700;
          font-size: 1.1rem;
        }
        .stat-label {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .section-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 16px;
          padding-left: 4px;
        }
        .empty-state {
          text-align: center;
          padding: 40px;
          color: var(--text-muted);
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default Profile;
