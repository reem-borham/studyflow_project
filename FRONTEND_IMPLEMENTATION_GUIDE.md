# 🎨 FRONTEND IMPLEMENTATION GUIDE

## ✅ What's Already Implemented:

1. **✅ Role Selection in Signup** - Already in `Form.tsx` (lines 114-125)
2. **✅ Logout Button** - Added to `navbar.tsx`
3. **✅ API Services** - Complete API layer in `services/api.ts`

## 📋 Remaining Components to Implement:

### 1. **Voting Component** (`components/VoteButtons.tsx`)

```tsx
import { useState, useEffect } from 'react';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { votingAPI } from '../services/api';

interface VoteButtonsProps {
  contentType: 'question' | 'answer';
  objectId: number;
  initialUpvotes: number;
  initialDownvotes: number;
}

const VoteButtons: React.FC<VoteButtonsProps> = ({ 
  contentType, 
  objectId, 
  initialUpvotes, 
  initialDownvotes 
}) => {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);

  const handleVote = async (voteType: 'up' | 'down') => {
    try {
      const response = await votingAPI.vote(voteType, contentType, objectId);
      
      if (response.action === 'created') {
        setUserVote(voteType);
        if (voteType === 'up') setUpvotes(prev => prev + 1);
        else setDownvotes(prev => prev + 1);
      } else if (response.action === 'removed') {
        setUserVote(null);
        if (voteType === 'up') setUpvotes(prev => prev - 1);
        else setDownvotes(prev => prev - 1);
      } else if (response.action === 'changed') {
        setUserVote(voteType);
        if (voteType === 'up') {
          setUpvotes(prev => prev + 1);
          setDownvotes(prev => prev - 1);
        } else {
          setDownvotes(prev => prev + 1);
          setUpvotes(prev => prev - 1);
        }
      }
    } catch (error) {
      console.error('Vote error:', error);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
      <button 
        onClick={() => handleVote('up')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '8px 15px',
          background: userVote === 'up' ? '#27ae60' : 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          color: '#fff',
          cursor: 'pointer'
        }}
      >
        <ThumbUpIcon /> {upvotes}
      </button>
      <button 
        onClick={() => handleVote('down')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '8px 15px',
          background: userVote === 'down' ? '#e74c3c' : 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '8px',
          color: '#fff',
          cursor: 'pointer'
        }}
      >
        <ThumbDownIcon /> {downvotes}
      </button>
    </div>
  );
};

export default VoteButtons;
```

### 2. **Comments Component** (`components/Comments.tsx`)

```tsx
import { useState, useEffect } from 'react';
import { commentsAPI } from '../services/api';

interface Comment {
  id: number;
  user: string;
  username: string;
  content: string;
  created_at: string;
  is_edited: boolean;
  replies_count: number;
  parent_comment: number | null;
}

interface CommentsProps {
  contentType: 'question' | 'answer';
  objectId: number;
}

const Comments: React.FC<CommentsProps> = ({ contentType, objectId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  useEffect(() => {
    fetchComments();
  }, [contentType, objectId]);

  const fetchComments = async () => {
    try {
      const data = await commentsAPI.getComments(contentType, objectId);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await commentsAPI.createComment(newComment, contentType, objectId);
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleReply = async (parentId: number, content: string) => {
    try {
      await commentsAPI.createComment(content, contentType, objectId, parentId);
      setReplyingTo(null);
      fetchComments();
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleEdit = async (commentId: number) => {
    try {
      await commentsAPI.updateComment(commentId, editContent);
      setEditingId(null);
      fetchComments();
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await commentsAPI.deleteComment(commentId);
        fetchComments();
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Comments ({comments.length})</h3>
      
      {/* Add new comment */}
      <div style={{ marginBottom: '20px' }}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '10px',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '8px',
            color: '#fff',
            resize: 'vertical'
          }}
        />
        <button 
          onClick={handleAddComment}
          style={{
            marginTop: '10px',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #6c5ce7, #a55eea)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Post Comment
        </button>
      </div>

      {/* Display comments */}
      <div>
        {comments.map((comment) => (
          <div 
            key={comment.id}
            style={{
              padding: '15px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              marginBottom: '10px'
            }}
          >
            {editingId === comment.id ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '60px',
                    padding: '10px',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <button onClick={() => handleEdit(comment.id)}>Save</button>
                <button onClick={() => setEditingId(null)}>Cancel</button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{comment.username}</strong>
                  <span style={{ fontSize: '12px', opacity: 0.7 }}>
                    {new Date(comment.created_at).toLocaleString()}
                    {comment.is_edited && ' (edited)'}
                  </span>
                </div>
                <p>{comment.content}</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button onClick={() => {
                    setEditingId(comment.id);
                    setEditContent(comment.content);
                  }}>Edit</button>
                  <button onClick={() => handleDelete(comment.id)}>Delete</button>
                  <button onClick={() => setReplyingTo(comment.id)}>Reply</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments;
```

### 3. **Best Answer Button** (for Question Detail page)

