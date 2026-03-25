import React, { useState } from 'react';
import { X } from 'lucide-react';

const PostModal = ({ onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('HọcHômNay');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit({ content, tags: [category] });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass">
        <div className="modal-header">
          <h2>Viết bài mới</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tiêu đề</label>
            <input 
              type="text" 
              placeholder="Nhập tiêu đề (tùy chọn)..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Nội dung</label>
            <textarea 
              placeholder="Bạn đang nghĩ gì?" 
              maxLength={300}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            ></textarea>
            <div className="char-count">{content.length}/300</div>
          </div>

          <div className="form-group">
            <label>Danh mục</label>
            <div className="radio-group">
              {['HọcHômNay', 'TiếnTrình', 'TưVấn', 'TựDo'].map(cat => (
                <label key={cat} className="radio-label">
                  <input 
                    type="radio" 
                    name="category" 
                    value={cat}
                    checked={category === cat}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                  <span>#{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="submit-btn">Đăng bài</button>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: flex-end; /* Mobile style: slide from bottom */
          justify-content: center;
          z-index: 2000;
          backdrop-filter: blur(4px);
        }
        .modal-content {
          background: white;
          width: 100%;
          max-width: 500px;
          border-radius: 20px 20px 0 0;
          padding: 24px;
          animation: slide-up 0.3s ease-out;
        }
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .modal-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 0.9rem;
        }
        input, textarea {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid var(--border);
          font-family: inherit;
          background: #f9fafb;
        }
        textarea {
          height: 120px;
          resize: none;
        }
        .char-count {
          text-align: right;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 4px;
        }
        .radio-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .radio-label {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          border: 1px solid var(--border);
          border-radius: 10px;
          cursor: pointer;
        }
        .radio-label:has(input:checked) {
          border-color: #FF6B6B;
          background: #fff5f5;
        }
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: #FF6B6B; /* Coral Pink */
          color: white;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          margin-top: 10px;
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
        }
      `}</style>
    </div>
  );
};

export default PostModal;
