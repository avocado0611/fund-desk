import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

const PostCard = ({ post }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
  };

  return (
    <div className="post-card">
      {/* Header */}
      <div className="post-header">
        <div className="author-info">
          <img src={post.avatar} alt={post.author} className="avatar" />
          <div className="details">
            <span className="name">{post.author}</span>
            <span className="time">{post.time}</span>
          </div>
        </div>
        <button className="more-btn">
          <MoreHorizontal size={20} color="var(--text-muted)" />
        </button>
      </div>

      {/* Content */}
      <div className="post-content">
        <p className="text">{post.content}</p>
        <div className="tags">
          {post.tags.map((tag, idx) => (
            <span key={idx} className="tag">#{tag}</span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="post-actions">
        <div className="left-actions">
          <button 
            className={`action-btn like-btn ${liked ? 'liked' : ''}`} 
            onClick={handleLike}
          >
            <div className={`icon-wrapper ${liked ? 'animate' : ''}`}>
              <Heart 
                size={22} 
                fill={liked ? "#FF0000" : "none"} 
                stroke={liked ? "#FF0000" : "currentColor"} 
              />
            </div>
            <span className={liked ? 'count-highlight' : ''}>{likesCount}</span>
          </button>
          <button className="action-btn">
            <MessageCircle size={22} />
            <span>{post.comments}</span>
          </button>
        </div>
        <button className="action-btn">
          <Share2 size={20} />
        </button>
      </div>

      <style jsx>{`
        .post-card {
          background: var(--card-bg);
          border-radius: var(--radius);
          padding: 16px;
          margin-bottom: 20px;
          border: 1px solid var(--border);
          transition: transform 0.2s ease;
        }
        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .author-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--primary);
          padding: 2px;
        }
        .details {
          display: flex;
          flex-direction: column;
        }
        .name {
          font-weight: 600;
          font-size: 0.95rem;
        }
        .time {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .post-content {
          margin-bottom: 16px;
        }
        .text {
          font-size: 1rem;
          color: var(--text-main);
          white-space: pre-line;
          margin-bottom: 8px;
        }
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .tag {
          font-size: 0.85rem;
          color: var(--primary);
          font-weight: 500;
        }
        .post-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 12px;
          border-top: 1px solid #f3f4f6;
        }
        .left-actions {
          display: flex;
          gap: 16px;
        }
        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 500;
        }
        
        .icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }

        .icon-wrapper.animate {
          animation: heart-pulse 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes heart-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.4); }
          100% { transform: scale(1); }
        }

        .like-btn.liked {
          color: #FF0000;
        }
        
        .count-highlight {
          font-weight: 600;
        }

        @media (max-width: 600px) {
          .post-card {
            border-radius: 0;
            border-left: none;
            border-right: none;
            margin-bottom: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default PostCard;
