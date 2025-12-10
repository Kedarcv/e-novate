const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URL = process.env.REACT_APP_MONGO_URL || 'mongodb+srv://cvlised360:Cvlised%40360@musika.dogjv.mongodb.net/e-novate';
const DB_NAME = process.env.REACT_APP_MONGODB_DB_NAME || 'e-novate';

async function seedDatabase() {
  const client = new MongoClient(MONGO_URL);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB for seeding');

    // ==================== SEED USERS ====================
    console.log('\n📦 Seeding users...');
    const usersCollection = db.collection('users');
    
    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('Admin@123', salt);
    const clientPassword = await bcrypt.hash('Client@123', salt);
    const studentPassword = await bcrypt.hash('Student@123', salt);

    const users = [
      {
        name: 'Admin User',
        email: 'admin@enovate.com',
        phoneNumber: '+263771234567',
        password: adminPassword,
        role: 'admin',
        avatar: '👨‍💼',
        isActive: true,
        xp: 10000,
        level: 50,
        badges: ['Admin', 'Founder', 'Mentor'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Client Company',
        email: 'client@company.com',
        phoneNumber: '+263772345678',
        password: clientPassword,
        role: 'client',
        avatar: '🏢',
        companyName: 'Tech Solutions Inc.',
        industry: 'Technology',
        isActive: true,
        jobsPosted: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'John Student',
        email: 'student@example.com',
        phoneNumber: '+263773456789',
        password: studentPassword,
        role: 'student',
        avatar: '🎓',
        isActive: true,
        xp: 1500,
        level: 8,
        badges: ['Beginner', 'Python Starter', 'Quick Learner'],
        enrolledCourses: ['python', 'ai', 'web-dev'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Jane Developer',
        email: 'jane@example.com',
        phoneNumber: '+263774567890',
        password: studentPassword,
        role: 'student',
        avatar: '👩‍💻',
        isActive: true,
        xp: 4500,
        level: 22,
        badges: ['Intermediate', 'Code Master', 'AI Explorer', 'Community Helper'],
        enrolledCourses: ['python', 'ai', 'data-science', 'machine-learning'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Demo User',
        email: 'demo@enovate.com',
        phoneNumber: '+263775678901',
        password: await bcrypt.hash('Demo@123', salt),
        role: 'student',
        avatar: '🚀',
        isActive: true,
        xp: 250,
        level: 2,
        badges: ['Newcomer'],
        enrolledCourses: ['python'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Upsert users (update if exists, insert if not)
    for (const user of users) {
      await usersCollection.updateOne(
        { email: user.email },
        { $set: user },
        { upsert: true }
      );
    }
    console.log(`✅ Seeded ${users.length} users`);

    // ==================== SEED COURSES ====================
    console.log('\n📦 Seeding courses...');
    const coursesCollection = db.collection('courses');

    const courses = [
      {
        id: 'python',
        title: 'Python Mastery',
        description: 'Complete Python programming from basics to advanced concepts',
        icon: '🐍',
        color: '#3776ab',
        difficulty: 'beginner',
        duration: '40 hours',
        xpReward: 2000,
        modules: 12,
        enrolled: 1250,
        rating: 4.8,
        instructor: 'Dr. Sarah Python',
        tags: ['programming', 'python', 'scripting', 'automation'],
        prerequisites: [],
        learningOutcomes: [
          'Master Python syntax and fundamentals',
          'Build real-world applications',
          'Work with data structures and algorithms',
          'Create automation scripts'
        ],
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'ai',
        title: 'AI & Machine Learning',
        description: 'Dive into artificial intelligence and build intelligent systems',
        icon: '🤖',
        color: '#ff6b6b',
        difficulty: 'intermediate',
        duration: '60 hours',
        xpReward: 3500,
        modules: 15,
        enrolled: 890,
        rating: 4.9,
        instructor: 'Prof. Alex Neural',
        tags: ['ai', 'machine-learning', 'deep-learning', 'neural-networks'],
        prerequisites: ['python'],
        learningOutcomes: [
          'Understand ML algorithms',
          'Build and train neural networks',
          'Work with TensorFlow and PyTorch',
          'Deploy AI models'
        ],
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'web-dev',
        title: 'Full-Stack Web Development',
        description: 'Build modern web applications with React, Node.js, and databases',
        icon: '🌐',
        color: '#61dafb',
        difficulty: 'beginner',
        duration: '50 hours',
        xpReward: 2500,
        modules: 18,
        enrolled: 2100,
        rating: 4.7,
        instructor: 'Mark Webber',
        tags: ['web', 'react', 'nodejs', 'javascript', 'html', 'css'],
        prerequisites: [],
        learningOutcomes: [
          'Build responsive websites',
          'Create React applications',
          'Build REST APIs with Node.js',
          'Work with databases'
        ],
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'data-science',
        title: 'Data Science Fundamentals',
        description: 'Analyze data, create visualizations, and extract insights',
        icon: '📊',
        color: '#22c55e',
        difficulty: 'intermediate',
        duration: '45 hours',
        xpReward: 2800,
        modules: 14,
        enrolled: 750,
        rating: 4.6,
        instructor: 'Dr. Data Watson',
        tags: ['data-science', 'analytics', 'visualization', 'pandas', 'numpy'],
        prerequisites: ['python'],
        learningOutcomes: [
          'Work with Pandas and NumPy',
          'Create data visualizations',
          'Perform statistical analysis',
          'Build data pipelines'
        ],
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'physics',
        title: 'Physics Fundamentals',
        description: 'Master the laws of physics with interactive simulations',
        icon: '⚛️',
        color: '#00d9ff',
        difficulty: 'beginner',
        duration: '35 hours',
        xpReward: 1800,
        modules: 10,
        enrolled: 450,
        rating: 4.5,
        instructor: 'Prof. Isaac Newton Jr.',
        tags: ['physics', 'mechanics', 'thermodynamics', 'science'],
        prerequisites: [],
        learningOutcomes: [
          'Understand Newtonian mechanics',
          'Master energy and momentum',
          'Learn thermodynamics',
          'Solve physics problems'
        ],
        isActive: true,
        createdAt: new Date()
      },
      {
        id: 'math',
        title: 'Mathematics for Tech',
        description: 'Essential math concepts for programming and data science',
        icon: '📐',
        color: '#a855f7',
        difficulty: 'beginner',
        duration: '30 hours',
        xpReward: 1500,
        modules: 8,
        enrolled: 680,
        rating: 4.4,
        instructor: 'Dr. Mathilda Euler',
        tags: ['math', 'algebra', 'calculus', 'statistics', 'linear-algebra'],
        prerequisites: [],
        learningOutcomes: [
          'Master algebra and calculus',
          'Understand linear algebra',
          'Apply statistics and probability',
          'Solve computational problems'
        ],
        isActive: true,
        createdAt: new Date()
      }
    ];

    for (const course of courses) {
      await coursesCollection.updateOne(
        { id: course.id },
        { $set: course },
        { upsert: true }
      );
    }
    console.log(`✅ Seeded ${courses.length} courses`);

    // ==================== SEED QUIZZES ====================
    console.log('\n📦 Seeding quizzes...');
    const quizzesCollection = db.collection('quizzes');

    const quizzes = [
      {
        courseId: 'python',
        moduleId: 'basics',
        title: 'Python Basics Quiz',
        description: 'Test your Python fundamentals',
        timeLimit: 600,
        passingScore: 70,
        xpReward: 50,
        questions: [
          {
            question: 'What is the correct way to create a variable in Python?',
            options: ['var x = 5', 'x = 5', 'int x = 5', 'declare x = 5'],
            correctIndex: 1,
            explanation: 'In Python, you simply assign a value to a variable name without any type declaration.'
          },
          {
            question: 'Which of these is a valid Python list?',
            options: ['[1, 2, 3]', '{1, 2, 3}', '(1, 2, 3)', '<1, 2, 3>'],
            correctIndex: 0,
            explanation: 'Lists in Python are created using square brackets [].'
          },
          {
            question: 'What does the print() function do?',
            options: ['Saves data to file', 'Outputs to console', 'Creates a variable', 'Defines a function'],
            correctIndex: 1,
            explanation: 'The print() function outputs text or values to the console.'
          },
          {
            question: 'How do you start a comment in Python?',
            options: ['//', '/*', '#', '--'],
            correctIndex: 2,
            explanation: 'Python uses the # symbol for single-line comments.'
          },
          {
            question: 'What is the output of: print(type(3.14))?',
            options: ['<class \'int\'>', '<class \'float\'>', '<class \'str\'>', '<class \'double\'>'],
            correctIndex: 1,
            explanation: '3.14 is a floating-point number, so its type is float.'
          }
        ],
        createdAt: new Date()
      },
      {
        courseId: 'python',
        moduleId: 'functions',
        title: 'Python Functions Quiz',
        description: 'Test your knowledge of Python functions',
        timeLimit: 600,
        passingScore: 70,
        xpReward: 75,
        questions: [
          {
            question: 'How do you define a function in Python?',
            options: ['function myFunc():', 'def myFunc():', 'create myFunc():', 'func myFunc():'],
            correctIndex: 1,
            explanation: 'Functions in Python are defined using the def keyword.'
          },
          {
            question: 'What keyword is used to return a value from a function?',
            options: ['give', 'output', 'return', 'yield'],
            correctIndex: 2,
            explanation: 'The return keyword is used to return a value from a function.'
          },
          {
            question: 'What are *args used for?',
            options: ['Keyword arguments', 'Variable positional arguments', 'Required arguments', 'Default arguments'],
            correctIndex: 1,
            explanation: '*args allows a function to accept any number of positional arguments.'
          }
        ],
        createdAt: new Date()
      },
      {
        courseId: 'ai',
        moduleId: 'intro',
        title: 'Introduction to AI Quiz',
        description: 'Test your AI fundamentals',
        timeLimit: 900,
        passingScore: 70,
        xpReward: 100,
        questions: [
          {
            question: 'What does AI stand for?',
            options: ['Automated Integration', 'Artificial Intelligence', 'Advanced Interface', 'Analytical Insight'],
            correctIndex: 1,
            explanation: 'AI stands for Artificial Intelligence.'
          },
          {
            question: 'Which is NOT a type of machine learning?',
            options: ['Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning', 'Predetermined Learning'],
            correctIndex: 3,
            explanation: 'The three main types are supervised, unsupervised, and reinforcement learning.'
          },
          {
            question: 'What is a neural network inspired by?',
            options: ['Computer processors', 'The human brain', 'Database systems', 'Network protocols'],
            correctIndex: 1,
            explanation: 'Neural networks are inspired by the structure and function of the human brain.'
          }
        ],
        createdAt: new Date()
      }
    ];

    for (const quiz of quizzes) {
      await quizzesCollection.updateOne(
        { courseId: quiz.courseId, moduleId: quiz.moduleId },
        { $set: quiz },
        { upsert: true }
      );
    }
    console.log(`✅ Seeded ${quizzes.length} quizzes`);

    // ==================== SEED JOBS ====================
    console.log('\n📦 Seeding jobs...');
    const jobsCollection = db.collection('jobs');

    const jobs = [
      {
        title: 'Junior Python Developer',
        company: 'Tech Solutions Inc.',
        location: 'Harare, Zimbabwe',
        type: 'Full-time',
        salary: '$800 - $1,200/month',
        description: 'We are looking for a junior Python developer to join our growing team. You will work on exciting projects using Django and Flask.',
        requirements: [
          '1+ years Python experience',
          'Knowledge of Django or Flask',
          'Understanding of databases',
          'Good communication skills'
        ],
        skills: ['Python', 'Django', 'Flask', 'SQL', 'Git'],
        postedBy: 'client@company.com',
        applicants: 12,
        status: 'active',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date()
      },
      {
        title: 'Machine Learning Engineer',
        company: 'AI Innovations',
        location: 'Remote',
        type: 'Full-time',
        salary: '$2,000 - $3,500/month',
        description: 'Join our AI team to build and deploy machine learning models at scale.',
        requirements: [
          '3+ years ML experience',
          'Strong Python skills',
          'Experience with TensorFlow/PyTorch',
          'Knowledge of cloud platforms'
        ],
        skills: ['Python', 'TensorFlow', 'PyTorch', 'AWS', 'Docker'],
        postedBy: 'client@company.com',
        applicants: 28,
        status: 'active',
        expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        createdAt: new Date()
      },
      {
        title: 'Frontend Developer Intern',
        company: 'StartUp Hub',
        location: 'Bulawayo, Zimbabwe',
        type: 'Internship',
        salary: '$300 - $500/month',
        description: 'Great opportunity for students to learn React and modern frontend development.',
        requirements: [
          'Currently studying CS or related field',
          'Basic HTML, CSS, JavaScript',
          'Eager to learn React',
          'Available for 3+ months'
        ],
        skills: ['HTML', 'CSS', 'JavaScript', 'React'],
        postedBy: 'client@company.com',
        applicants: 45,
        status: 'active',
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        createdAt: new Date()
      },
      {
        title: 'Data Analyst',
        company: 'Finance Corp',
        location: 'Harare, Zimbabwe',
        type: 'Full-time',
        salary: '$1,200 - $1,800/month',
        description: 'Analyze financial data and create insightful reports for decision making.',
        requirements: [
          '2+ years data analysis experience',
          'Proficiency in Excel and SQL',
          'Experience with Python/R',
          'Strong analytical skills'
        ],
        skills: ['Python', 'SQL', 'Excel', 'Tableau', 'Statistics'],
        postedBy: 'client@company.com',
        applicants: 19,
        status: 'active',
        expiresAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        createdAt: new Date()
      }
    ];

    for (const job of jobs) {
      await jobsCollection.updateOne(
        { title: job.title, company: job.company },
        { $set: job },
        { upsert: true }
      );
    }
    console.log(`✅ Seeded ${jobs.length} jobs`);

    // ==================== SEED BADGES ====================
    console.log('\n📦 Seeding badges...');
    const badgesCollection = db.collection('badges');

    const badges = [
      { id: 'newcomer', name: 'Newcomer', icon: '🌟', description: 'Welcome to E-Novate!', xpRequired: 0 },
      { id: 'beginner', name: 'Beginner', icon: '📚', description: 'Completed first lesson', xpRequired: 100 },
      { id: 'quick-learner', name: 'Quick Learner', icon: '⚡', description: 'Complete 5 lessons in a day', xpRequired: 500 },
      { id: 'python-starter', name: 'Python Starter', icon: '🐍', description: 'Started Python course', xpRequired: 200 },
      { id: 'code-master', name: 'Code Master', icon: '💻', description: 'Solved 50 coding challenges', xpRequired: 2000 },
      { id: 'ai-explorer', name: 'AI Explorer', icon: '🤖', description: 'Completed AI fundamentals', xpRequired: 1500 },
      { id: 'community-helper', name: 'Community Helper', icon: '🤝', description: 'Helped 10 other learners', xpRequired: 1000 },
      { id: 'streak-master', name: 'Streak Master', icon: '🔥', description: '30-day learning streak', xpRequired: 3000 },
      { id: 'certified', name: 'Certified', icon: '🏆', description: 'Earned first certification', xpRequired: 5000 },
      { id: 'mentor', name: 'Mentor', icon: '🎓', description: 'Mentored 5 learners', xpRequired: 8000 }
    ];

    for (const badge of badges) {
      await badgesCollection.updateOne(
        { id: badge.id },
        { $set: badge },
        { upsert: true }
      );
    }
    console.log(`✅ Seeded ${badges.length} badges`);

    // ==================== SEED COMMUNITY POSTS ====================
    console.log('\n📦 Seeding community posts...');
    const postsCollection = db.collection('communityPosts');

    const posts = [
      {
        author: 'Jane Developer',
        authorEmail: 'jane@example.com',
        avatar: '👩‍💻',
        content: 'Just completed the Python Mastery course! 🐍 The quest-based learning made it so engaging. Highly recommend to anyone starting their coding journey!',
        likes: 42,
        comments: [
          { author: 'John Student', content: 'Congrats! I\'m halfway through it myself.', createdAt: new Date() }
        ],
        tags: ['python', 'achievement', 'learning'],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        author: 'John Student',
        authorEmail: 'student@example.com',
        avatar: '🎓',
        content: 'Anyone else working on the AI course? Would love to form a study group! 🤖',
        likes: 28,
        comments: [
          { author: 'Jane Developer', content: 'Count me in!', createdAt: new Date() },
          { author: 'Demo User', content: 'I\'d love to join too!', createdAt: new Date() }
        ],
        tags: ['ai', 'study-group', 'community'],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        author: 'Admin User',
        authorEmail: 'admin@enovate.com',
        avatar: '👨‍💼',
        content: '🎉 Exciting news! We\'ve just launched new Physics and Math courses with interactive simulations and AI-powered problem solving. Check them out!',
        likes: 156,
        comments: [],
        tags: ['announcement', 'new-courses', 'physics', 'math'],
        pinned: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ];

    for (const post of posts) {
      await postsCollection.updateOne(
        { author: post.author, content: post.content },
        { $set: post },
        { upsert: true }
      );
    }
    console.log(`✅ Seeded ${posts.length} community posts`);

    // ==================== SUMMARY ====================
    console.log('\n========================================');
    console.log('🎉 DATABASE SEEDING COMPLETE!');
    console.log('========================================');
    console.log('\n📋 Test Accounts:');
    console.log('----------------------------------------');
    console.log('👨‍💼 Admin:    admin@enovate.com    / Admin@123');
    console.log('🏢 Client:   client@company.com   / Client@123');
    console.log('🎓 Student:  student@example.com  / Student@123');
    console.log('👩‍💻 Student:  jane@example.com     / Student@123');
    console.log('🚀 Demo:     demo@enovate.com     / Demo@123');
    console.log('----------------------------------------\n');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await client.close();
    console.log('📤 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedDatabase();
