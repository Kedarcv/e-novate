import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Learn.scss';

interface Course {
  id: string;
  title: string;
  description: string;
  duration: string;
  modules: number;
  icon: string;
  certPrice: number;
  color: string;
}

// Course IDs match the MODULE_CONTENT in GamifiedLearning.tsx
const courses: Course[] = [
  {
    id: 'python',
    title: 'Python Fundamentals',
    description: 'Learn Python programming from basics to advanced concepts with hands-on coding.',
    duration: '8 weeks',
    modules: 24,
    icon: 'code',
    certPrice: 25,
    color: '#3776ab',
  },
  {
    id: 'javascript',
    title: 'JavaScript Mastery',
    description: 'Master JavaScript for web development including ES6+, DOM, and async programming.',
    duration: '8 weeks',
    modules: 20,
    icon: 'javascript',
    certPrice: 25,
    color: '#f7df1e',
  },
  {
    id: 'react',
    title: 'React Development',
    description: 'Build modern web applications with React, hooks, state management, and more.',
    duration: '6 weeks',
    modules: 18,
    icon: 'web',
    certPrice: 30,
    color: '#61dafb',
  },
  {
    id: 'ai',
    title: 'AI & Machine Learning',
    description: 'Understand the fundamentals of artificial intelligence and automation.',
    duration: '6 weeks',
    modules: 18,
    icon: 'smart_toy',
    certPrice: 30,
    color: '#7000ff',
  },
  {
    id: 'physics',
    title: 'Physics Foundations',
    description: 'Master physics concepts with interactive simulations and problem solving.',
    duration: '8 weeks',
    modules: 20,
    icon: 'science',
    certPrice: 25,
    color: '#ff6b35',
  },
  {
    id: 'math',
    title: 'Mathematics Essentials',
    description: 'Build strong math foundations from algebra to calculus with practice problems.',
    duration: '6 weeks',
    modules: 16,
    icon: 'calculate',
    certPrice: 20,
    color: '#22c55e',
  },
];

export default function Learn() {
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  // Load enrolled courses from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('enrolledCourses');
    if (stored) {
      setEnrolledCourses(JSON.parse(stored));
    }
  }, []);

  const handleEnroll = (courseId: string) => {
    setEnrollingId(courseId);
    
    // Simulate enrollment
    setTimeout(() => {
      const updated = [...enrolledCourses, courseId];
      setEnrolledCourses(updated);
      localStorage.setItem('enrolledCourses', JSON.stringify(updated));
      setEnrollingId(null);
    }, 800);
  };

  const handleStartLearning = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  const isEnrolled = (courseId: string) => enrolledCourses.includes(courseId);

  return (
    <div className="learn-page">
      <div className="page-header">
        <Link to="/" className="back-btn">
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </Link>
        <h1>Learn Digital Skills</h1>
        <p><strong>All courses are 100% FREE.</strong> Enroll and start learning with AI today.</p>
      </div>

      <div className="enrolled-summary">
        <span className="material-symbols-outlined">school</span>
        <span>You're enrolled in <strong>{enrolledCourses.length}</strong> course{enrolledCourses.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="courses-grid">
        {courses.map((course) => (
          <div key={course.id} className="course-card" style={{ '--accent': course.color } as React.CSSProperties}>
            <div className="card-icon">
              <span className="material-symbols-outlined">{course.icon}</span>
            </div>
            <div className="free-badge">FREE</div>
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <div className="meta">
              <span><span className="material-symbols-outlined">schedule</span> {course.duration}</span>
              <span><span className="material-symbols-outlined">library_books</span> {course.modules} modules</span>
            </div>
            <div className="card-footer">
              <span className="price">Cert: ${course.certPrice}</span>
              
              {isEnrolled(course.id) ? (
                <button className="start-btn enrolled" onClick={() => handleStartLearning(course.id)}>
                  <span className="material-symbols-outlined">play_arrow</span>
                  Start Learning
                </button>
              ) : (
                <button 
                  className="enroll-btn" 
                  onClick={() => handleEnroll(course.id)}
                  disabled={enrollingId === course.id}
                >
                  {enrollingId === course.id ? (
                    'Enrolling...'
                  ) : (
                    <>
                      <span className="material-symbols-outlined">add</span>
                      Enroll Free
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="info-banner">
        <span className="material-symbols-outlined">info</span>
        <p>After enrolling, you'll have full access to our <strong>Gemini AI tutor</strong> for interactive learning. Pay for certification only when you're ready to prove your skills!</p>
      </div>
    </div>
  );
}
