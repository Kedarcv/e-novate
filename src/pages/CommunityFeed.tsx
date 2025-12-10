import React, { useState, useEffect } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import { db } from '../lib/database';
import './CommunityFeed.scss';

type PostType = 'all' | 'text' | 'code' | 'achievement' | 'question';

const CommunityFeed: React.FC = () => {
  const { user, posts, loadPosts, createPost, likePost, trackEvent } = useDatabase();
  
  // State
  const [activeTab, setActiveTab] = useState<PostType>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostType, setNewPostType] = useState<'text' | 'code' | 'achievement' | 'question'>('text');
  const [codeSnippet, setCodeSnippet] = useState({ language: 'javascript', code: '' });
  const [isPosting, setIsPosting] = useState(false);
  const [page, setPage] = useState(1);
  const [showCommentModal, setShowCommentModal] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  // Load posts on mount
  useEffect(() => {
    loadPosts(1);
    trackEvent('community_feed_view', {});
  }, [loadPosts, trackEvent]);

  // Filter posts
  const filteredPosts = posts.filter(post => 
    activeTab === 'all' || post.type === activeTab
  );

  // Handle create post
  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !codeSnippet.code.trim()) return;
    
    setIsPosting(true);
    try {
      await createPost(
        newPostContent,
        newPostType,
        newPostType === 'code' ? codeSnippet : undefined
      );
      
      setNewPostContent('');
      setCodeSnippet({ language: 'javascript', code: '' });
      setShowCreateModal(false);
      
      trackEvent('post_created', { type: newPostType });
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  // Handle like
  const handleLike = async (postId: string) => {
    await likePost(postId);
  };

  // Handle comment
  const handleAddComment = async (postId: string) => {
    if (!newComment.trim() || !user) return;
    
    try {
      await db.feed.addComment(postId, user._id, newComment);
      setNewComment('');
      setShowCommentModal(null);
      // Reload posts to get updated comments
      loadPosts(1);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  // Load more
  const handleLoadMore = () => {
    setPage(prev => prev + 1);
    loadPosts(page + 1);
  };

  // Format time
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'code': return 'code';
      case 'achievement': return 'emoji_events';
      case 'question': return 'help';
      default: return 'chat';
    }
  };

  return (
    <div className="community-feed">
      {/* Header */}
      <div className="feed-header">
        <h1>Community</h1>
        <p>Share your progress, ask questions, and connect with learners</p>
      </div>

      {/* Tabs */}
      <div className="feed-tabs">
        {(['all', 'text', 'code', 'achievement', 'question'] as PostType[]).map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'all' && 'All'}
            {tab === 'text' && 'Posts'}
            {tab === 'code' && 'Code'}
            {tab === 'achievement' && 'Wins'}
            {tab === 'question' && 'Q&A'}
          </button>
        ))}
      </div>

      {/* Create Post Button */}
      <button 
        className="create-post-fab"
        onClick={() => setShowCreateModal(true)}
      >
        <span className="material-symbols-outlined">edit</span> Share
      </button>

      {/* Posts List */}
      <div className="posts-list">
        {filteredPosts.length === 0 ? (
          <div className="empty-state">
            <span className="icon">📭</span>
            <h3>No posts yet</h3>
            <p>Be the first to share something with the community!</p>
          </div>
        ) : (
          filteredPosts.map(post => (
            <div key={post._id} className={`post-card ${post.type}`}>
              {/* Post Header */}
              <div className="post-header">
                <div className="author-info">
                  <div className="avatar">
                    {post.author?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="details">
                    <span className="name">{post.author?.name || 'Anonymous'}</span>
                    <span className="meta">
                      <span className="level">Lvl {post.author?.level || 1}</span>
                      <span className="time">{formatTime(post.createdAt)}</span>
                    </span>
                  </div>
                </div>
                <span className="type-badge">{getTypeIcon(post.type)}</span>
              </div>

              {/* Post Content */}
              <div className="post-content">
                <p>{post.content}</p>
                
                {post.codeSnippet && (
                  <div className="code-block">
                    <div className="code-header">
                      <span className="lang">{post.codeSnippet.language}</span>
                    </div>
                    <pre>
                      <code>{post.codeSnippet.code}</code>
                    </pre>
                  </div>
                )}
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="post-tags">
                  {post.tags.map((tag, i) => (
                    <span key={i} className="tag">#{tag}</span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="post-actions">
                <button 
                  className={`action-btn like ${post.likes.includes(user?._id || '') ? 'liked' : ''}`}
                  onClick={() => handleLike(post._id)}
                >
                  <span className="material-symbols-outlined icon">{post.likes.includes(user?._id || '') ? 'favorite' : 'favorite_border'}</span>
                  <span className="count">{post.likes.length}</span>
                </button>
                
                <button 
                  className="action-btn comment"
                  onClick={() => setShowCommentModal(post._id)}
                >
                  <span className="material-symbols-outlined icon">chat_bubble_outline</span>
                  <span className="count">{post.comments.length}</span>
                </button>
                
                <button className="action-btn share">
                  <span className="material-symbols-outlined icon">link</span>
                </button>
              </div>

              {/* Comments Preview */}
              {post.comments.length > 0 && (
                <div className="comments-preview">
                  {post.comments.slice(0, 2).map((comment, i) => (
                    <div key={i} className="comment">
                      <strong>User</strong>: {comment.content}
                    </div>
                  ))}
                  {post.comments.length > 2 && (
                    <button 
                      className="view-all-comments"
                      onClick={() => setShowCommentModal(post._id)}
                    >
                      View all {post.comments.length} comments
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {/* Load More */}
        {filteredPosts.length >= 20 && (
          <button className="load-more-btn" onClick={handleLoadMore}>
            Load More
          </button>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="create-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Post</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            {/* Post Type Selector */}
            <div className="type-selector">
              {(['text', 'code', 'achievement', 'question'] as const).map(type => (
                <button
                  key={type}
                  className={`type-btn ${newPostType === type ? 'active' : ''}`}
                  onClick={() => setNewPostType(type)}
                >
                  {getTypeIcon(type)}
                </button>
              ))}
            </div>

            {/* Content Input */}
            <textarea
              placeholder={
                newPostType === 'question' 
                  ? "What would you like to ask?" 
                  : newPostType === 'achievement'
                    ? "Share your achievement! 🎉"
                    : "What's on your mind?"
              }
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              rows={4}
            />

            {/* Code Input */}
            {newPostType === 'code' && (
              <div className="code-input-section">
                <select
                  value={codeSnippet.language}
                  onChange={(e) => setCodeSnippet(prev => ({ ...prev, language: e.target.value }))}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="typescript">TypeScript</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                  <option value="java">Java</option>
                  <option value="csharp">C#</option>
                  <option value="cpp">C++</option>
                </select>
                <textarea
                  placeholder="Paste your code here..."
                  value={codeSnippet.code}
                  onChange={(e) => setCodeSnippet(prev => ({ ...prev, code: e.target.value }))}
                  rows={6}
                  className="code-textarea"
                />
              </div>
            )}

            {/* Post Button */}
            <button 
              className="post-btn"
              onClick={handleCreatePost}
              disabled={isPosting || (!newPostContent.trim() && !codeSnippet.code.trim())}
            >
              {isPosting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      )}

      {/* Comment Modal */}
      {showCommentModal && (
        <div className="modal-overlay" onClick={() => setShowCommentModal(null)}>
          <div className="comment-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Comments</h2>
              <button className="close-btn" onClick={() => setShowCommentModal(null)}>×</button>
            </div>

            {/* Comments List */}
            <div className="comments-list">
              {posts.find(p => p._id === showCommentModal)?.comments.map((comment, i) => (
                <div key={i} className="comment-item">
                  <div className="comment-avatar">U</div>
                  <div className="comment-body">
                    <span className="comment-author">User</span>
                    <p>{comment.content}</p>
                    <span className="comment-time">{formatTime(comment.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <div className="add-comment">
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment(showCommentModal)}
              />
              <button onClick={() => handleAddComment(showCommentModal)}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Preview */}
      <div className="leaderboard-section">
        <h3><span className="material-symbols-outlined">emoji_events</span> Top Learners This Week</h3>
        <div className="leaderboard-preview">
          <div className="leader-item">
            <span className="rank gold">1</span>
            <span className="name">Sarah K.</span>
            <span className="xp">2,450 XP</span>
          </div>
          <div className="leader-item">
            <span className="rank silver">2</span>
            <span className="name">John M.</span>
            <span className="xp">2,180 XP</span>
          </div>
          <div className="leader-item">
            <span className="rank bronze">3</span>
            <span className="name">Alex T.</span>
            <span className="xp">1,920 XP</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityFeed;
