import styled from 'styled-components';

interface CardProps {
  title?: string;
  content: string;
  username: string;
  stats?: {
    votes?: number;
    answers?: number;
    views?: number;
  };
}

const Card = ({ title, content, username, stats }: CardProps) => {
  return (
    <StyledWrapper>
      <div className="card">
        <div className="card-content">
          {title && <h4 className="title">{title}</h4>}
          <p className="text">{content.length > 150 ? content.substring(0, 150) + '...' : content}</p>

          <div className="meta">
            <span className="username">@{username}</span>
          </div>

          <div className="footer">
            <div className="stats-container">
              {stats?.votes !== undefined && (
                <div title="Votes" className="stat-item">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                  {stats.votes}
                </div>
              )}
              {stats?.answers !== undefined && (
                <div title="Answers" className="stat-item">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                  {stats.answers}
                </div>
              )}
              {stats?.views !== undefined && (
                <div title="Views" className="stat-item">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  {stats.views}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
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
  }

  .stat-item {
    display: flex;
    align-items: center;
    color: #8f94a8;
    font-size: 0.85em;
    font-weight: 500;
    transition: color 0.2s;
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
`;

export default Card;
