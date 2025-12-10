const express = require('express');
const serverless = require('serverless-http');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'e-novate-super-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URL = process.env.REACT_APP_MONGO_URL || process.env.MONGO_URL;
const DB_NAME = process.env.REACT_APP_MONGODB_DB_NAME || process.env.MONGODB_DB_NAME || 'e-novate';

let cachedDb = null;

async function connectDB() {
  if (cachedDb) {
    return cachedDb;
  }
  
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  cachedDb = client.db(DB_NAME);
  console.log('✅ Connected to MongoDB:', DB_NAME);
  return cachedDb;
}

// Helper to get collection
const getCollection = async (name) => {
  const db = await connectDB();
  return db.collection(name);
};

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

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'E-Novate API is running', timestamp: new Date().toISOString() });
});

// ==================== AUTHENTICATION ROUTES ====================

// Register new user
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, phoneNumber, password, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    const validRoles = ['student', 'client', 'admin'];
    const userRole = validRoles.includes(role) ? role : 'student';

    const usersCollection = await getCollection('users');
    const existingUser = await usersCollection.findOne({
      $or: [{ email }, ...(phoneNumber ? [{ phoneNumber }] : [])]
    });

    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

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

    const result = await usersCollection.insertOne(newUser);
    const userId = result.insertedId;

    const token = jwt.sign(
      { userId: userId.toString(), email, role: userRole },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

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

    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

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
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({
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

// Get or create user (legacy auth)
app.post('/api/users/auth', async (req, res) => {
  try {
    const { phoneNumber, email, name } = req.body;
    const usersCollection = await getCollection('users');
    
    let user = await usersCollection.findOne({
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
      
      const result = await usersCollection.insertOne(newUser);
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
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ 
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
    
    const usersCollection = await getCollection('users');
    const result = await usersCollection.findOneAndUpdate(
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
    
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(req.params.userId) },
      { 
        $inc: { xp: amount },
        $set: { updatedAt: new Date() }
      },
      { returnDocument: 'after' }
    );
    
    const xpCollection = await getCollection('xpHistory');
    await xpCollection.insertOne({
      userId: new ObjectId(req.params.userId),
      amount,
      reason,
      timestamp: new Date()
    });
    
    const newLevel = Math.floor(user.xp / 100) + 1;
    if (newLevel > user.level) {
      await usersCollection.updateOne(
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

app.get('/api/progress/:userId', async (req, res) => {
  try {
    const progressCollection = await getCollection('learningProgress');
    const progress = await progressCollection
      .find({ userId: new ObjectId(req.params.userId) })
      .toArray();
    
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

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
    
    const progressCollection = await getCollection('learningProgress');
    const result = await progressCollection.findOneAndUpdate(
      { userId: new ObjectId(userId), courseId, moduleId },
      { 
        $set: progressData,
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true, returnDocument: 'after' }
    );
    
    res.json({ success: true, progress: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== QUIZ ROUTES ====================

app.post('/api/quiz/results', async (req, res) => {
  try {
    const { userId, quizId, courseId, score, answers, timeSpent } = req.body;
    
    const quizCollection = await getCollection('quizResults');
    const result = await quizCollection.insertOne({
      userId: new ObjectId(userId),
      quizId,
      courseId,
      score,
      answers,
      timeSpent,
      completedAt: new Date()
    });
    
    res.json({ success: true, resultId: result.insertedId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/quiz/history/:userId', async (req, res) => {
  try {
    const quizCollection = await getCollection('quizResults');
    const history = await quizCollection
      .find({ userId: new ObjectId(req.params.userId) })
      .sort({ completedAt: -1 })
      .toArray();
    
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== CODE SUBMISSION ROUTES ====================

app.post('/api/code/submit', async (req, res) => {
  try {
    const { userId, challengeId, code, language, passed, testResults } = req.body;
    
    const codeCollection = await getCollection('codeSubmissions');
    const result = await codeCollection.insertOne({
      userId: new ObjectId(userId),
      challengeId,
      code,
      language,
      passed,
      testResults,
      submittedAt: new Date()
    });
    
    res.json({ success: true, submissionId: result.insertedId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/code/history/:userId', async (req, res) => {
  try {
    const codeCollection = await getCollection('codeSubmissions');
    const history = await codeCollection
      .find({ userId: new ObjectId(req.params.userId) })
      .sort({ submittedAt: -1 })
      .toArray();
    
    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== JOBS ROUTES ====================

app.get('/api/jobs', async (req, res) => {
  try {
    const { category, location, type, search } = req.query;
    const query = { status: 'active' };
    
    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const jobsCollection = await getCollection('jobs');
    const jobs = await jobsCollection.find(query).sort({ createdAt: -1 }).toArray();
    
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/jobs/apply', async (req, res) => {
  try {
    const { userId, jobId, coverLetter, resume } = req.body;
    
    const applicationsCollection = await getCollection('jobApplications');
    const existingApplication = await applicationsCollection.findOne({
      userId: new ObjectId(userId),
      jobId: new ObjectId(jobId)
    });
    
    if (existingApplication) {
      return res.status(400).json({ success: false, error: 'Already applied to this job' });
    }
    
    const result = await applicationsCollection.insertOne({
      userId: new ObjectId(userId),
      jobId: new ObjectId(jobId),
      coverLetter,
      resume,
      status: 'pending',
      appliedAt: new Date()
    });
    
    res.json({ success: true, applicationId: result.insertedId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/jobs/applications/:userId', async (req, res) => {
  try {
    const applicationsCollection = await getCollection('jobApplications');
    const applications = await applicationsCollection
      .find({ userId: new ObjectId(req.params.userId) })
      .toArray();
    
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== METRICS ROUTES ====================

app.post('/api/metrics/event', async (req, res) => {
  try {
    const { userId, eventType, eventData, sessionId } = req.body;
    
    const metricsCollection = await getCollection('metrics');
    await metricsCollection.insertOne({
      userId: userId ? new ObjectId(userId) : null,
      eventType,
      eventData,
      sessionId,
      timestamp: new Date()
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/metrics/summary/:userId', async (req, res) => {
  try {
    const metricsCollection = await getCollection('metrics');
    const progressCollection = await getCollection('learningProgress');
    const quizCollection = await getCollection('quizResults');
    
    const userId = new ObjectId(req.params.userId);
    
    const totalTimeSpent = await metricsCollection.aggregate([
      { $match: { userId, eventType: 'session_end' } },
      { $group: { _id: null, total: { $sum: '$eventData.duration' } } }
    ]).toArray();
    
    const coursesCompleted = await progressCollection.countDocuments({ 
      userId, completed: true 
    });
    
    const quizzesTaken = await quizCollection.countDocuments({ userId });
    
    const avgQuizScore = await quizCollection.aggregate([
      { $match: { userId } },
      { $group: { _id: null, avg: { $avg: '$score' } } }
    ]).toArray();
    
    res.json({
      success: true,
      summary: {
        totalTimeSpent: totalTimeSpent[0]?.total || 0,
        coursesCompleted,
        quizzesTaken,
        avgQuizScore: avgQuizScore[0]?.avg || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== LEADERBOARD ROUTES ====================

app.get('/api/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const usersCollection = await getCollection('users');
    const leaderboard = await usersCollection
      .find({}, { projection: { password: 0 } })
      .sort({ xp: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    res.json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== FEED ROUTES ====================

app.post('/api/feed/posts', async (req, res) => {
  try {
    const { userId, content, type, tags } = req.body;
    
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    const feedCollection = await getCollection('feedPosts');
    const result = await feedCollection.insertOne({
      userId: new ObjectId(userId),
      userName: user?.name || 'Anonymous',
      userAvatar: user?.avatar || null,
      content,
      type: type || 'post',
      tags: tags || [],
      likes: [],
      comments: [],
      createdAt: new Date()
    });
    
    res.json({ success: true, postId: result.insertedId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/feed/posts', async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const query = {};
    if (type) query.type = type;
    
    const feedCollection = await getCollection('feedPosts');
    const posts = await feedCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .toArray();
    
    const total = await feedCollection.countDocuments(query);
    
    res.json({ 
      success: true, 
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/feed/posts/:postId/like', async (req, res) => {
  try {
    const { userId } = req.body;
    const postId = new ObjectId(req.params.postId);
    
    const feedCollection = await getCollection('feedPosts');
    const post = await feedCollection.findOne({ _id: postId });
    
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }
    
    const userIdObj = new ObjectId(userId);
    const alreadyLiked = post.likes.some(id => id.toString() === userId);
    
    if (alreadyLiked) {
      await feedCollection.updateOne(
        { _id: postId },
        { $pull: { likes: userIdObj } }
      );
    } else {
      await feedCollection.updateOne(
        { _id: postId },
        { $addToSet: { likes: userIdObj } }
      );
    }
    
    res.json({ success: true, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/feed/posts/:postId/comment', async (req, res) => {
  try {
    const { userId, content } = req.body;
    const postId = new ObjectId(req.params.postId);
    
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    
    const comment = {
      _id: new ObjectId(),
      userId: new ObjectId(userId),
      userName: user?.name || 'Anonymous',
      content,
      createdAt: new Date()
    };
    
    const feedCollection = await getCollection('feedPosts');
    await feedCollection.updateOne(
      { _id: postId },
      { $push: { comments: comment } }
    );
    
    res.json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== BADGES ROUTES ====================

app.post('/api/badges/check/:userId', async (req, res) => {
  try {
    const userId = new ObjectId(req.params.userId);
    
    const usersCollection = await getCollection('users');
    const user = await usersCollection.findOne({ _id: userId });
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    const newBadges = [];
    const currentBadges = user.badges || [];
    
    // Check for various badge conditions
    if (user.xp >= 100 && !currentBadges.includes('first_100_xp')) {
      newBadges.push('first_100_xp');
    }
    if (user.xp >= 500 && !currentBadges.includes('xp_master')) {
      newBadges.push('xp_master');
    }
    if (user.streak >= 7 && !currentBadges.includes('week_streak')) {
      newBadges.push('week_streak');
    }
    if ((user.completedCourses?.length || 0) >= 1 && !currentBadges.includes('first_course')) {
      newBadges.push('first_course');
    }
    if ((user.completedCourses?.length || 0) >= 5 && !currentBadges.includes('course_master')) {
      newBadges.push('course_master');
    }
    
    if (newBadges.length > 0) {
      await usersCollection.updateOne(
        { _id: userId },
        { $addToSet: { badges: { $each: newBadges } } }
      );
    }
    
    res.json({ success: true, newBadges, allBadges: [...currentBadges, ...newBadges] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== COURSES ROUTES ====================

app.get('/api/courses', async (req, res) => {
  try {
    const { category, level, search } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (level) query.level = level;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const coursesCollection = await getCollection('courses');
    const courses = await coursesCollection.find(query).toArray();
    
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/courses/:courseId', async (req, res) => {
  try {
    const coursesCollection = await getCollection('courses');
    const course = await coursesCollection.findOne({ 
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

// ==================== ADMIN ROUTES ====================

app.get('/api/admin/stats', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const usersCollection = await getCollection('users');
    const jobsCollection = await getCollection('jobs');
    const coursesCollection = await getCollection('courses');
    const applicationsCollection = await getCollection('jobApplications');
    
    const totalUsers = await usersCollection.countDocuments();
    const totalJobs = await jobsCollection.countDocuments();
    const totalCourses = await coursesCollection.countDocuments();
    const totalApplications = await applicationsCollection.countDocuments();
    
    const newUsersThisWeek = await usersCollection.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    const activeUsers = await usersCollection.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        totalJobs,
        totalCourses,
        totalApplications,
        newUsersThisWeek,
        activeUsers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/admin/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    
    const usersCollection = await getCollection('users');
    const users = await usersCollection
      .find(query, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .toArray();
    
    const total = await usersCollection.countDocuments(query);
    
    res.json({ success: true, users, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Jobs
app.post('/api/admin/jobs', authenticateToken, authorizeRoles('admin', 'client'), async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      createdBy: new ObjectId(req.user.userId),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const jobsCollection = await getCollection('jobs');
    const result = await jobsCollection.insertOne(jobData);
    
    res.status(201).json({ success: true, jobId: result.insertedId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/admin/jobs/:jobId', authenticateToken, authorizeRoles('admin', 'client'), async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date() };
    delete updates._id;
    
    const jobsCollection = await getCollection('jobs');
    await jobsCollection.updateOne(
      { _id: new ObjectId(req.params.jobId) },
      { $set: updates }
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/admin/jobs/:jobId', authenticateToken, authorizeRoles('admin', 'client'), async (req, res) => {
  try {
    const jobsCollection = await getCollection('jobs');
    await jobsCollection.deleteOne({ _id: new ObjectId(req.params.jobId) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin Courses
app.post('/api/admin/courses', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const courseData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const coursesCollection = await getCollection('courses');
    const result = await coursesCollection.insertOne(courseData);
    
    res.status(201).json({ success: true, courseId: result.insertedId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/admin/courses/:courseId', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const updates = { ...req.body, updatedAt: new Date() };
    delete updates._id;
    
    const coursesCollection = await getCollection('courses');
    await coursesCollection.updateOne(
      { _id: new ObjectId(req.params.courseId) },
      { $set: updates }
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/admin/courses/:courseId', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const coursesCollection = await getCollection('courses');
    await coursesCollection.deleteOne({ _id: new ObjectId(req.params.courseId) });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== WALLET ROUTES ====================

app.get('/api/wallet', authenticateToken, async (req, res) => {
  try {
    const walletsCollection = await getCollection('wallets');
    let wallet = await walletsCollection.findOne({ userId: new ObjectId(req.user.userId) });
    
    if (!wallet) {
      wallet = {
        userId: new ObjectId(req.user.userId),
        balance: 0,
        currency: 'USD',
        ecocashLinked: false,
        ecocashNumber: null,
        transactions: [],
        createdAt: new Date()
      };
      await walletsCollection.insertOne(wallet);
    }
    
    res.json({ success: true, wallet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/wallet/ecocash/connect', authenticateToken, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const otpCollection = await getCollection('otpVerifications');
    await otpCollection.insertOne({
      userId: new ObjectId(req.user.userId),
      phoneNumber,
      otp,
      type: 'ecocash_link',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      createdAt: new Date()
    });
    
    // In production, send OTP via SMS
    console.log(`OTP for ${phoneNumber}: ${otp}`);
    
    res.json({ success: true, message: 'OTP sent to your phone' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/wallet/ecocash/verify', authenticateToken, async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    
    const otpCollection = await getCollection('otpVerifications');
    const verification = await otpCollection.findOne({
      userId: new ObjectId(req.user.userId),
      phoneNumber,
      otp,
      type: 'ecocash_link',
      expiresAt: { $gt: new Date() }
    });
    
    if (!verification) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }
    
    const walletsCollection = await getCollection('wallets');
    await walletsCollection.updateOne(
      { userId: new ObjectId(req.user.userId) },
      { 
        $set: { 
          ecocashLinked: true, 
          ecocashNumber: phoneNumber,
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    );
    
    await otpCollection.deleteOne({ _id: verification._id });
    
    res.json({ success: true, message: 'EcoCash linked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/wallet/transactions', authenticateToken, async (req, res) => {
  try {
    const transactionsCollection = await getCollection('transactions');
    const transactions = await transactionsCollection
      .find({ userId: new ObjectId(req.user.userId) })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    
    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== CLIENT ROUTES ====================

app.get('/api/client/jobs', authenticateToken, authorizeRoles('client', 'admin'), async (req, res) => {
  try {
    const jobsCollection = await getCollection('jobs');
    const jobs = await jobsCollection
      .find({ createdBy: new ObjectId(req.user.userId) })
      .sort({ createdAt: -1 })
      .toArray();
    
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/client/applications', authenticateToken, authorizeRoles('client', 'admin'), async (req, res) => {
  try {
    const jobsCollection = await getCollection('jobs');
    const applicationsCollection = await getCollection('jobApplications');
    
    const clientJobs = await jobsCollection
      .find({ createdBy: new ObjectId(req.user.userId) })
      .toArray();
    
    const jobIds = clientJobs.map(job => job._id);
    
    const applications = await applicationsCollection
      .find({ jobId: { $in: jobIds } })
      .toArray();
    
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/client/applications/:applicationId', authenticateToken, authorizeRoles('client', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    
    const applicationsCollection = await getCollection('jobApplications');
    await applicationsCollection.updateOne(
      { _id: new ObjectId(req.params.applicationId) },
      { $set: { status, updatedAt: new Date() } }
    );
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/client/stats', authenticateToken, authorizeRoles('client', 'admin'), async (req, res) => {
  try {
    const jobsCollection = await getCollection('jobs');
    const applicationsCollection = await getCollection('jobApplications');
    
    const clientJobs = await jobsCollection
      .find({ createdBy: new ObjectId(req.user.userId) })
      .toArray();
    
    const jobIds = clientJobs.map(job => job._id);
    
    const totalJobs = clientJobs.length;
    const totalApplications = await applicationsCollection.countDocuments({ jobId: { $in: jobIds } });
    const pendingApplications = await applicationsCollection.countDocuments({ 
      jobId: { $in: jobIds }, 
      status: 'pending' 
    });
    
    res.json({
      success: true,
      stats: {
        totalJobs,
        totalApplications,
        pendingApplications
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Export the serverless function
module.exports.handler = serverless(app);
