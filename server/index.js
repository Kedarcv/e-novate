const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'e-novate-super-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());

// JWT Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }
    next();
  };
};

// MongoDB Connection
const MONGO_URL = process.env.REACT_APP_MONGO_URL || 'mongodb+srv://cvlised360:Cvlised%40360@musika.dogjv.mongodb.net/e-novate';
const DB_NAME = process.env.REACT_APP_MONGODB_DB_NAME || 'e-novate';

let db;
let client;

async function connectDB() {
  try {
    client = new MongoClient(MONGO_URL);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB:', DB_NAME);
    
    // Create indexes for better performance
    await createIndexes();
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function createIndexes() {
  try {
    // Users collection indexes
    await db.collection('users').createIndex({ odphoneNumber: 1 }, { unique: true, sparse: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true, sparse: true });
    
    // Learning progress indexes
    await db.collection('learningProgress').createIndex({ oduserId: 1 });
    await db.collection('learningProgress').createIndex({ odcourseId: 1 });
    
    // Job applications indexes
    await db.collection('jobApplications').createIndex({ oduserId: 1 });
    await db.collection('jobApplications').createIndex({ odjobId: 1 });
    
    // Metrics indexes
    await db.collection('metrics').createIndex({ oduserId: 1 });
    await db.collection('metrics').createIndex({ odtimestamp: -1 });
    
    console.log('✅ Database indexes created');
  } catch (error) {
    console.log('Indexes may already exist:', error.message);
  }
}

// Helper to get collection
const getCollection = (name) => db.collection(name);

// ==================== AUTHENTICATION ROUTES ====================

// Register new user
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, phoneNumber, password, role } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    // Validate role
    const validRoles = ['student', 'client', 'admin'];
    const userRole = validRoles.includes(role) ? role : 'student';

    // Check if user already exists
    const existingUser = await getCollection('users').findOne({
      $or: [{ email }, ...(phoneNumber ? [{ phoneNumber }] : [])]
    });

    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = {
      name,
      email,
      phoneNumber: phoneNumber || null,
      password: hashedPassword,
      role: userRole,
      xp: 0,
      level: 1,
      streak: 0,
      badges: [],
      completedCourses: [],
      completedModules: [],
      completedChallenges: [],
      skills: [],
      enrolledCourses: [],
      preferences: {
        pushNotifications: true,
        darkMode: true,
        soundEffects: true,
        emailNotifications: true
      },
      subscription: {
        plan: 'free',
        startDate: new Date(),
        endDate: null
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await getCollection('users').insertOne(newUser);
    const userId = result.insertedId;

    // Generate JWT token
    const token = jwt.sign(
      { userId: userId.toString(), email, role: userRole },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      token,
      user: { ...userWithoutPassword, _id: userId }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Login user
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    // Find user
    const user = await getCollection('users').findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    // Update last login
    await getCollection('users').updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify token
app.get('/api/users/verify', authenticateToken, async (req, res) => {
  try {
    const user = await getCollection('users').findOne({
      _id: new ObjectId(req.user.userId)
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== USER ROUTES ====================

// Get or create user
app.post('/api/users/auth', async (req, res) => {
  try {
    const { phoneNumber, email, name } = req.body;
    
    let user = await getCollection('users').findOne({
      $or: [
        { phoneNumber: phoneNumber },
        { email: email }
      ]
    });
    
    if (!user) {
      const newUser = {
        phoneNumber,
        email,
        name: name || 'User',
        xp: 0,
        level: 1,
        streak: 0,
        badges: [],
        completedCourses: [],
        completedModules: [],
        skills: [],
        preferences: {
          pushNotifications: true,
          darkMode: true,
          soundEffects: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await getCollection('users').insertOne(newUser);
      user = { ...newUser, _id: result.insertedId };
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user by ID
app.get('/api/users/:userId', async (req, res) => {
  try {
    const user = await getCollection('users').findOne({ 
      _id: new ObjectId(req.params.userId) 
    });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update user profile
app.put('/api/users/:userId', async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date() };
    delete updates._id;
    
    const result = await getCollection('users').findOneAndUpdate(
      { _id: new ObjectId(req.params.userId) },
      { $set: updates },
      { returnDocument: 'after' }
    );
    
    res.json({ success: true, user: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update user XP
app.post('/api/users/:userId/xp', async (req, res) => {
  try {
    const { amount, reason } = req.body;
    
    const user = await getCollection('users').findOneAndUpdate(
      { _id: new ObjectId(req.params.userId) },
      { 
        $inc: { xp: amount },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );
    
    // Log XP event
    await getCollection('xpHistory').insertOne({
      userId: new ObjectId(req.params.userId),
      amount,
      reason,
      timestamp: new Date()
    });
    
    // Check for level up
    const newLevel = Math.floor(user.xp / 100) + 1;
    if (newLevel > user.level) {
      await getCollection('users').updateOne(
        { _id: new ObjectId(req.params.userId) },
        { $set: { level: newLevel } }
      );
      user.level = newLevel;
    }
    
    res.json({ success: true, user, leveledUp: newLevel > (user.level - 1) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== LEARNING PROGRESS ROUTES ====================

// Get learning progress for user
app.get('/api/progress/:userId', async (req, res) => {
  try {
    const progress = await getCollection('learningProgress')
      .find({ userId: new ObjectId(req.params.userId) })
      .toArray();
    
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update course progress
app.post('/api/progress', async (req, res) => {
  try {
    const { userId, courseId, moduleId, completed, score, timeSpent, quizResults } = req.body;
    
    const progressData = {
      userId: new ObjectId(userId),
      courseId,
      moduleId,
      completed,
      score: score || 0,
      timeSpent: timeSpent || 0,
      quizResults: quizResults || [],
      updatedAt: new Date()
    };
    
    const result = await getCollection('learningProgress').findOneAndUpdate(
      { userId: new ObjectId(userId), courseId, moduleId },
      { 
        $set: progressData,
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true, returnDocument: 'after' }
    );
    
    // If completed, update user's completed modules
    if (completed) {
      await getCollection('users').updateOne(
        { _id: new ObjectId(userId) },
        { 
          $addToSet: { completedModules: `${courseId}-${moduleId}` },
          $set: { updatedAt: new Date() }
        }
      );
    }
    
    res.json({ success: true, progress: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== QUIZ & FLASHCARD ROUTES ====================

// Save quiz results
app.post('/api/quiz/results', async (req, res) => {
  try {
    const { userId, courseId, moduleId, quizType, score, totalQuestions, answers, timeSpent } = req.body;
    
    const quizResult = {
      userId: new ObjectId(userId),
      courseId,
      moduleId,
      quizType, // 'flashcard', 'multiple-choice', 'code-challenge'
      score,
      totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      answers,
      timeSpent,
      completedAt: new Date()
    };
    
    const result = await getCollection('quizResults').insertOne(quizResult);
    
    // Award XP based on performance
    const xpEarned = Math.round((score / totalQuestions) * 50);
    await getCollection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { xp: xpEarned } }
    );
    
    res.json({ success: true, result: { ...quizResult, _id: result.insertedId }, xpEarned });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get quiz history for user
app.get('/api/quiz/history/:userId', async (req, res) => {
  try {
    const history = await getCollection('quizResults')
      .find({ userId: new ObjectId(req.params.userId) })
      .sort({ completedAt: -1 })
      .limit(50)
      .toArray();
    
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== CODE CHALLENGE ROUTES ====================

// Save code submission
app.post('/api/code/submit', async (req, res) => {
  try {
    const { userId, challengeId, code, language, passed, testResults, executionTime } = req.body;
    
    const submission = {
      userId: new ObjectId(userId),
      challengeId,
      code,
      language,
      passed,
      testResults,
      executionTime,
      submittedAt: new Date()
    };
    
    const result = await getCollection('codeSubmissions').insertOne(submission);
    
    // Award XP if passed
    if (passed) {
      const xpEarned = 100;
      await getCollection('users').updateOne(
        { _id: new ObjectId(userId) },
        { 
          $inc: { xp: xpEarned },
          $addToSet: { completedChallenges: challengeId }
        }
      );
    }
    
    res.json({ success: true, submission: { ...submission, _id: result.insertedId } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get code submission history
app.get('/api/code/history/:userId', async (req, res) => {
  try {
    const history = await getCollection('codeSubmissions')
      .find({ userId: new ObjectId(req.params.userId) })
      .sort({ submittedAt: -1 })
      .limit(100)
      .toArray();
    
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== JOB APPLICATION ROUTES ====================

// Get all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const { type, search, page = 1, limit = 20 } = req.query;
    
    const filter = {};
    if (type && type !== 'All') {
      filter.type = type;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const jobs = await getCollection('jobs')
      .find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ postedAt: -1 })
      .toArray();
    
    const total = await getCollection('jobs').countDocuments(filter);
    
    res.json({ success: true, jobs, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit job application
app.post('/api/jobs/apply', async (req, res) => {
  try {
    const { userId, jobId, coverLetter, resumeUrl, answers } = req.body;
    
    // Check if already applied
    const existing = await getCollection('jobApplications').findOne({
      userId: new ObjectId(userId),
      jobId
    });
    
    if (existing) {
      return res.status(400).json({ success: false, error: 'Already applied to this job' });
    }
    
    const application = {
      userId: new ObjectId(userId),
      jobId,
      coverLetter,
      resumeUrl,
      answers,
      status: 'pending', // pending, reviewed, interview, accepted, rejected
      appliedAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await getCollection('jobApplications').insertOne(application);
    
    // Award XP for applying
    await getCollection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { xp: 25 } }
    );
    
    res.json({ success: true, application: { ...application, _id: result.insertedId } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user's job applications
app.get('/api/jobs/applications/:userId', async (req, res) => {
  try {
    const applications = await getCollection('jobApplications')
      .find({ userId: new ObjectId(req.params.userId) })
      .sort({ appliedAt: -1 })
      .toArray();
    
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== METRICS & ANALYTICS ROUTES ====================

// Log metric event
app.post('/api/metrics/event', async (req, res) => {
  try {
    const { userId, eventType, eventData, sessionId } = req.body;
    
    const metric = {
      userId: userId ? new ObjectId(userId) : null,
      eventType,
      eventData,
      sessionId,
      timestamp: new Date(),
      userAgent: req.headers['user-agent'],
      ip: req.ip
    };
    
    await getCollection('metrics').insertOne(metric);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user metrics summary
app.get('/api/metrics/summary/:userId', async (req, res) => {
  try {
    const userId = new ObjectId(req.params.userId);
    
    // Get various metrics
    const [
      user,
      totalQuizzes,
      avgQuizScore,
      totalChallenges,
      passedChallenges,
      totalTimeSpent,
      recentActivity
    ] = await Promise.all([
      getCollection('users').findOne({ _id: userId }),
      getCollection('quizResults').countDocuments({ userId }),
      getCollection('quizResults').aggregate([
        { $match: { userId } },
        { $group: { _id: null, avgScore: { $avg: '$percentage' } } }
      ]).toArray(),
      getCollection('codeSubmissions').countDocuments({ userId }),
      getCollection('codeSubmissions').countDocuments({ userId, passed: true }),
      getCollection('learningProgress').aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: '$timeSpent' } } }
      ]).toArray(),
      getCollection('metrics')
        .find({ userId })
        .sort({ timestamp: -1 })
        .limit(20)
        .toArray()
    ]);
    
    res.json({
      success: true,
      summary: {
        user,
        stats: {
          totalQuizzes,
          avgQuizScore: avgQuizScore[0]?.avgScore || 0,
          totalChallenges,
          passedChallenges,
          challengePassRate: totalChallenges > 0 ? Math.round((passedChallenges / totalChallenges) * 100) : 0,
          totalTimeSpent: totalTimeSpent[0]?.total || 0
        },
        recentActivity
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const leaderboard = await getCollection('users')
      .find({})
      .project({ name: 1, xp: 1, level: 1, badges: 1 })
      .sort({ xp: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    res.json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== SOCIAL FEED ROUTES ====================

// Create post
app.post('/api/feed/posts', async (req, res) => {
  try {
    const { userId, content, type, attachments, codeSnippet, tags } = req.body;
    
    const post = {
      userId: new ObjectId(userId),
      content,
      type: type || 'text', // text, code, achievement, question
      attachments: attachments || [],
      codeSnippet,
      tags: tags || [],
      likes: [],
      comments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await getCollection('posts').insertOne(post);
    
    // Award XP for posting
    await getCollection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { xp: 10 } }
    );
    
    res.json({ success: true, post: { ...post, _id: result.insertedId } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get feed posts
app.get('/api/feed/posts', async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    
    const filter = type ? { type } : {};
    
    const posts = await getCollection('posts')
      .aggregate([
        { $match: filter },
        { $sort: { createdAt: -1 } },
        { $skip: (page - 1) * parseInt(limit) },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'author'
          }
        },
        { $unwind: '$author' },
        {
          $project: {
            content: 1,
            type: 1,
            attachments: 1,
            codeSnippet: 1,
            tags: 1,
            likes: 1,
            comments: 1,
            createdAt: 1,
            'author.name': 1,
            'author.level': 1,
            'author.badges': 1
          }
        }
      ])
      .toArray();
    
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Like/unlike post
app.post('/api/feed/posts/:postId/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const postId = new ObjectId(req.params.postId);
    const userObjectId = new ObjectId(userId);
    
    const post = await getCollection('posts').findOne({ _id: postId });
    
    const hasLiked = post.likes.some(id => id.equals(userObjectId));
    
    if (hasLiked) {
      await getCollection('posts').updateOne(
        { _id: postId },
        { $pull: { likes: userObjectId } }
      );
    } else {
      await getCollection('posts').updateOne(
        { _id: postId },
        { $addToSet: { likes: userObjectId } }
      );
    }
    
    res.json({ success: true, liked: !hasLiked });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add comment
app.post('/api/feed/posts/:postId/comment', async (req, res) => {
  try {
    const { userId, content } = req.body;
    
    const comment = {
      _id: new ObjectId(),
      userId: new ObjectId(userId),
      content,
      createdAt: new Date()
    };
    
    await getCollection('posts').updateOne(
      { _id: new ObjectId(req.params.postId) },
      { $push: { comments: comment } }
    );
    
    // Award XP for commenting
    await getCollection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { xp: 5 } }
    );
    
    res.json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== BADGES & ACHIEVEMENTS ====================

// Check and award badges
app.post('/api/badges/check/:userId', async (req, res) => {
  try {
    const userId = new ObjectId(req.params.userId);
    
    const user = await getCollection('users').findOne({ _id: userId });
    const newBadges = [];
    
    // Define badge criteria
    const badgeCriteria = [
      { id: 'first-quiz', name: 'Quiz Starter', icon: '🎯', condition: async () => {
        const count = await getCollection('quizResults').countDocuments({ userId });
        return count >= 1;
      }},
      { id: 'quiz-master', name: 'Quiz Master', icon: '🏆', condition: async () => {
        const count = await getCollection('quizResults').countDocuments({ userId, percentage: { $gte: 90 } });
        return count >= 10;
      }},
      { id: 'first-code', name: 'Code Beginner', icon: '💻', condition: async () => {
        const count = await getCollection('codeSubmissions').countDocuments({ userId, passed: true });
        return count >= 1;
      }},
      { id: 'code-ninja', name: 'Code Ninja', icon: '🥷', condition: async () => {
        const count = await getCollection('codeSubmissions').countDocuments({ userId, passed: true });
        return count >= 50;
      }},
      { id: 'streak-7', name: 'Week Warrior', icon: '🔥', condition: async () => {
        return user.streak >= 7;
      }},
      { id: 'streak-30', name: 'Monthly Master', icon: '⚡', condition: async () => {
        return user.streak >= 30;
      }},
      { id: 'level-10', name: 'Rising Star', icon: '⭐', condition: async () => {
        return user.level >= 10;
      }},
      { id: 'first-job', name: 'Job Seeker', icon: '💼', condition: async () => {
        const count = await getCollection('jobApplications').countDocuments({ userId });
        return count >= 1;
      }},
      { id: 'social-butterfly', name: 'Social Butterfly', icon: '🦋', condition: async () => {
        const count = await getCollection('posts').countDocuments({ userId });
        return count >= 10;
      }}
    ];
    
    // Check each badge
    for (const badge of badgeCriteria) {
      if (!user.badges?.includes(badge.id)) {
        const earned = await badge.condition();
        if (earned) {
          newBadges.push(badge);
          await getCollection('users').updateOne(
            { _id: userId },
            { $addToSet: { badges: badge.id } }
          );
        }
      }
    }
    
    res.json({ success: true, newBadges });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== COURSES & CONTENT ====================

// Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const { subject, difficulty, search } = req.query;
    
    const filter = {};
    if (subject) filter.subject = subject;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const courses = await getCollection('courses')
      .find(filter)
      .sort({ order: 1 })
      .toArray();
    
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get course details with modules
app.get('/api/courses/:courseId', async (req, res) => {
  try {
    const course = await getCollection('courses').findOne({ 
      _id: new ObjectId(req.params.courseId) 
    });
    
    if (!course) {
      return res.status(404).json({ success: false, error: 'Course not found' });
    }
    
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Seed initial data (for development)
app.post('/api/seed', async (req, res) => {
  try {
    // Seed some sample jobs
    const sampleJobs = [
      {
        title: 'Junior Web Developer',
        company: 'TechZim Solutions',
        location: 'Harare (Remote)',
        salary: '$400-600/month',
        type: 'Full-time',
        skills: ['React', 'JavaScript', 'CSS'],
        description: 'Looking for a junior developer to join our team...',
        requirements: ['1+ years experience', 'React knowledge', 'Good communication'],
        postedAt: new Date()
      },
      {
        title: 'Data Entry Specialist',
        company: 'FinServe Africa',
        location: 'Harare',
        salary: '$200-300/month',
        type: 'Part-time',
        skills: ['Excel', 'Typing', 'Attention to detail'],
        description: 'We need a detail-oriented data entry specialist...',
        requirements: ['Fast typing speed', 'Excel proficiency'],
        postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Mobile App Developer',
        company: 'StartUp Hub',
        location: 'Remote',
        salary: '$800-1200/month',
        type: 'Remote',
        skills: ['React Native', 'TypeScript', 'iOS', 'Android'],
        description: 'Build amazing mobile experiences...',
        requirements: ['2+ years mobile development', 'Published apps'],
        postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ];
    
    await getCollection('jobs').insertMany(sampleJobs);
    
    // Seed sample courses
    const sampleCourses = [
      {
        title: 'Web Development Basics',
        subject: 'programming',
        description: 'Learn HTML, CSS, and JavaScript from scratch',
        difficulty: 'beginner',
        duration: '4 weeks',
        xpReward: 500,
        modules: [
          {
            id: 1,
            title: 'Introduction to HTML',
            duration: 15,
            xp: 50,
            type: 'lesson',
            content: 'Welcome to HTML...',
            quiz: [
              {
                question: 'What does HTML stand for?',
                options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks Text Mark Language'],
                correct: 0
              }
            ]
          }
        ],
        order: 1
      },
      {
        title: 'Physics Fundamentals',
        subject: 'physics',
        description: 'Understand the laws of physics',
        difficulty: 'intermediate',
        duration: '6 weeks',
        xpReward: 750,
        modules: [],
        order: 2
      },
      {
        title: 'Mathematics for Everyone',
        subject: 'math',
        description: 'Master mathematical concepts',
        difficulty: 'beginner',
        duration: '8 weeks',
        xpReward: 800,
        modules: [],
        order: 3
      }
    ];
    
    await getCollection('courses').insertMany(sampleCourses);
    
    res.json({ success: true, message: 'Database seeded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ADMIN ROUTES ====================

// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await getCollection('users')
      .find(filter, { projection: { password: 0 } })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .toArray();
    
    const total = await getCollection('users').countDocuments(filter);
    
    res.json({ success: true, users, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create quiz (admin only)
app.post('/api/admin/quizzes', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { courseId, moduleId, title, questions, timeLimit, passingScore, xpReward } = req.body;
    
    const quiz = {
      courseId,
      moduleId,
      title,
      questions,
      timeLimit: timeLimit || 300,
      passingScore: passingScore || 70,
      xpReward: xpReward || 50,
      createdBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await getCollection('quizzes').insertOne(quiz);
    
    res.status(201).json({ success: true, quiz: { ...quiz, _id: result.insertedId } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update quiz (admin only)
app.put('/api/admin/quizzes/:quizId', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { quizId } = req.params;
    const updates = { ...req.body, updatedAt: new Date() };
    delete updates._id;
    
    const result = await getCollection('quizzes').findOneAndUpdate(
      { _id: new ObjectId(quizId) },
      { $set: updates },
      { returnDocument: 'after' }
    );
    
    res.json({ success: true, quiz: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all quizzes (admin)
app.get('/api/admin/quizzes', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const quizzes = await getCollection('quizzes').find({}).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, quizzes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete quiz (admin only)
app.delete('/api/admin/quizzes/:quizId', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    await getCollection('quizzes').deleteOne({ _id: new ObjectId(req.params.quizId) });
    res.json({ success: true, message: 'Quiz deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create job post (admin only)
app.post('/api/admin/jobs', authenticateToken, authorizeRoles('admin', 'client'), async (req, res) => {
  try {
    const { title, company, location, salary, type, skills, description, requirements } = req.body;
    
    const job = {
      title,
      company,
      location,
      salary,
      type,
      skills: skills || [],
      description,
      requirements: requirements || [],
      postedBy: req.user.userId,
      status: 'active',
      applications: 0,
      postedAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await getCollection('jobs').insertOne(job);
    
    res.status(201).json({ success: true, job: { ...job, _id: result.insertedId } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update job (admin/client)
app.put('/api/admin/jobs/:jobId', authenticateToken, authorizeRoles('admin', 'client'), async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date() };
    delete updates._id;
    
    const result = await getCollection('jobs').findOneAndUpdate(
      { _id: new ObjectId(req.params.jobId) },
      { $set: updates },
      { returnDocument: 'after' }
    );
    
    res.json({ success: true, job: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete job (admin/client)
app.delete('/api/admin/jobs/:jobId', authenticateToken, authorizeRoles('admin', 'client'), async (req, res) => {
  try {
    await getCollection('jobs').deleteOne({ _id: new ObjectId(req.params.jobId) });
    res.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create course (admin only)
app.post('/api/admin/courses', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const course = {
      ...req.body,
      createdBy: req.user.userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await getCollection('courses').insertOne(course);
    
    res.status(201).json({ success: true, course: { ...course, _id: result.insertedId } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update course (admin only)
app.put('/api/admin/courses/:courseId', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date() };
    delete updates._id;
    
    const result = await getCollection('courses').findOneAndUpdate(
      { _id: new ObjectId(req.params.courseId) },
      { $set: updates },
      { returnDocument: 'after' }
    );
    
    res.json({ success: true, course: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete course (admin only)
app.delete('/api/admin/courses/:courseId', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    await getCollection('courses').deleteOne({ _id: new ObjectId(req.params.courseId) });
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Manage subscriptions (admin only)
app.get('/api/admin/subscriptions', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const subscriptions = await getCollection('subscriptions').find({}).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/admin/subscriptions', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const subscription = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await getCollection('subscriptions').insertOne(subscription);
    res.status(201).json({ success: true, subscription: { ...subscription, _id: result.insertedId } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Content Generation (admin only)
app.post('/api/admin/ai/generate-quiz', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { topic, difficulty, numberOfQuestions, courseContext } = req.body;
    
    // Use Google Gemini API for quiz generation
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBnUFAPz5iJx57YxnMxffZyYLWwBuc5VCY';
    
    const prompt = `Generate a quiz about "${topic}" with ${numberOfQuestions || 5} multiple choice questions. 
    Difficulty level: ${difficulty || 'intermediate'}.
    ${courseContext ? `Context: ${courseContext}` : ''}
    
    Return the response as a valid JSON array with this exact structure:
    [
      {
        "question": "Question text here",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 0,
        "explanation": "Brief explanation of the correct answer"
      }
    ]
    
    Make sure questions are educational and the explanations are helpful for learning.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      })
    });

    const data = await response.json();
    let generatedQuestions = [];
    
    try {
      const textContent = data.candidates[0].content.parts[0].text;
      // Extract JSON from the response
      const jsonMatch = textContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        generatedQuestions = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return res.status(500).json({ success: false, error: 'Failed to parse AI response' });
    }

    res.json({ success: true, questions: generatedQuestions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Game/Challenge Generation (admin only)
app.post('/api/admin/ai/generate-challenge', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { type, topic, difficulty, language } = req.body;
    
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBnUFAPz5iJx57YxnMxffZyYLWwBuc5VCY';
    
    let prompt;
    if (type === 'code') {
      prompt = `Generate a coding challenge about "${topic}" in ${language || 'JavaScript'}.
      Difficulty: ${difficulty || 'intermediate'}.
      
      Return as JSON:
      {
        "title": "Challenge title",
        "description": "Detailed problem description",
        "starterCode": "function solution() {\\n  // Your code here\\n}",
        "testCases": [
          { "input": "test input", "expected": "expected output", "description": "Test case description" }
        ],
        "hints": ["Hint 1", "Hint 2"],
        "solution": "Complete solution code"
      }`;
    } else if (type === 'flashcard') {
      prompt = `Generate 10 flashcards about "${topic}" for ${difficulty || 'intermediate'} level learners.
      
      Return as JSON array:
      [
        {
          "front": "Question or term",
          "back": "Answer or definition",
          "hint": "Optional hint"
        }
      ]`;
    } else {
      prompt = `Generate a learning game/activity about "${topic}" for ${difficulty || 'intermediate'} level.
      
      Return as JSON:
      {
        "title": "Game title",
        "type": "matching|sorting|puzzle",
        "instructions": "How to play",
        "items": [],
        "correctAnswers": [],
        "xpReward": 50
      }`;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        }
      })
    });

    const data = await response.json();
    let generatedContent = null;
    
    try {
      const textContent = data.candidates[0].content.parts[0].text;
      const jsonMatch = textContent.match(/[\[{][\s\S]*[\]}]/);
      if (jsonMatch) {
        generatedContent = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return res.status(500).json({ success: false, error: 'Failed to parse AI response' });
    }

    res.json({ success: true, content: generatedContent });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get admin dashboard stats
app.get('/api/admin/stats', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [
      totalUsers,
      totalCourses,
      totalJobs,
      totalQuizzes,
      activeSubscriptions,
      recentUsers
    ] = await Promise.all([
      getCollection('users').countDocuments(),
      getCollection('courses').countDocuments(),
      getCollection('jobs').countDocuments(),
      getCollection('quizzes').countDocuments(),
      getCollection('users').countDocuments({ 'subscription.plan': { $ne: 'free' } }),
      getCollection('users').find({}, { projection: { password: 0 } }).sort({ createdAt: -1 }).limit(5).toArray()
    ]);

    // Calculate user growth (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsersThisMonth = await getCollection('users').countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCourses,
        totalJobs,
        totalQuizzes,
        activeSubscriptions,
        newUsersThisMonth,
        recentUsers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== CLIENT/EMPLOYER ROUTES ====================

// Get client's posted jobs
app.get('/api/client/jobs', authenticateToken, authorizeRoles('client', 'admin'), async (req, res) => {
  try {
    const jobs = await getCollection('jobs')
      .find({ postedBy: req.user.userId })
      .sort({ postedAt: -1 })
      .toArray();
    
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get applications for client's jobs
app.get('/api/client/applications', authenticateToken, authorizeRoles('client', 'admin'), async (req, res) => {
  try {
    // Get all jobs posted by this client
    const jobs = await getCollection('jobs')
      .find({ postedBy: req.user.userId })
      .toArray();
    
    const jobIds = jobs.map(j => j._id.toString());
    
    // Get applications for these jobs
    const applications = await getCollection('jobApplications')
      .find({ jobId: { $in: jobIds } })
      .sort({ appliedAt: -1 })
      .toArray();
    
    // Enrich with user and job info
    for (const app of applications) {
      const user = await getCollection('users').findOne(
        { _id: new ObjectId(app.userId) },
        { projection: { name: 1, email: 1, skills: 1 } }
      );
      app.applicant = user;
      app.job = jobs.find(j => j._id.toString() === app.jobId);
    }
    
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update application status (client)
app.put('/api/client/applications/:applicationId', authenticateToken, authorizeRoles('client', 'admin'), async (req, res) => {
  try {
    const { status, feedback } = req.body;
    
    const result = await getCollection('jobApplications').findOneAndUpdate(
      { _id: new ObjectId(req.params.applicationId) },
      { 
        $set: { 
          status, 
          feedback, 
          reviewedAt: new Date(),
          reviewedBy: req.user.userId 
        } 
      },
      { returnDocument: 'after' }
    );
    
    res.json({ success: true, application: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get client dashboard stats
app.get('/api/client/stats', authenticateToken, authorizeRoles('client', 'admin'), async (req, res) => {
  try {
    const jobs = await getCollection('jobs')
      .find({ postedBy: req.user.userId })
      .toArray();
    
    const jobIds = jobs.map(j => j._id.toString());
    
    const [totalApplications, pendingApplications] = await Promise.all([
      getCollection('jobApplications').countDocuments({ jobId: { $in: jobIds } }),
      getCollection('jobApplications').countDocuments({ jobId: { $in: jobIds }, status: 'pending' })
    ]);

    res.json({
      success: true,
      stats: {
        totalJobs: jobs.length,
        activeJobs: jobs.filter(j => j.status === 'active').length,
        totalApplications,
        pendingApplications
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== CLIENT PROJECTS ROUTES ====================

// Get client's projects (jobs that have been assigned to engineers)
app.get('/api/client/projects', authenticateToken, authorizeRoles('client', 'admin'), async (req, res) => {
  try {
    const projects = await getCollection('projects')
      .find({ clientId: req.user.userId })
      .sort({ createdAt: -1 })
      .toArray();
    
    // Enrich with job and engineer info
    for (const project of projects) {
      if (project.jobId) {
        const job = await getCollection('jobs').findOne({ _id: new ObjectId(project.jobId) });
        project.job = job;
      }
      if (project.engineerId) {
        const engineer = await getCollection('users').findOne(
          { _id: new ObjectId(project.engineerId) },
          { projection: { name: 1, email: 1, skills: 1 } }
        );
        project.engineer = engineer;
      }
    }
    
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single project details
app.get('/api/client/projects/:projectId', authenticateToken, authorizeRoles('client', 'admin'), async (req, res) => {
  try {
    const project = await getCollection('projects').findOne({
      _id: new ObjectId(req.params.projectId),
      clientId: req.user.userId
    });
    
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    
    // Enrich with related data
    if (project.jobId) {
      project.job = await getCollection('jobs').findOne({ _id: new ObjectId(project.jobId) });
    }
    if (project.engineerId) {
      project.engineer = await getCollection('users').findOne(
        { _id: new ObjectId(project.engineerId) },
        { projection: { name: 1, email: 1, skills: 1 } }
      );
    }
    
    // Get milestones
    project.milestones = await getCollection('milestones')
      .find({ projectId: project._id.toString() })
      .sort({ order: 1 })
      .toArray();
    
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== CLIENT MESSAGES ROUTES ====================

// Get client's messages (all go through admin)
app.get('/api/client/messages', authenticateToken, authorizeRoles('client', 'admin'), async (req, res) => {
  try {
    const messages = await getCollection('messages')
      .find({
        $or: [
          { senderId: req.user.userId },
          { recipientId: req.user.userId }
        ]
      })
      .sort({ createdAt: 1 })
      .toArray();
    
    // Enrich with sender info
    for (const msg of messages) {
      const sender = await getCollection('users').findOne(
        { _id: new ObjectId(msg.senderId) },
        { projection: { name: 1, email: 1, role: 1 } }
      );
      msg.sender = sender;
    }
    
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send message to admin
app.post('/api/client/messages', authenticateToken, authorizeRoles('client', 'admin'), async (req, res) => {
  try {
    const { content, projectId } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, error: 'Message content is required' });
    }
    
    // Find an admin to send to
    const admin = await getCollection('users').findOne({ role: 'admin' });
    
    if (!admin) {
      return res.status(404).json({ success: false, error: 'No admin available' });
    }
    
    const sender = await getCollection('users').findOne(
      { _id: new ObjectId(req.user.userId) },
      { projection: { name: 1, email: 1, role: 1 } }
    );
    
    const newMessage = {
      senderId: req.user.userId,
      recipientId: admin._id.toString(),
      content,
      projectId: projectId || null,
      senderRole: 'client',
      recipientRole: 'admin',
      read: false,
      createdAt: new Date()
    };
    
    const result = await getCollection('messages').insertOne(newMessage);
    
    res.status(201).json({
      success: true,
      message: {
        ...newMessage,
        _id: result.insertedId,
        sender
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark messages as read
app.put('/api/client/messages/read', authenticateToken, authorizeRoles('client', 'admin'), async (req, res) => {
  try {
    await getCollection('messages').updateMany(
      { recipientId: req.user.userId, read: false },
      { $set: { read: true, readAt: new Date() } }
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get unread message count
app.get('/api/client/messages/unread', authenticateToken, authorizeRoles('client', 'admin'), async (req, res) => {
  try {
    const count = await getCollection('messages').countDocuments({
      recipientId: req.user.userId,
      read: false
    });
    
    res.json({ success: true, unreadCount: count });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== CLIENT PAYMENTS ROUTES ====================

// Get client's payment history
app.get('/api/client/payments', authenticateToken, authorizeRoles('client', 'admin'), async (req, res) => {
  try {
    const payments = await getCollection('payments')
      .find({ clientId: req.user.userId })
      .sort({ createdAt: -1 })
      .toArray();
    
    // Enrich with project info
    for (const payment of payments) {
      if (payment.projectId) {
        const project = await getCollection('projects').findOne({ _id: new ObjectId(payment.projectId) });
        payment.project = project;
      }
    }
    
    // Calculate totals
    const totals = {
      escrow: payments.filter(p => p.status === 'escrow').reduce((sum, p) => sum + p.amount, 0),
      paid: payments.filter(p => p.status === 'released').reduce((sum, p) => sum + p.amount, 0),
      pending: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)
    };
    
    res.json({ success: true, payments, totals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create payment (escrow)
app.post('/api/client/payments', authenticateToken, authorizeRoles('client', 'admin'), async (req, res) => {
  try {
    const { projectId, amount, description, milestoneId } = req.body;
    
    if (!projectId || !amount) {
      return res.status(400).json({ success: false, error: 'Project and amount are required' });
    }
    
    // Verify project belongs to client
    const project = await getCollection('projects').findOne({
      _id: new ObjectId(projectId),
      clientId: req.user.userId
    });
    
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    
    const newPayment = {
      clientId: req.user.userId,
      projectId,
      milestoneId: milestoneId || null,
      amount: parseFloat(amount),
      description: description || 'Milestone payment',
      status: 'escrow', // escrow, released, refunded, pending
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await getCollection('payments').insertOne(newPayment);
    
    res.status(201).json({
      success: true,
      payment: { ...newPayment, _id: result.insertedId }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get payment summary for client
app.get('/api/client/payments/summary', authenticateToken, authorizeRoles('client', 'admin'), async (req, res) => {
  try {
    const payments = await getCollection('payments')
      .find({ clientId: req.user.userId })
      .toArray();
    
    const summary = {
      totalSpent: payments.filter(p => p.status === 'released').reduce((sum, p) => sum + p.amount, 0),
      inEscrow: payments.filter(p => p.status === 'escrow').reduce((sum, p) => sum + p.amount, 0),
      pendingRelease: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
      totalPayments: payments.length,
      recentPayments: payments.slice(0, 5)
    };
    
    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== ADMIN PROJECT MANAGEMENT ====================

// Admin: Create project from approved job
app.post('/api/admin/projects', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { jobId, clientId, engineerId, title, description, budget, deadline } = req.body;
    
    if (!clientId || !title) {
      return res.status(400).json({ success: false, error: 'Client and title are required' });
    }
    
    const newProject = {
      jobId: jobId || null,
      clientId,
      engineerId: engineerId || null,
      title,
      description: description || '',
      budget: parseFloat(budget) || 0,
      deadline: deadline ? new Date(deadline) : null,
      status: 'PENDING_REVIEW', // PENDING_REVIEW, IN_PROGRESS, REVIEW, COMPLETED, CANCELLED
      progress: 0,
      milestones: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await getCollection('projects').insertOne(newProject);
    
    // Update job status if linked
    if (jobId) {
      await getCollection('jobs').updateOne(
        { _id: new ObjectId(jobId) },
        { $set: { status: 'in-progress', assignedProjectId: result.insertedId.toString() } }
      );
    }
    
    res.status(201).json({
      success: true,
      project: { ...newProject, _id: result.insertedId }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Update project (assign engineer, update status, progress)
app.put('/api/admin/projects/:projectId', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { engineerId, status, progress, notes } = req.body;
    
    const updates = { updatedAt: new Date() };
    if (engineerId !== undefined) updates.engineerId = engineerId;
    if (status !== undefined) updates.status = status;
    if (progress !== undefined) updates.progress = parseInt(progress);
    if (notes !== undefined) updates.adminNotes = notes;
    
    const result = await getCollection('projects').findOneAndUpdate(
      { _id: new ObjectId(req.params.projectId) },
      { $set: updates },
      { returnDocument: 'after' }
    );
    
    res.json({ success: true, project: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Get all projects
app.get('/api/admin/projects', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const projects = await getCollection('projects')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    // Enrich with client and engineer info
    for (const project of projects) {
      if (project.clientId) {
        const client = await getCollection('users').findOne(
          { _id: new ObjectId(project.clientId) },
          { projection: { name: 1, email: 1 } }
        );
        project.client = client;
      }
      if (project.engineerId) {
        const engineer = await getCollection('users').findOne(
          { _id: new ObjectId(project.engineerId) },
          { projection: { name: 1, email: 1, skills: 1 } }
        );
        project.engineer = engineer;
      }
    }
    
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Add milestone to project
app.post('/api/admin/projects/:projectId/milestones', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { title, description, amount, dueDate, order } = req.body;
    
    const milestone = {
      projectId: req.params.projectId,
      title,
      description: description || '',
      amount: parseFloat(amount) || 0,
      dueDate: dueDate ? new Date(dueDate) : null,
      order: order || 0,
      status: 'pending', // pending, in-progress, completed
      createdAt: new Date()
    };
    
    const result = await getCollection('milestones').insertOne(milestone);
    
    res.status(201).json({
      success: true,
      milestone: { ...milestone, _id: result.insertedId }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Update milestone status
app.put('/api/admin/milestones/:milestoneId', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { status, completedAt } = req.body;
    
    const updates = { status, updatedAt: new Date() };
    if (status === 'completed') {
      updates.completedAt = completedAt || new Date();
    }
    
    const result = await getCollection('milestones').findOneAndUpdate(
      { _id: new ObjectId(req.params.milestoneId) },
      { $set: updates },
      { returnDocument: 'after' }
    );
    
    // Update project progress based on milestones
    if (result && result.projectId) {
      const milestones = await getCollection('milestones')
        .find({ projectId: result.projectId })
        .toArray();
      
      const completedCount = milestones.filter(m => m.status === 'completed').length;
      const progress = Math.round((completedCount / milestones.length) * 100);
      
      await getCollection('projects').updateOne(
        { _id: new ObjectId(result.projectId) },
        { $set: { progress } }
      );
    }
    
    res.json({ success: true, milestone: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Release payment from escrow
app.put('/api/admin/payments/:paymentId/release', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await getCollection('payments').findOneAndUpdate(
      { _id: new ObjectId(req.params.paymentId) },
      { 
        $set: { 
          status: 'released', 
          releasedAt: new Date(),
          releasedBy: req.user.userId 
        } 
      },
      { returnDocument: 'after' }
    );
    
    res.json({ success: true, payment: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Get all payments
app.get('/api/admin/payments', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const payments = await getCollection('payments')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    // Enrich with client and project info
    for (const payment of payments) {
      if (payment.clientId) {
        const client = await getCollection('users').findOne(
          { _id: new ObjectId(payment.clientId) },
          { projection: { name: 1, email: 1 } }
        );
        payment.client = client;
      }
      if (payment.projectId) {
        const project = await getCollection('projects').findOne({ _id: new ObjectId(payment.projectId) });
        payment.project = project;
      }
    }
    
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Get all messages (for moderation)
app.get('/api/admin/messages', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const messages = await getCollection('messages')
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    
    // Enrich with sender and recipient info
    for (const msg of messages) {
      if (msg.senderId) {
        msg.sender = await getCollection('users').findOne(
          { _id: new ObjectId(msg.senderId) },
          { projection: { name: 1, email: 1, role: 1 } }
        );
      }
      if (msg.recipientId) {
        msg.recipient = await getCollection('users').findOne(
          { _id: new ObjectId(msg.recipientId) },
          { projection: { name: 1, email: 1, role: 1 } }
        );
      }
    }
    
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Send message (to client or engineer)
app.post('/api/admin/messages', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { recipientId, content, projectId } = req.body;
    
    if (!recipientId || !content) {
      return res.status(400).json({ success: false, error: 'Recipient and content are required' });
    }
    
    const recipient = await getCollection('users').findOne({ _id: new ObjectId(recipientId) });
    
    if (!recipient) {
      return res.status(404).json({ success: false, error: 'Recipient not found' });
    }
    
    const newMessage = {
      senderId: req.user.userId,
      recipientId,
      content,
      projectId: projectId || null,
      senderRole: 'admin',
      recipientRole: recipient.role,
      read: false,
      createdAt: new Date()
    };
    
    const result = await getCollection('messages').insertOne(newMessage);
    
    res.status(201).json({
      success: true,
      message: { ...newMessage, _id: result.insertedId }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== WALLET & ECOCASH ROUTES ====================

// Get user wallet
app.get('/api/wallet', authenticateToken, async (req, res) => {
  try {
    const users = getCollection('users');
    const transactions = getCollection('transactions');

    const user = await users.findOne({ _id: new ObjectId(req.user.id) });
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Get user transactions
    const userTransactions = await transactions
      .find({ userId: new ObjectId(req.user.id) })
      .sort({ date: -1 })
      .limit(20)
      .toArray();

    res.json({
      success: true,
      wallet: {
        balance: user.walletBalance || 0,
        pendingBalance: user.pendingBalance || 0,
        xp: user.xp || 0,
        ecocashConnected: user.ecocashConnected || false,
        ecocashNumber: user.ecocashNumber || null,
        transactions: userTransactions
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Connect EcoCash - Send OTP
app.post('/api/wallet/ecocash/connect', authenticateToken, async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    // Validate Zimbabwean phone number
    if (!phoneNumber || !/^(\+263|0)7[1-9]\d{7}$/.test(phoneNumber)) {
      return res.status(400).json({ success: false, error: 'Invalid Zimbabwean phone number' });
    }

    // Normalize phone number to international format
    const normalizedPhone = phoneNumber.startsWith('+263') 
      ? phoneNumber 
      : '+263' + phoneNumber.substring(1);

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP temporarily in user record
    const users = getCollection('users');
    await users.updateOne(
      { _id: new ObjectId(req.user.id) },
      { 
        $set: { 
          pendingEcocashNumber: normalizedPhone,
          ecocashOtp: otp,
          ecocashOtpExpiry: otpExpiry
        }
      }
    );

    // In production, send OTP via SMS
    // For demo, we'll accept any 4-digit OTP
    console.log(`[DEMO] OTP for ${normalizedPhone}: ${otp}`);

    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      // Remove this in production:
      demoOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify EcoCash OTP
app.post('/api/wallet/ecocash/verify', authenticateToken, async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    const users = getCollection('users');
    const user = await users.findOne({ _id: new ObjectId(req.user.id) });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Verify OTP (in demo mode, accept any 4-digit OTP)
    const isDemo = process.env.NODE_ENV !== 'production';
    const isValidOtp = isDemo 
      ? otp && otp.length === 4 
      : user.ecocashOtp === otp && new Date() < new Date(user.ecocashOtpExpiry);

    if (!isValidOtp) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    // Update user with verified EcoCash number
    await users.updateOne(
      { _id: new ObjectId(req.user.id) },
      { 
        $set: { 
          ecocashConnected: true,
          ecocashNumber: user.pendingEcocashNumber || phoneNumber
        },
        $unset: {
          pendingEcocashNumber: '',
          ecocashOtp: '',
          ecocashOtpExpiry: ''
        }
      }
    );

    res.json({ 
      success: true, 
      message: 'EcoCash account connected successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Deposit via EcoCash
app.post('/api/wallet/ecocash/deposit', authenticateToken, async (req, res) => {
  try {
    const { amount, phoneNumber } = req.body;

    // Validate amount
    if (!amount || amount < 1 || amount > 1000) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid amount. Min: $1, Max: $1,000' 
      });
    }

    const users = getCollection('users');
    const transactions = getCollection('transactions');

    const user = await users.findOne({ _id: new ObjectId(req.user.id) });
    if (!user || !user.ecocashConnected) {
      return res.status(400).json({ 
        success: false, 
        error: 'EcoCash account not connected' 
      });
    }

    // Generate reference number
    const reference = 'ECO' + Date.now() + Math.random().toString(36).substring(2, 6).toUpperCase();

    // In production, this would call the EcoCash API
    // For demo, we simulate the transaction

    // Create transaction record
    const transaction = {
      userId: new ObjectId(req.user.id),
      type: 'deposit',
      amount: parseFloat(amount),
      description: 'EcoCash Deposit',
      status: 'completed',
      date: new Date(),
      reference: reference,
      ecocashNumber: user.ecocashNumber
    };

    await transactions.insertOne(transaction);

    // Update user balance
    await users.updateOne(
      { _id: new ObjectId(req.user.id) },
      { $inc: { walletBalance: parseFloat(amount) } }
    );

    res.json({
      success: true,
      message: 'Deposit successful',
      reference: reference,
      newBalance: (user.walletBalance || 0) + parseFloat(amount)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Withdraw to EcoCash
app.post('/api/wallet/ecocash/withdraw', authenticateToken, async (req, res) => {
  try {
    const { amount } = req.body;

    // Validate amount
    if (!amount || amount < 1) {
      return res.status(400).json({ 
        success: false, 
        error: 'Minimum withdrawal is $1' 
      });
    }

    const users = getCollection('users');
    const transactions = getCollection('transactions');

    const user = await users.findOne({ _id: new ObjectId(req.user.id) });
    if (!user || !user.ecocashConnected) {
      return res.status(400).json({ 
        success: false, 
        error: 'EcoCash account not connected' 
      });
    }

    if ((user.walletBalance || 0) < amount) {
      return res.status(400).json({ 
        success: false, 
        error: 'Insufficient balance' 
      });
    }

    // Generate reference number
    const reference = 'WITHDRAW' + Date.now() + Math.random().toString(36).substring(2, 6).toUpperCase();

    // Create transaction record
    const transaction = {
      userId: new ObjectId(req.user.id),
      type: 'withdrawal',
      amount: -parseFloat(amount),
      description: 'EcoCash Withdrawal',
      status: 'completed',
      date: new Date(),
      reference: reference,
      ecocashNumber: user.ecocashNumber
    };

    await transactions.insertOne(transaction);

    // Update user balance
    await users.updateOne(
      { _id: new ObjectId(req.user.id) },
      { $inc: { walletBalance: -parseFloat(amount) } }
    );

    res.json({
      success: true,
      message: `$${amount.toFixed(2)} withdrawn to ${user.ecocashNumber}`,
      reference: reference,
      newBalance: (user.walletBalance || 0) - parseFloat(amount)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get transaction history
app.get('/api/wallet/transactions', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const transactions = getCollection('transactions');

    const userTransactions = await transactions
      .find({ userId: new ObjectId(req.user.id) })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .toArray();

    const total = await transactions.countDocuments({ userId: new ObjectId(req.user.id) });

    res.json({
      success: true,
      transactions: userTransactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is running', 
    timestamp: new Date(),
    database: db ? 'connected' : 'disconnected'
  });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  if (client) {
    await client.close();
  }
  process.exit(0);
});

