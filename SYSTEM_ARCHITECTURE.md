# E-Novate Learning Platform - System Architecture

## 📋 Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Frontend Components](#frontend-components)
7. [Features](#features)
8. [Getting Started](#getting-started)
9. [Deployment](#deployment)

---

## 🎯 Overview

E-Novate is a comprehensive gamified learning platform designed for skill development, job matching, and community engagement. The platform combines AI-powered learning experiences with real-time progress tracking, social features, and job opportunities.

### Key Features
- 🎮 **Gamified Learning** - Flashcards, quizzes, code challenges with XP rewards
- 🤖 **AI-Powered Tutoring** - Real-time AI assistance using Google Gemini
- 💼 **Job Marketplace** - Job listings with application tracking
- 👥 **Social Community** - Posts, code sharing, achievements, Q&A
- 📊 **Real-time Metrics** - Progress tracking and analytics
- 🏆 **Badges & Leaderboards** - Achievement system with rankings
- 📱 **Mobile-First Design** - iOS/Android ready with Capacitor

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI Framework |
| TypeScript | 5.x | Type Safety |
| React Router | 6.x | Navigation |
| SCSS | - | Styling |
| Capacitor | 5.x | Native iOS/Android |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18.x | Runtime |
| Express.js | 4.x | API Framework |
| MongoDB | 6.x | Database |
| Mongoose | - | ODM (optional) |

### AI & APIs
| Technology | Purpose |
|------------|---------|
| Google Gemini API | AI-powered tutoring & chat |
| WebRTC | Real-time audio/video |
| Web Audio API | Audio processing |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| MongoDB Atlas | Cloud Database |
| Vercel/Netlify | Frontend Hosting |
| Railway/Render | Backend Hosting |
| Cloudflare | CDN & Security |

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   React     │  │  Capacitor  │  │   SCSS      │  │  TypeScript │    │
│  │   18.x      │  │   (iOS/     │  │   Modules   │  │   5.x       │    │
│  │             │  │   Android)  │  │             │  │             │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     React Context (State Management)              │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │   │
│  │  │ DatabaseContext │  │ LiveAPIContext  │  │  Local Storage  │   │   │
│  │  │ (MongoDB sync)  │  │ (Gemini AI)     │  │  (Offline)      │   │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           API LAYER                                      │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    Express.js REST API                            │   │
│  │                    http://localhost:3001/api                      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   /users    │  │  /progress  │  │   /quiz     │  │   /code     │    │
│  │   Auth &    │  │  Learning   │  │   Results   │  │   Submit    │    │
│  │   Profile   │  │  Tracking   │  │   & Score   │  │   & Run     │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   /jobs     │  │   /feed     │  │  /metrics   │  │  /badges    │    │
│  │   Listings  │  │   Social    │  │  Analytics  │  │  Achieve-   │    │
│  │   & Apply   │  │   Posts     │  │  & Events   │  │  ments      │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      MongoDB Atlas                                │   │
│  │        mongodb+srv://...@musika.dogjv.mongodb.net/e-novate       │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Collections:                                                            │
│  ┌─────────┐ ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐   │
│  │  users  │ │ learningProgress│ │ quizResults │ │ codeSubmissions │   │
│  └─────────┘ └─────────────────┘ └─────────────┘ └─────────────────┘   │
│  ┌─────────┐ ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐   │
│  │  jobs   │ │ jobApplications │ │    posts    │ │     metrics     │   │
│  └─────────┘ └─────────────────┘ └─────────────┘ └─────────────────┘   │
│  ┌─────────┐ ┌─────────────────┐                                        │
│  │ courses │ │    xpHistory    │                                        │
│  └─────────┘ └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL SERVICES                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐      │
│  │  Google Gemini   │  │   WebRTC Audio   │  │   Push Notifs    │      │
│  │  AI API          │  │   Streaming      │  │   (FCM/APNS)     │      │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  phoneNumber: String,          // Unique, sparse index
  email: String,                // Unique, sparse index
  name: String,
  xp: Number,                   // Experience points
  level: Number,                // Calculated from XP
  streak: Number,               // Daily login streak
  badges: [String],             // Earned badge IDs
  completedCourses: [String],
  completedModules: [String],
  completedChallenges: [String],
  skills: [String],
  preferences: {
    pushNotifications: Boolean,
    darkMode: Boolean,
    soundEffects: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Learning Progress Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,             // Reference to users
  courseId: String,
  moduleId: String,
  completed: Boolean,
  score: Number,                // 0-100
  timeSpent: Number,            // In seconds
  quizResults: [Object],
  createdAt: Date,
  updatedAt: Date
}
```

### Quiz Results Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  courseId: String,
  moduleId: String,
  quizType: String,             // 'flashcard', 'multiple-choice', 'code-challenge'
  score: Number,
  totalQuestions: Number,
  percentage: Number,
  answers: [Object],
  timeSpent: Number,
  completedAt: Date
}
```

### Code Submissions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  challengeId: String,
  code: String,
  language: String,
  passed: Boolean,
  testResults: [{
    input: String,
    expected: String,
    actual: String,
    passed: Boolean
  }],
  executionTime: Number,
  submittedAt: Date
}
```

### Jobs Collection
```javascript
{
  _id: ObjectId,
  title: String,
  company: String,
  location: String,
  salary: String,
  type: String,                 // 'Full-time', 'Part-time', 'Remote', 'Freelance'
  skills: [String],
  description: String,
  requirements: [String],
  postedAt: Date
}
```

### Job Applications Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  jobId: String,
  coverLetter: String,
  resumeUrl: String,
  answers: Object,
  status: String,               // 'pending', 'reviewed', 'interview', 'accepted', 'rejected'
  appliedAt: Date,
  updatedAt: Date
}
```

### Posts Collection (Social Feed)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  content: String,
  type: String,                 // 'text', 'code', 'achievement', 'question'
  attachments: [String],
  codeSnippet: {
    language: String,
    code: String
  },
  tags: [String],
  likes: [ObjectId],            // User IDs who liked
  comments: [{
    _id: ObjectId,
    userId: ObjectId,
    content: String,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Metrics Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  eventType: String,
  eventData: Object,
  sessionId: String,
  timestamp: Date,
  userAgent: String,
  ip: String
}
```

### Courses Collection
```javascript
{
  _id: ObjectId,
  title: String,
  subject: String,              // 'programming', 'physics', 'math', etc.
  description: String,
  difficulty: String,           // 'beginner', 'intermediate', 'advanced'
  duration: String,
  xpReward: Number,
  modules: [{
    id: Number,
    title: String,
    duration: Number,
    xp: Number,
    type: String,               // 'lesson', 'quiz', 'challenge'
    content: String,
    quiz: [{
      question: String,
      options: [String],
      correct: Number
    }]
  }],
  order: Number
}
```

---

## 🔌 API Endpoints

### Authentication & Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/auth` | Authenticate or create user |
| GET | `/api/users/:userId` | Get user by ID |
| PUT | `/api/users/:userId` | Update user profile |
| POST | `/api/users/:userId/xp` | Add XP to user |

### Learning Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/progress/:userId` | Get all progress for user |
| POST | `/api/progress` | Update course/module progress |

### Quizzes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quiz/results` | Save quiz results |
| GET | `/api/quiz/history/:userId` | Get quiz history |

### Code Challenges
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/code/submit` | Submit code solution |
| GET | `/api/code/history/:userId` | Get submission history |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs` | Get all jobs (with filters) |
| POST | `/api/jobs/apply` | Apply for a job |
| GET | `/api/jobs/applications/:userId` | Get user's applications |

### Social Feed
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/feed/posts` | Get feed posts |
| POST | `/api/feed/posts` | Create a post |
| POST | `/api/feed/posts/:postId/like` | Like/unlike a post |
| POST | `/api/feed/posts/:postId/comment` | Add comment |

### Metrics & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/metrics/event` | Log an event |
| GET | `/api/metrics/summary/:userId` | Get user metrics summary |
| GET | `/api/leaderboard` | Get XP leaderboard |

### Badges
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/badges/check/:userId` | Check for new badges |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | Get all courses |
| GET | `/api/courses/:courseId` | Get course details |

### Utility
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/seed` | Seed database (dev only) |

---

## 🧩 Frontend Components

### Pages
```
src/pages/
├── LandingPage.tsx          # Public landing page
├── Dashboard.tsx            # User dashboard with stats
├── Learn.tsx                # Course catalog
├── CourseModule.tsx         # Individual course view
├── GamifiedLearning.tsx     # Interactive learning (flashcards, quizzes, code)
├── Jobs.tsx                 # Job listings
├── JobApplication.tsx       # Job application form
├── CommunityFeed.tsx        # Social feed
├── Settings.tsx             # User settings
├── Notifications.tsx        # Notifications
├── Certify.tsx              # Certifications
├── Connect.tsx              # Networking
├── Wallet.tsx               # Payments
└── ClientPortal.tsx         # Client dashboard
```

### Contexts
```
src/contexts/
├── DatabaseContext.tsx      # MongoDB state management
└── LiveAPIContext.tsx       # Gemini AI state management
```

### Features
```
src/features/
└── learning/
    └── LiveLearningSession.tsx  # AI-powered tutoring session
```

### Components
```
src/components/
├── altair/                  # AI visualization
├── ar-overlay/              # AR features
├── audio-pulse/             # Audio visualization
├── bottom-nav/              # Navigation
├── control-tray/            # Media controls
├── logger/                  # Debug logging
├── settings-dialog/         # Settings modal
└── side-panel/              # Side navigation
```

### Libraries
```
src/lib/
├── database.ts              # MongoDB API service
├── audio-recorder.ts        # Audio recording
├── audio-streamer.ts        # Audio playback
├── genai-live-client.ts     # Gemini AI client
└── utils.ts                 # Utility functions
```

---

## 🎮 Features Deep Dive

### 1. Gamified Learning Experience
- **Flashcards**: Swipeable cards with hints, tracks known/unknown
- **Smart Quizzes**: Timed multiple choice with explanations
- **Code Challenges**: Write and run code with test cases
- **Physics Simulations**: Interactive projectile, pendulum, wave visualizations
- **Math Solver**: Step-by-step problem solving

### 2. XP & Progression System
- Earn XP for completing activities
- Combo system for streaks
- Level up based on total XP
- Daily streak tracking
- Badge achievements

### 3. AI-Powered Learning
- Real-time voice interaction with Gemini AI
- Context-aware tutoring
- Code explanation and debugging help
- Subject-specific assistance

### 4. Social Features
- Post text, code snippets, achievements
- Like and comment on posts
- Follow other learners
- Share progress

### 5. Job Marketplace
- Browse job listings
- Filter by type (Full-time, Part-time, Remote)
- Apply with cover letter
- Track application status

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### Environment Variables
Create `.env` file:
```env
# Gemini AI
REACT_APP_GEMINI_API_KEY='your-gemini-api-key'

# MongoDB
REACT_APP_MONGO_URL='mongodb+srv://user:pass@cluster.mongodb.net/e-novate'
REACT_APP_MONGODB_DB_NAME='e-novate'
REACT_APP_API_URL='http://localhost:3001/api'
```

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd live-api-web-console-main
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd server
npm install
cd ..
```

4. **Start the backend server**
```bash
cd server
npm run dev
# Server runs on http://localhost:3001
```

5. **Seed the database (optional)**
```bash
curl -X POST http://localhost:3001/api/seed
```

6. **Start the frontend**
```bash
npm start
# App runs on http://localhost:3000
```

### Mobile Development (Capacitor)

1. **Build the web app**
```bash
npm run build
```

2. **Sync with Capacitor**
```bash
npx cap sync
```

3. **Open in Xcode (iOS)**
```bash
npx cap open ios
```

4. **Open in Android Studio**
```bash
npx cap open android
```

---

## 📦 Deployment

### Frontend (Vercel)
```bash
npm run build
vercel deploy
```

### Backend (Railway)
```bash
cd server
railway login
railway init
railway up
```

### Environment Variables for Production
- Update `REACT_APP_API_URL` to production backend URL
- Ensure MongoDB Atlas IP whitelist includes server IP
- Set up proper CORS origins

---

## 📈 Monitoring & Analytics

### Tracked Events
- User authentication (login/logout)
- Learning progress
- Quiz completions
- Code submissions
- Job applications
- Post interactions
- Feature usage

### Metrics Dashboard
- Total quizzes completed
- Average quiz scores
- Code challenge pass rate
- Total time spent learning
- XP earned over time
- Active users
- Leaderboard rankings

---

## 🔐 Security Considerations

1. **Authentication**: JWT tokens (to be implemented)
2. **Data Validation**: Server-side input validation
3. **Rate Limiting**: API rate limiting (to be implemented)
4. **CORS**: Configured for allowed origins
5. **Password Hashing**: bcrypt for passwords (to be implemented)
6. **Environment Variables**: Secrets in env files

---

## 🛣 Roadmap

### Phase 1 (Current) ✅
- [x] Core learning features
- [x] MongoDB integration
- [x] Social feed
- [x] Job marketplace
- [x] Gamification system

### Phase 2 (Next)
- [ ] JWT authentication
- [ ] Password-based login
- [ ] Real-time notifications (WebSockets)
- [ ] File uploads (S3)
- [ ] Advanced analytics dashboard

### Phase 3 (Future)
- [ ] Payment integration (Stripe/EcoCash)
- [ ] Certificate generation (PDF)
- [ ] Video courses
- [ ] Group learning sessions
- [ ] Mentorship matching

---

## 📞 Support

For issues or questions:
- Create a GitHub issue
- Email: support@e-novate.com
- Documentation: [docs.e-novate.com](https://docs.e-novate.com)

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.