```tsx
import { bestAnswerAPI } from '../services/api';

interface BestAnswerButtonProps {
  answerId: number;
  isBestAnswer: boolean;
  onMarked: () => void;
}

const BestAnswerButton: React.FC<BestAnswerButtonProps> = ({ 
  answerId, 
  isBestAnswer, 
  onMarked 
}) => {
  const handleMarkBest = async () => {
    try {
      const response = await bestAnswerAPI.markBestAnswer(answerId);
      console.log('Marked by:', response.marked_by);
      onMarked();
    } catch (error) {
      console.error('Error marking best answer:', error);
    }
  };

  if (isBestAnswer) {
    return (
      <div style={{
        padding: '10px',
        background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
        borderRadius: '8px',
        color: '#fff',
        fontWeight: 'bold'
      }}>
        ✓ Best Answer
      </div>
    );
  }

  return (
    <button 
      onClick={handleMarkBest}
      style={{
        padding: '10px 20px',
        background: 'linear-gradient(135deg, #3498db, #2980b9)',
        border: 'none',
        borderRadius: '8px',
        color: '#fff',
        cursor: 'pointer'
      }}
    >
      Mark as Best Answer
    </button>
  );
};

export default BestAnswerButton;
```

### 4. **Answer Edit/Delete Buttons**

```tsx
import { useState } from 'react';
import { answersAPI } from '../services/api';

interface AnswerActionsProps {
  answerId: number;
  initialBody: string;
  isOwner: boolean;
  onUpdate: () => void;
}

const AnswerActions: React.FC<AnswerActionsProps> = ({ 
  answerId, 
  initialBody, 
  is Owner,
  onUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [body, setBody] = useState(initialBody);

  const handleEdit = async () => {
    try {
      await answersAPI.updateAnswer(answerId, body);
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating answer:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this answer?')) {
      try {
        await answersAPI.deleteAnswer(answerId);
        onUpdate();
      } catch (error) {
        console.error('Error deleting answer:', error);
      }
    }
  };

  if (!isOwner) return null;

  return (
    <div>
      {isEditing ? (
        <div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            style={{
              width: '100%',
              minHeight: '100px',
              padding: '10px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <button onClick={handleEdit}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setIsEditing(true)}>Edit</button>
          <button onClick={handleDelete}>Delete</button>
        </div>
      )}
    </div>
  );
};

export default AnswerActions;
```

### 5. **Report Button**

```tsx
import { useState } from 'react';
import { reportingAPI } from '../services/api';
import FlagIcon from '@mui/icons-material/Flag';

interface ReportButtonProps {
  contentType: 'question' | 'answer' | 'comment';
  objectId: number;
}

const ReportButton: React.FC<ReportButtonProps> = ({ contentType, objectId }) => {
  const [showModal, setShowModal] = useState(false);
  const [reportType, setReportType] = useState<'spam' | 'harassment' | 'inappropriate' | 'copyright' | 'other'>('spam');
  const [description, setDescription] = useState('');

  const handleReport = async () => {
    try {
      await reportingAPI.reportContent(reportType, description, contentType, objectId);
      alert('Content reported successfully');
      setShowModal(false);
      setDescription('');
    } catch (error) {
      console.error('Error reporting content:', error);
    }
  };

  return (
    <>
      <button 
        onClick={() => setShowModal(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '8px 15px',
          background: 'rgba(231, 76, 60, 0.1)',
          border: '1px solid rgba(231, 76, 60, 0.3)',
          borderRadius: '8px',
          color: '#e74c3c',
          cursor: 'pointer'
        }}
      >
        <FlagIcon fontSize="small" /> Report
      </button>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#2c3e50',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3>Report Content</h3>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '15px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#fff'
              }}
            >
              <option value="spam">Spam</option>
              <option value="harassment">Harassment</option>
              <option value="inappropriate">Inappropriate Content</option>
              <option value="copyright">Copyright Violation</option>
              <option value="other">Other</option>
            </select>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue..."
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '10px',
                marginBottom: '15px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowModal(false)}
                style={{ padding: '10px 20px', borderRadius: '8px' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleReport}
                style={{
                  padding: '10px 20px',
                  background: '#e74c3c',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReportButton;
```

## 📝 Integration Steps:

### 1. In `QuestionDetail.tsx`:
```tsx
import VoteButtons from '../components/VoteButtons';
import Comments from '../components/Comments';
import BestAnswerButton from '../components/BestAnswerButton';
import AnswerActions from '../components/AnswerActions';
import ReportButton from '../components/ReportButton';

// Inside the component:
<VoteButtons 
  contentType="question" 
  objectId={question.id} 
  initialUpvotes={question.upvotes}
  initialDownvotes={question.downvotes}
/>

<Comments contentType="question" objectId={question.id} />

// For each answer:
<VoteButtons 
  contentType="answer" 
  objectId={answer.id} 
  initialUpvotes={answer.upvotes}
  initialDownvotes={answer.downvotes}
/>

<BestAnswerButton 
  answerId={answer.id}
  isBestAnswer={answer.is_best_answer}
  onMarked={refreshAnswers}
/>

<AnswerActions
  answerId={answer.id}
  initialBody={answer.body}
  isOwner={answer.user === currentUserId}
  onUpdate={refreshAnswers}
/>

<ReportButton contentType="answer" objectId={answer.id} />
```

## ✅ Summary:

**Completed:**
- ✅ API Services (`services/api.ts`)
- ✅ Logout button in navbar
- ✅ Role selection (already existed)

**Component Templates Provided:**
- ✅ VoteButtons
- ✅ Comments
- ✅ BestAnswerButton
- ✅ AnswerActions
- ✅ ReportButton

**Next Steps:**
1. Create the component files above
2. Import them into `QuestionDetail.tsx`
3. Style them to match your design system
4. Test with the backend

All components are ready to copy-paste and customize! 🎉
