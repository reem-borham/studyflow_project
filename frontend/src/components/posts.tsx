import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { apiUrl } from "../config";

interface CardProps {
  id?: number;
  title?: string;
  content: string;
  username: string;
  stats?: {
    votes?: number;
    answers?: number;
    views?: number;
  };
}

const Card = ({ id, title, content, username, stats }: CardProps) => {
  const navigate = useNavigate();
  const [votes, setVotes] = useState(stats?.votes || 0);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleVote = (e: React.MouseEvent, voteType: 'up' | 'down') => {
    e.stopPropagation(); // Prevent card click navigation

    if (userVote === voteType) {
      // Remove vote
      setUserVote(null);
      setVotes(votes + (voteType === 'up' ? -1 : 1));
    } else if (userVote) {
      // Change vote
      setUserVote(voteType);
      setVotes(votes + (voteType === 'up' ? 2 : -2));
    } else {
      // New vote
      setUserVote(voteType);
      setVotes(votes + (voteType === 'up' ? 1 : -1));
    }
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCommentModal(true);
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim() || !id) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to comment');
        return;
      }

      // Backend expects POST to /api/comments/ with content_type and object_id
      const response = await fetch(apiUrl("api/comments/"), {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: commentText,
          content_type: 'question',
          object_id: id
        })
      });

      if (response.ok) {
        alert('Comment posted successfully!');
        setCommentText('');
        setShowCommentModal(false);
        if (id) navigate(`/question/${id}`);
      } else {
        const error = await response.json();
        console.error('Comment error:', error);
        alert(`Failed to post comment: ${error.detail || error.content || JSON.stringify(error)}`);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('Failed to post comment. Please check your connection and try again.');
    }
  };

  const handleCardClick = () => {
    if (id) navigate(`/question/${id}`);
  };

  return (
    <StyledWrapper>
      <div className="card" onClick={handleCardClick}>
        <div className="card-content">
          {title && <h4 className="title">{title}</h4>}
          <p className="text">{content.length > 150 ? content.substring(0, 150) + '...' : content}</p>

          <div className="meta">
            <span className="username">@{username}</span>
          </div>

          <div className="footer">
            <div className="stats-container">
              <div className="vote-buttons">
                <button
                  className={`vote-btn ${userVote === 'up' ? 'active-up' : ''}`}
                  onClick={(e) => handleVote(e, 'up')}
                  title="Upvote"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7m0 0l7 7" /></svg>
                </button>
                <span className="vote-count">{votes}</span>
                <button
                  className={`vote-btn ${userVote === 'down' ? 'active-down' : ''}`}
                  onClick={(e) => handleVote(e, 'down')}
                  title="Downvote"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7m0 0l-7-7" /></svg>
                </button>
              </div>

              <button
                className="stat-item clickable-stat"
                onClick={handleCommentClick}
                title="Add comment"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                {stats?.answers !== undefined ? stats.answers : 0}
              </button>
              {stats?.views !== undefined && (
                <div title="Views" className="stat-item non-clickable">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  {stats.views}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="modal-overlay" onClick={() => setShowCommentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Add Comment</h3>
            <textarea
              className="modal-textarea"
              placeholder="Write your comment here..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={4}
            />
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowCommentModal(false)}>
                Cancel
              </button>
              <button className="submit-btn" onClick={handleCommentSubmit}>
                Post Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .card {
    position: relative;
    background: rgba(48, 52, 76, 0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    padding: 1.5em;
    z-index: 5;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    border-radius: 16px;
    width: 300px;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
    cursor: pointer;
  }

  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    border-color: rgba(108, 92, 231, 0.5);
  }
  
  .title {
    color: #fff;
    font-size: 1.25em;
    font-weight: 700;
    margin: 0 0 10px 0;
    line-height: 1.3;
  }

  .meta {
    margin-top: 10px;
  }

  .username {
    color: #a29bfe;
    font-size: 0.85em;
    font-weight: 600;
    margin-right: 15px;
  }

  .text {
    margin: 0;
    color: #c0c3d7;
    font-weight: 400;
    line-height: 1.5;
    font-size: 0.95em;
  }

  .footer {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid rgba(255,255,255,0.05);
  }

  .stats-container {
    display: flex;
    gap: 20px;
    align-items: center;
  }

  .vote-buttons {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.03);
    padding: 6px 10px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .vote-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    border-radius: 4px;
  }

  .vote-btn svg {
    width: 16px;
    height: 16px;
    stroke: #8f94a8;
    transition: stroke 0.2s ease;
  }

  .vote-btn:hover svg {
    stroke: #e0e6ed;
  }

  .vote-btn.active-up {
    background: rgba(34, 197, 94, 0.2);
  }

  .vote-btn.active-up svg {
    stroke: #22c55e;
  }

  .vote-btn.active-down {
    background: rgba(239, 68, 68, 0.2);
  }

  .vote-btn.active-down svg {
    stroke: #ef4444;
  }

  .vote-count {
    min-width: 24px;
    text-align: center;
    font-weight: 600;
    color: #e0e6ed;
    font-size: 0.9em;
  }

  .stat-item {
    display: flex;
    align-items: center;
    color: #8f94a8;
    font-size: 0.85em;
    font-weight: 500;
    transition: color 0.2s;
    background: none;
    border: none;
    cursor: default;
    padding: 0;
    gap: 6px;
  }

  .stat-item.clickable-stat {
    cursor: pointer;
    padding: 6px 10px;
    border-radius: 12px;
    transition: all 0.2s ease;
  }

  .stat-item.clickable-stat:hover {
    color: #e0e6ed;
    background: rgba(108, 92, 231, 0.2);
  }

  .stat-item.non-clickable {
    cursor: default;
    opacity: 0.7;
  }
  
  .stat-item:hover {
    color: #e0e6ed;
  }

  .stat-item svg {
    margin-right: 6px;
    height: 16px;
    width: 16px;
    stroke: currentColor;
  }

  /* Comment Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(4px);
  }

  .modal-content {
    background: linear-gradient(135deg, rgba(43, 46, 66, 0.95) 0%, rgba(48, 52, 76, 0.95) 100%);
    padding: 32px;
    border-radius: 20px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(139, 92, 246, 0.3);
  }

  .modal-content h3 {
    color: #fff;
    margin: 0 0 20px 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .modal-textarea {
    width: 100%;
    min-height: 120px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 12px;
    padding: 12px;
    color: #fff;
    font-family: inherit;
    font-size: 1rem;
    resize: vertical;
    margin-bottom: 20px;
    box-sizing: border-box;
  }

  .modal-textarea:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  .cancel-btn {
    background: transparent;
    color: rgba(255, 255, 255, 0.6);
    padding: 10px 20px;
    border-radius: 10px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .cancel-btn:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.1);
  }

  .submit-btn {
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    color: white;
    padding: 10px 24px;
    border-radius: 10px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
    transition: all 0.2s;
  }

  .submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
  }
`;

export default Card;
