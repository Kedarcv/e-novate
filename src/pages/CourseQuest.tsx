import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/animated-background/AnimatedBackground';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useLiveAPIContext } from '../contexts/LiveAPIContext';
import './CourseQuest.scss';

// Course Data with Quest Storylines
const COURSE_QUESTS: Record<string, CourseData> = {
  python: {
    id: 'python',
    title: 'Python Mastery',
    icon: 'code',
    color: '#3776ab',
    storyline: {
      title: 'The Python Chronicles',
      intro: 'In the land of Code, ancient serpents guard the secrets of automation and data. Your journey begins as a humble coder seeking to master the ways of Python...',
      character: 'person',
      chapters: [
        {
          id: 1,
          title: 'The First Script',
          description: 'Learn the basics of Python syntax and write your first program',
          xp: 100,
          unlockLevel: 1,
          quests: [
            { id: 'py-1-1', title: 'Hello, World!', type: 'code', xp: 20 },
            { id: 'py-1-2', title: 'Variables & Types', type: 'flashcard', xp: 15 },
            { id: 'py-1-3', title: 'Basic Operations', type: 'quiz', xp: 25 },
            { id: 'py-1-4', title: 'String Magic', type: 'code', xp: 25 },
            { id: 'py-1-5', title: 'Chapter Challenge', type: 'boss', xp: 40 }
          ]
        },
        {
          id: 2,
          title: 'Control Flow Caves',
          description: 'Navigate through conditionals and loops',
          xp: 150,
          unlockLevel: 2,
          quests: [
            { id: 'py-2-1', title: 'If-Else Paths', type: 'code', xp: 25 },
            { id: 'py-2-2', title: 'The Loop Forest', type: 'code', xp: 30 },
            { id: 'py-2-3', title: 'While vs For', type: 'quiz', xp: 20 },
            { id: 'py-2-4', title: 'Nested Challenges', type: 'code', xp: 35 },
            { id: 'py-2-5', title: 'The Guardian Loop', type: 'boss', xp: 50 }
          ]
        },
        {
          id: 3,
          title: 'Function Forge',
          description: 'Craft powerful functions and master reusability',
          xp: 200,
          unlockLevel: 3,
          quests: [
            { id: 'py-3-1', title: 'Your First Function', type: 'code', xp: 30 },
            { id: 'py-3-2', title: 'Parameters & Returns', type: 'flashcard', xp: 25 },
            { id: 'py-3-3', title: 'Scope & Variables', type: 'quiz', xp: 30 },
            { id: 'py-3-4', title: 'Lambda Expressions', type: 'code', xp: 40 },
            { id: 'py-3-5', title: 'The Recursion Dragon', type: 'boss', xp: 60 }
          ]
        }
      ]
    }
  },
  ai: {
    id: 'ai',
    title: 'AI & Machine Learning',
    icon: 'smart_toy',
    color: '#ff6b6b',
    storyline: {
      title: 'Rise of the Machines',
      intro: 'In the digital frontier, intelligent systems await your command. Learn to create thinking machines that can learn, adapt, and evolve...',
      character: 'science',
      chapters: [
        {
          id: 1,
          title: 'Neural Awakening',
          description: 'Understand the foundations of artificial intelligence',
          xp: 120,
          unlockLevel: 1,
          quests: [
            { id: 'ai-1-1', title: 'What is AI?', type: 'flashcard', xp: 20 },
            { id: 'ai-1-2', title: 'Setup Environment', type: 'notebook', xp: 30 },
            { id: 'ai-1-3', title: 'NumPy Basics', type: 'code', xp: 25 },
            { id: 'ai-1-4', title: 'Data Exploration', type: 'notebook', xp: 35 },
            { id: 'ai-1-5', title: 'First Model', type: 'boss', xp: 50 }
          ]
        },
        {
          id: 2,
          title: 'The Learning Matrix',
          description: 'Train your first machine learning models',
          xp: 180,
          unlockLevel: 2,
          quests: [
            { id: 'ai-2-1', title: 'Linear Regression', type: 'notebook', xp: 35 },
            { id: 'ai-2-2', title: 'Classification', type: 'notebook', xp: 40 },
            { id: 'ai-2-3', title: 'Model Evaluation', type: 'quiz', xp: 25 },
            { id: 'ai-2-4', title: 'Feature Engineering', type: 'notebook', xp: 45 },
            { id: 'ai-2-5', title: 'The Overfitting Beast', type: 'boss', xp: 60 }
          ]
        }
      ]
    }
  },
  physics: {
    id: 'physics',
    title: 'Physics Fundamentals',
    icon: 'science',
    color: '#00d9ff',
    storyline: {
      title: 'Laws of the Universe',
      intro: 'The cosmos holds infinite secrets. From falling apples to orbiting planets, discover the fundamental forces that shape our reality...',
      character: 'explore',
      chapters: [
        {
          id: 1,
          title: 'Motion & Forces',
          description: 'Understand Newtonian mechanics',
          xp: 100,
          unlockLevel: 1,
          quests: [
            { id: 'ph-1-1', title: 'Speed & Velocity', type: 'simulation', xp: 25 },
            { id: 'ph-1-2', title: "Newton's Laws", type: 'flashcard', xp: 20 },
            { id: 'ph-1-3', title: 'Free Fall', type: 'simulation', xp: 30 },
            { id: 'ph-1-4', title: 'Projectile Motion', type: 'simulation', xp: 35 },
            { id: 'ph-1-5', title: 'Forces Challenge', type: 'boss', xp: 45 }
          ]
        },
        {
          id: 2,
          title: 'Energy & Work',
          description: 'Master the concepts of energy conservation',
          xp: 150,
          unlockLevel: 2,
          quests: [
            { id: 'ph-2-1', title: 'Kinetic Energy', type: 'simulation', xp: 30 },
            { id: 'ph-2-2', title: 'Potential Energy', type: 'simulation', xp: 30 },
            { id: 'ph-2-3', title: 'Conservation Laws', type: 'quiz', xp: 25 },
            { id: 'ph-2-4', title: 'Work & Power', type: 'video-ai', xp: 40 },
            { id: 'ph-2-5', title: 'Energy Master', type: 'boss', xp: 55 }
          ]
        }
      ]
    }
  },
  math: {
    id: 'math',
    title: 'Mathematics',
    icon: 'calculate',
    color: '#22c55e',
    storyline: {
      title: 'The Number Realm',
      intro: 'In a world built on logic and patterns, mathematical truths await discovery. Sharpen your mind and unlock the language of the universe...',
      character: 'calculate',
      chapters: [
        {
          id: 1,
          title: 'Algebra Foundations',
          description: 'Master variables, equations, and expressions',
          xp: 100,
          unlockLevel: 1,
          quests: [
            { id: 'ma-1-1', title: 'Variables', type: 'flashcard', xp: 20 },
            { id: 'ma-1-2', title: 'Linear Equations', type: 'solver', xp: 30 },
            { id: 'ma-1-3', title: 'Inequalities', type: 'quiz', xp: 25 },
            { id: 'ma-1-4', title: 'Word Problems', type: 'video-ai', xp: 35 },
            { id: 'ma-1-5', title: 'Algebra Boss', type: 'boss', xp: 45 }
          ]
        },
        {
          id: 2,
          title: 'Calculus Quest',
          description: 'Explore limits, derivatives, and integrals',
          xp: 200,
          unlockLevel: 3,
          quests: [
            { id: 'ma-2-1', title: 'Limits', type: 'solver', xp: 35 },
            { id: 'ma-2-2', title: 'Derivatives', type: 'solver', xp: 40 },
            { id: 'ma-2-3', title: 'Applications', type: 'video-ai', xp: 45 },
            { id: 'ma-2-4', title: 'Integration', type: 'solver', xp: 50 },
            { id: 'ma-2-5', title: 'Calculus Master', type: 'boss', xp: 70 }
          ]
        }
      ]
    }
  }
};

