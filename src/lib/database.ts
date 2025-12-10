// MongoDB API Service for E-Novate Learning Platform
// Handles all database operations through the backend API

// Use relative URL for production (Netlify Functions) or localhost for development
const API_URL = process.env.REACT_APP_API_URL || '/api';

// Generate unique session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// API request helper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// ==================== USER SERVICES ====================

export interface User {
  _id: string;
  phoneNumber?: string;
  email?: string;
  name: string;
  xp: number;
  level: number;
  streak: number;
  badges: string[];
  completedCourses: string[];
  completedModules: string[];
  skills: string[];
  preferences: {
    pushNotifications: boolean;
    darkMode: boolean;
    soundEffects: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const userService = {
  // Authenticate or create user
  async auth(phoneNumber?: string, email?: string, name?: string): Promise<User> {
    const response = await apiRequest<{ success: boolean; user: User }>('/users/auth', {
      method: 'POST',
      body: JSON.stringify({ phoneNumber, email, name }),
    });
    
    // Store user in localStorage
    localStorage.setItem('userId', response.user._id);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response.user;
  },

  // Get current user from localStorage
  getCurrentUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get user ID
  getUserId(): string | null {
    return localStorage.getItem('userId');
  },

  // Get user by ID
  async getUser(userId: string): Promise<User> {
    const response = await apiRequest<{ success: boolean; user: User }>(`/users/${userId}`);
    return response.user;
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const response = await apiRequest<{ success: boolean; user: User }>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response.user;
  },

  // Add XP
  async addXP(userId: string, amount: number, reason: string): Promise<{ user: User; leveledUp: boolean }> {
    const response = await apiRequest<{ success: boolean; user: User; leveledUp: boolean }>(
      `/users/${userId}/xp`,
      {
        method: 'POST',
        body: JSON.stringify({ amount, reason }),
      }
    );
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return { user: response.user, leveledUp: response.leveledUp };
  },

  // Logout
  logout(): void {
    // Clear all auth-related localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userPreferences');
    
    // Clear session storage to force re-login
    sessionStorage.removeItem('sessionId');
    sessionStorage.removeItem('sessionActive');
  },
};

// ==================== LEARNING PROGRESS SERVICES ====================

export interface LearningProgress {
  _id: string;
  userId: string;
  courseId: string;
  moduleId: string;
  completed: boolean;
  score: number;
  timeSpent: number;
  quizResults: any[];
  createdAt: Date;
  updatedAt: Date;
}

export const progressService = {
  // Get all progress for user
  async getProgress(userId: string): Promise<LearningProgress[]> {
    const response = await apiRequest<{ success: boolean; progress: LearningProgress[] }>(
      `/progress/${userId}`
    );
    return response.progress;
  },

  // Update progress
  async updateProgress(data: {
    userId: string;
    courseId: string;
    moduleId: string;
    completed: boolean;
    score?: number;
    timeSpent?: number;
    quizResults?: any[];
  }): Promise<LearningProgress> {
    const response = await apiRequest<{ success: boolean; progress: LearningProgress }>(
      '/progress',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.progress;
  },
};

// ==================== QUIZ SERVICES ====================

export interface QuizResult {
  _id: string;
  userId: string;
  courseId: string;
  moduleId: string;
  quizType: 'flashcard' | 'multiple-choice' | 'code-challenge';
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: any[];
  timeSpent: number;
  completedAt: Date;
}

export const quizService = {
  // Save quiz results
  async saveResults(data: {
    userId: string;
    courseId: string;
    moduleId: string;
    quizType: 'flashcard' | 'multiple-choice' | 'code-challenge';
    score: number;
    totalQuestions: number;
    answers: any[];
    timeSpent: number;
  }): Promise<{ result: QuizResult; xpEarned: number }> {
    const response = await apiRequest<{ success: boolean; result: QuizResult; xpEarned: number }>(
      '/quiz/results',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return { result: response.result, xpEarned: response.xpEarned };
  },

  // Get quiz history
  async getHistory(userId: string): Promise<QuizResult[]> {
    const response = await apiRequest<{ success: boolean; history: QuizResult[] }>(
      `/quiz/history/${userId}`
    );
    return response.history;
  },
};

// ==================== CODE CHALLENGE SERVICES ====================

export interface CodeSubmission {
  _id: string;
  userId: string;
  challengeId: string;
  code: string;
  language: string;
  passed: boolean;
  testResults: any[];
  executionTime: number;
  submittedAt: Date;
}

export const codeService = {
  // Submit code
  async submit(data: {
    userId: string;
    challengeId: string;
    code: string;
    language: string;
    passed: boolean;
    testResults: any[];
    executionTime: number;
  }): Promise<CodeSubmission> {
    const response = await apiRequest<{ success: boolean; submission: CodeSubmission }>(
      '/code/submit',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.submission;
  },

  // Get code history
  async getHistory(userId: string): Promise<CodeSubmission[]> {
    const response = await apiRequest<{ success: boolean; history: CodeSubmission[] }>(
      `/code/history/${userId}`
    );
    return response.history;
  },
};

// ==================== JOB SERVICES ====================

export interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  skills: string[];
  description: string;
  requirements: string[];
  postedAt: Date;
}

export interface JobApplication {
  _id: string;
  userId: string;
  jobId: string;
  coverLetter: string;
  resumeUrl?: string;
  answers?: any;
  status: 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected';
  appliedAt: Date;
  updatedAt: Date;
}

export const jobService = {
  // Get all jobs
  async getJobs(filters?: { type?: string; search?: string; page?: number }): Promise<{
    jobs: Job[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    
    const response = await apiRequest<{
      success: boolean;
      jobs: Job[];
      total: number;
      page: number;
      totalPages: number;
    }>(`/jobs?${params.toString()}`);
    
    return {
      jobs: response.jobs,
      total: response.total,
      page: response.page,
      totalPages: response.totalPages,
    };
  },

  // Apply for job
  async apply(data: {
    userId: string;
    jobId: string;
    coverLetter: string;
    resumeUrl?: string;
    answers?: any;
  }): Promise<JobApplication> {
    const response = await apiRequest<{ success: boolean; application: JobApplication }>(
      '/jobs/apply',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
    return response.application;
  },

  // Get user's applications
  async getApplications(userId: string): Promise<JobApplication[]> {
    const response = await apiRequest<{ success: boolean; applications: JobApplication[] }>(
      `/jobs/applications/${userId}`
    );
    return response.applications;
  },
};

// ==================== METRICS SERVICES ====================

export interface MetricsSummary {
  user: User;
  stats: {
    totalQuizzes: number;
    avgQuizScore: number;
    totalChallenges: number;
    passedChallenges: number;
    challengePassRate: number;
    totalTimeSpent: number;
  };
  recentActivity: any[];
}

export const metricsService = {
  // Log event
  async logEvent(eventType: string, eventData: any): Promise<void> {
    const userId = userService.getUserId();
    
    await apiRequest('/metrics/event', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        eventType,
        eventData,
        sessionId: getSessionId(),
      }),
    });
  },

  // Get summary
  async getSummary(userId: string): Promise<MetricsSummary> {
    const response = await apiRequest<{ success: boolean; summary: MetricsSummary }>(
      `/metrics/summary/${userId}`
    );
    return response.summary;
  },

  // Get leaderboard
  async getLeaderboard(limit: number = 50): Promise<Partial<User>[]> {
    const response = await apiRequest<{ success: boolean; leaderboard: Partial<User>[] }>(
      `/leaderboard?limit=${limit}`
    );
    return response.leaderboard;
  },
};

// ==================== SOCIAL FEED SERVICES ====================

export interface Post {
  _id: string;
  userId: string;
  content: string;
  type: 'text' | 'code' | 'achievement' | 'question';
  attachments: string[];
  codeSnippet?: {
    language: string;
    code: string;
  };
  tags: string[];
  likes: string[];
  comments: Comment[];
  createdAt: Date;
  author?: {
    name: string;
    level: number;
    badges: string[];
  };
}

export interface Comment {
  _id: string;
  userId: string;
  content: string;
  createdAt: Date;
}

export const feedService = {
  // Create post
  async createPost(data: {
    userId: string;
    content: string;
    type?: 'text' | 'code' | 'achievement' | 'question';
    attachments?: string[];
    codeSnippet?: { language: string; code: string };
    tags?: string[];
  }): Promise<Post> {
    const response = await apiRequest<{ success: boolean; post: Post }>('/feed/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.post;
  },

  // Get posts
  async getPosts(page: number = 1, type?: string): Promise<Post[]> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (type) params.append('type', type);
    
    const response = await apiRequest<{ success: boolean; posts: Post[] }>(
      `/feed/posts?${params.toString()}`
    );
    return response.posts;
  },

  // Like post
  async likePost(postId: string, userId: string): Promise<boolean> {
    const response = await apiRequest<{ success: boolean; liked: boolean }>(
      `/feed/posts/${postId}/like`,
      {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }
    );
    return response.liked;
  },

  // Add comment
  async addComment(postId: string, userId: string, content: string): Promise<Comment> {
    const response = await apiRequest<{ success: boolean; comment: Comment }>(
      `/feed/posts/${postId}/comment`,
      {
        method: 'POST',
        body: JSON.stringify({ userId, content }),
      }
    );
    return response.comment;
  },
};

// ==================== BADGES SERVICES ====================

export interface Badge {
  id: string;
  name: string;
  icon: string;
}

export const badgeService = {
  // Check for new badges
  async checkBadges(userId: string): Promise<Badge[]> {
    const response = await apiRequest<{ success: boolean; newBadges: Badge[] }>(
      `/badges/check/${userId}`,
      { method: 'POST' }
    );
    return response.newBadges;
  },
};

// ==================== COURSES SERVICES ====================

export interface Course {
  _id: string;
  title: string;
  subject: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  xpReward: number;
  modules: Module[];
  order: number;
}

export interface Module {
  id: number;
  title: string;
  duration: number;
  xp: number;
  type: 'lesson' | 'quiz' | 'challenge';
  content: string;
  quiz?: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

export const courseService = {
  // Get all courses
  async getCourses(filters?: { subject?: string; difficulty?: string; search?: string }): Promise<Course[]> {
    const params = new URLSearchParams();
    if (filters?.subject) params.append('subject', filters.subject);
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.search) params.append('search', filters.search);
    
    const response = await apiRequest<{ success: boolean; courses: Course[] }>(
      `/courses?${params.toString()}`
    );
    return response.courses;
  },

  // Get course details
  async getCourse(courseId: string): Promise<Course> {
    const response = await apiRequest<{ success: boolean; course: Course }>(
      `/courses/${courseId}`
    );
    return response.course;
  },
};

// ==================== UTILITY SERVICES ====================

export const utilService = {
  // Seed database (development only)
  async seedDatabase(): Promise<void> {
    await apiRequest('/seed', { method: 'POST' });
  },

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await apiRequest<{ success: boolean }>('/health');
      return response.success;
    } catch {
      return false;
    }
  },
};

// Export all services
export const db = {
  user: userService,
  progress: progressService,
  quiz: quizService,
  code: codeService,
  job: jobService,
  metrics: metricsService,
  feed: feedService,
  badge: badgeService,
  course: courseService,
  util: utilService,
};

export default db;
