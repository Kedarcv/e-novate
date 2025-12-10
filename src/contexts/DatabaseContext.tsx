import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { db, User, MetricsSummary, Badge, Post } from '../lib/database';

interface DatabaseContextType {
  // User state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (phoneNumber?: string, email?: string, name?: string) => Promise<User>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  addXP: (amount: number, reason: string) => Promise<{ leveledUp: boolean }>;
  
  // Metrics
  metrics: MetricsSummary | null;
  refreshMetrics: () => Promise<void>;
  
  // Badges
  checkBadges: () => Promise<Badge[]>;
  
  // Feed
  posts: Post[];
  loadPosts: (page?: number) => Promise<void>;
  createPost: (content: string, type?: 'text' | 'code' | 'achievement' | 'question', codeSnippet?: { language: string; code: string }) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  
  // Event tracking
  trackEvent: (eventType: string, eventData: any) => void;
  
  // API Status
  isApiConnected: boolean;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isApiConnected, setIsApiConnected] = useState(false);

  // Check API connection and load user on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check API health
        const healthy = await db.util.healthCheck();
        setIsApiConnected(healthy);
        
        // Load user from localStorage
        const storedUser = db.user.getCurrentUser();
        if (storedUser) {
          setUser(storedUser);
          
          // Refresh user data from server
          if (healthy && storedUser._id) {
            try {
              const freshUser = await db.user.getUser(storedUser._id);
              setUser(freshUser);
            } catch (e) {
              console.log('Could not refresh user data');
            }
          }
        }
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  // Login/Register
  const login = useCallback(async (phoneNumber?: string, email?: string, name?: string): Promise<User> => {
    setIsLoading(true);
    try {
      const loggedInUser = await db.user.auth(phoneNumber, email, name);
      setUser(loggedInUser);
      
      // Track login event
      db.metrics.logEvent('login', { method: phoneNumber ? 'phone' : 'email' });
      
      return loggedInUser;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    db.metrics.logEvent('logout', {});
    db.user.logout();
    setUser(null);
    setMetrics(null);
    setPosts([]);
  }, []);

  // Update profile
  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user?._id) return;
    
    const updatedUser = await db.user.updateProfile(user._id, updates);
    setUser(updatedUser);
    
    db.metrics.logEvent('profile_update', { fields: Object.keys(updates) });
  }, [user]);

  // Add XP
  const addXP = useCallback(async (amount: number, reason: string): Promise<{ leveledUp: boolean }> => {
    if (!user?._id) return { leveledUp: false };
    
    const result = await db.user.addXP(user._id, amount, reason);
    setUser(result.user);
    
    if (result.leveledUp) {
      db.metrics.logEvent('level_up', { newLevel: result.user.level });
    }
    
    return { leveledUp: result.leveledUp };
  }, [user]);

  // Refresh metrics
  const refreshMetrics = useCallback(async () => {
    if (!user?._id) return;
    
    try {
      const summary = await db.metrics.getSummary(user._id);
      setMetrics(summary);
    } catch (error) {
      console.error('Failed to refresh metrics:', error);
    }
  }, [user]);

  // Check badges
  const checkBadges = useCallback(async (): Promise<Badge[]> => {
    if (!user?._id) return [];
    
    const newBadges = await db.badge.checkBadges(user._id);
    
    if (newBadges.length > 0) {
      // Refresh user to get updated badges
      const freshUser = await db.user.getUser(user._id);
      setUser(freshUser);
    }
    
    return newBadges;
  }, [user]);

  // Load posts
  const loadPosts = useCallback(async (page: number = 1) => {
    try {
      const fetchedPosts = await db.feed.getPosts(page);
      if (page === 1) {
        setPosts(fetchedPosts);
      } else {
        setPosts(prev => [...prev, ...fetchedPosts]);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  }, []);

  // Create post
  const createPost = useCallback(async (
    content: string, 
    type: 'text' | 'code' | 'achievement' | 'question' = 'text',
    codeSnippet?: { language: string; code: string }
  ) => {
    if (!user?._id) return;
    
    const newPost = await db.feed.createPost({
      userId: user._id,
      content,
      type,
      codeSnippet
    });
    
    // Add author info
    const postWithAuthor = {
      ...newPost,
      author: {
        name: user.name,
        level: user.level,
        badges: user.badges
      }
    };
    
    setPosts(prev => [postWithAuthor, ...prev]);
    
    db.metrics.logEvent('post_created', { type });
  }, [user]);

  // Like post
  const likePost = useCallback(async (postId: string) => {
    if (!user?._id) return;
    
    const liked = await db.feed.likePost(postId, user._id);
    
    // Update local state
    setPosts(prev => prev.map(post => {
      if (post._id === postId) {
        return {
          ...post,
          likes: liked 
            ? [...post.likes, user._id]
            : post.likes.filter(id => id !== user._id)
        };
      }
      return post;
    }));
    
    db.metrics.logEvent('post_liked', { postId, liked });
  }, [user]);

  // Track event
  const trackEvent = useCallback((eventType: string, eventData: any) => {
    db.metrics.logEvent(eventType, eventData);
  }, []);

  const value: DatabaseContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateProfile,
    addXP,
    metrics,
    refreshMetrics,
    checkBadges,
    posts,
    loadPosts,
    createPost,
    likePost,
    trackEvent,
    isApiConnected
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseContextType => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

export default DatabaseContext;