interface Quest {
  id: string;
  title: string;
  type: 'code' | 'flashcard' | 'quiz' | 'boss' | 'notebook' | 'simulation' | 'solver' | 'video-ai';
  xp: number;
}

interface Chapter {
  id: number;
  title: string;
  description: string;
  xp: number;
  unlockLevel: number;
  quests: Quest[];
}

interface CourseData {
  id: string;
  title: string;
  icon: string;
  color: string;
  storyline: {
    title: string;
    intro: string;
    character: string;
    chapters: Chapter[];
  };
}

interface QuestState {
  questId: string;
  completed: boolean;
  score?: number;
}

const CourseQuest: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { courseId, questId } = useParams<{ courseId: string; questId: string }>();
  const navigate = useNavigate();
  const course = COURSE_QUESTS[courseId || 'python'];
  
  const [currentLevel, setCurrentLevel] = useState(1);
  const [totalXp, setTotalXp] = useState(0);
  const [completedQuests, setCompletedQuests] = useState<QuestState[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [showStoryIntro, setShowStoryIntro] = useState(true);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isStreaming, setIsStreaming] = useState(false);
  const [screenShareActive, setScreenShareActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);

  // AI Context
  const { connect, disconnect, connected } = useLiveAPIContext();

  useEffect(() => {
    // Load user progress
    const savedProgress = localStorage.getItem(`course-progress-${courseId}`);
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setCurrentLevel(progress.level || 1);
      setTotalXp(progress.xp || 0);
      setCompletedQuests(progress.completed || []);
      setShowStoryIntro(false);
    }
  }, [courseId]);

  const handleCompleteQuest = (quest: Quest, score: number = 100) => {
    const newCompleted = [...completedQuests, { questId: quest.id, completed: true, score }];
    const newXp = totalXp + quest.xp;
    const newLevel = Math.floor(newXp / 200) + 1;

    setCompletedQuests(newCompleted);
    setTotalXp(newXp);
    setCurrentLevel(newLevel);
    setActiveQuest(null);

    // Save progress
    localStorage.setItem(`course-progress-${courseId}`, JSON.stringify({
      level: newLevel,
      xp: newXp,
      completed: newCompleted
    }));
  };

  const isQuestCompleted = (questId: string) => {
    return completedQuests.some(q => q.questId === questId);
  };

  const getChapterProgress = (chapter: Chapter) => {
    const completed = chapter.quests.filter(q => isQuestCompleted(q.id)).length;
    return (completed / chapter.quests.length) * 100;
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      if (screenRef.current) {
        screenRef.current.srcObject = stream;
      }
      setScreenShareActive(true);
    } catch (error) {
      console.error('Screen share error:', error);
    }
  };

  const startVideoCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Video capture error:', error);
    }
  };

  const toggleAIAssistant = async () => {
    if (aiAssistantOpen) {
      disconnect();
      setAiAssistantOpen(false);
    } else {
      setAiAssistantOpen(true);
      // Connect to AI with course context
      if (!connected) {
        await connect();
      }
    }
  };

  if (!course) {
    return <div className="course-not-found">Course not found</div>;
  }

  return (
    <div className="course-quest" style={{ '--course-color': course.color } as React.CSSProperties}>
      <AnimatedBackground 
        variant="neural" 
        primaryColor={course.color} 
        secondaryColor="#1e293b"
      />

      {/* Story Introduction Modal */}
      {showStoryIntro && (
        <div className="story-modal">
          <div className="story-content">
            <div className="story-icon">{course.icon}</div>
            <h1>{course.storyline.title}</h1>
            <p className="story-intro">{course.storyline.intro}</p>
            <div className="story-character">
              <span className="character-icon">{course.storyline.character}</span>
              <span className="character-text">Your guide awaits...</span>
            </div>
            <button className="btn-begin" onClick={() => setShowStoryIntro(false)}>
              Begin Your Quest
              <span className="arrow">→</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Quest View */}
      {!showStoryIntro && !activeQuest && (
        <div className="quest-container">
          {/* Header */}
          <header className="quest-header">
            <button className="btn-back" onClick={() => navigate('/learn')}>
              ← Back
            </button>
            <div className="course-info">
              <span className="course-icon">{course.icon}</span>
              <h1>{course.title}</h1>
            </div>
            <div className="user-stats">
              <div className="stat level">
                <span className="label">Level</span>
                <span className="value">{currentLevel}</span>
              </div>
              <div className="stat xp">
                <span className="label">XP</span>
                <span className="value">{totalXp}</span>
              </div>
            </div>
          </header>

          {/* AI Assistant Toggle */}
          <button 
            className={`ai-toggle ${aiAssistantOpen ? 'active' : ''}`}
            onClick={toggleAIAssistant}
          >
            <span className="material-symbols-outlined ai-icon">smart_toy</span>
            <span className="ai-label">{aiAssistantOpen ? 'Hide AI' : 'Ask AI'}</span>
          </button>

          {/* AI Assistant Panel */}
          {aiAssistantOpen && (
            <div className="ai-assistant-panel">
              <div className="ai-header">
                <span><span className="material-symbols-outlined">smart_toy</span> AI Learning Assistant</span>
                <button onClick={() => setAiAssistantOpen(false)}>✕</button>
              </div>
              <div className="ai-content">
                <p>I'm here to help you with {course.title}! Ask me anything about the course content.</p>
                
                {(courseId === 'physics' || courseId === 'math') && (
                  <div className="ai-video-options">
                    <p className="video-hint"><span className="material-symbols-outlined">videocam</span> For Physics & Math, you can share your screen or video for AI-assisted problem solving!</p>
                    <div className="video-buttons">
                      <button onClick={startScreenShare} className={screenShareActive ? 'active' : ''}>
                        <span className="material-symbols-outlined">screen_share</span> Share Screen
                      </button>
                      <button onClick={startVideoCapture}>
                        <span className="material-symbols-outlined">photo_camera</span> Start Camera
                      </button>
                    </div>
                    {screenShareActive && (
                      <video ref={screenRef} autoPlay muted className="screen-preview" />
                    )}
                    <video ref={videoRef} autoPlay muted className="video-preview" style={{ display: 'none' }} />
                  </div>
                )}

                <div className="ai-input">
                  <input type="text" placeholder="Ask a question..." />
                  <button className="btn-send">Send</button>
                </div>
              </div>
            </div>
          )}

          {/* Chapter Path */}
          <div className="chapters-path">
            {course.storyline.chapters.map((chapter, idx) => {
              const isUnlocked = currentLevel >= chapter.unlockLevel;
              const progress = getChapterProgress(chapter);
              const isComplete = progress === 100;

              return (
                <div 
                  key={chapter.id}
                  className={`chapter-node ${isUnlocked ? 'unlocked' : 'locked'} ${isComplete ? 'complete' : ''} ${selectedChapter?.id === chapter.id ? 'selected' : ''}`}
                  onClick={() => isUnlocked && setSelectedChapter(chapter)}
                >
                  <div className="chapter-connector" style={{ display: idx === 0 ? 'none' : 'block' }} />
                  <div className="chapter-circle">
                    {isComplete ? '✓' : isUnlocked ? chapter.id : <span className="material-symbols-outlined">lock</span>}
                  </div>
                  <div className="chapter-info">
                    <h3>{chapter.title}</h3>
                    <p>{chapter.description}</p>
                    {isUnlocked && (
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }} />
                      </div>
                    )}
                    {!isUnlocked && (
                      <span className="unlock-text">Unlocks at Level {chapter.unlockLevel}</span>
                    )}
                  </div>
                  <div className="chapter-xp">+{chapter.xp} XP</div>
                </div>
              );
            })}
          </div>

          {/* Quest List for Selected Chapter */}
          {selectedChapter && (
            <div className="quests-panel">
              <div className="quests-header">
                <h2>{selectedChapter.title}</h2>
                <span className="chapter-progress">
                  {selectedChapter.quests.filter(q => isQuestCompleted(q.id)).length}/{selectedChapter.quests.length} Quests
                </span>
              </div>
              <div className="quests-list">
                {selectedChapter.quests.map((quest, idx) => {
                  const completed = isQuestCompleted(quest.id);
                  const prevCompleted = idx === 0 || isQuestCompleted(selectedChapter.quests[idx - 1].id);
                  const isAvailable = prevCompleted && !completed;

                  return (
                    <div 
                      key={quest.id}
                      className={`quest-item ${completed ? 'completed' : ''} ${isAvailable ? 'available' : ''} ${quest.type === 'boss' ? 'boss' : ''}`}
                      onClick={() => isAvailable && setActiveQuest(quest)}
                    >
                      <div className="quest-icon">
                        {completed ? '✓' : getQuestTypeIcon(quest.type)}
                      </div>
                      <div className="quest-info">
                        <h4>{quest.title}</h4>
                        <span className="quest-type">{quest.type}</span>
                      </div>
                      <div className="quest-xp">+{quest.xp} XP</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Quest View */}
      {activeQuest && (
        <QuestRunner 
          quest={activeQuest}
          courseId={courseId || 'python'}
          onComplete={(score) => handleCompleteQuest(activeQuest, score)}
          onExit={() => setActiveQuest(null)}
          aiAssistantOpen={aiAssistantOpen}
          toggleAI={toggleAIAssistant}
        />
      )}
    </div>
  );
};

// Helper function for quest type icons
const getQuestTypeIcon = (type: string): string => {
  switch (type) {
    case 'code': return 'code';
    case 'flashcard': return 'style';
    case 'quiz': return 'quiz';
    case 'boss': return 'workspace_premium';
    case 'notebook': return 'description';
    case 'simulation': return 'gamepad';
    case 'solver': return 'calculate';
    case 'video-ai': return 'videocam';
    default: return 'menu_book';
  }
};

// Quest Runner Component
interface QuestRunnerProps {
  quest: Quest;
  courseId: string;
  onComplete: (score: number) => void;
  onExit: () => void;
  aiAssistantOpen: boolean;
  toggleAI: () => void;
}

const QuestRunner: React.FC<QuestRunnerProps> = ({
  quest,
  courseId,
  onComplete,
  onExit,
  aiAssistantOpen,
  toggleAI
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [code, setCode] = useState('# Write your code here\n');
  const [output, setOutput] = useState('');

  const runCode = () => {
    try {
      // Simulated code execution
      setOutput('Code executed successfully!\n\nOutput:\nHello, World!');
      setScore(100);
    } catch (error) {
      setOutput('Error in code');
    }
  };

  return (
    <div className="quest-runner">
      <header className="runner-header">
        <button className="btn-exit" onClick={onExit}>
          ← Exit Quest
        </button>
        <div className="quest-title">
          <span className="material-symbols-outlined quest-icon">{getQuestTypeIcon(quest.type)}</span>
          <h2>{quest.title}</h2>
        </div>
        <div className="quest-reward">
          <span className="xp">+{quest.xp} XP</span>
        </div>
      </header>

      {/* AI Toggle */}
      <button 
        className={`ai-toggle-mini ${aiAssistantOpen ? 'active' : ''}`}
        onClick={toggleAI}
      >
        <span className="material-symbols-outlined">smart_toy</span> AI Help
      </button>

      <main className="runner-content">
        {quest.type === 'code' && (
          <div className="code-challenge">
            <div className="challenge-description">
              <h3>Challenge</h3>
              <p>Write a Python function that prints "Hello, World!"</p>
            </div>
            <div className="code-editor">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
              />
            </div>
            <div className="code-actions">
              <button className="btn-run" onClick={runCode}>
                ▶ Run Code
              </button>
            </div>
            {output && (
              <div className="code-output">
                <pre>{output}</pre>
              </div>
            )}
          </div>
        )}

        {quest.type === 'flashcard' && (
          <div className="flashcard-quest">
            <div className="flashcard">
              <div className="flashcard-front">
                <p>What is a variable in Python?</p>
              </div>
            </div>
            <div className="flashcard-controls">
              <button className="btn-flip">Flip Card</button>
              <button className="btn-next" onClick={() => setScore(100)}>I Know This</button>
            </div>
          </div>
        )}

        {quest.type === 'quiz' && (
          <div className="quiz-quest">
            <div className="question">
              <h3>Question 1 of 5</h3>
              <p>Which of the following is a valid Python variable name?</p>
            </div>
            <div className="options">
              <button onClick={() => setScore(100)}>my_variable</button>
              <button>1variable</button>
              <button>my-variable</button>
              <button>class</button>
            </div>
          </div>
        )}

        {quest.type === 'simulation' && (
          <div className="simulation-quest">
            <canvas id="simulation-canvas" width={600} height={400} />
            <div className="simulation-controls">
              <label>Initial Velocity: <input type="range" min="0" max="100" /></label>
              <label>Angle: <input type="range" min="0" max="90" /></label>
              <button onClick={() => setScore(100)}>Launch!</button>
            </div>
          </div>
        )}

        {quest.type === 'boss' && (
          <div className="boss-battle">
            <div className="boss-icon"><span className="material-symbols-outlined">workspace_premium</span></div>
            <h3>Boss Challenge: {quest.title}</h3>
            <p>Complete this comprehensive challenge to prove your mastery!</p>
            <div className="boss-tasks">
              <div className="task completed">✓ Task 1: Define a function</div>
              <div className="task">○ Task 2: Add parameters</div>
              <div className="task">○ Task 3: Return a value</div>
            </div>
            <button className="btn-boss-fight" onClick={() => setScore(100)}>
              Begin Battle!
            </button>
          </div>
        )}
      </main>

      {score > 0 && (
        <div className="quest-complete-modal">
          <div className="complete-content">
            <div className="complete-icon">🎉</div>
            <h2>Quest Complete!</h2>
            <p>You earned <strong>+{quest.xp} XP</strong></p>
            <button className="btn-continue" onClick={() => onComplete(score)}>
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseQuest;
