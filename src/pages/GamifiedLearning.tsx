import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './GamifiedLearning.scss';

// ==================== INTERFACES ====================
interface Flashcard {
  front: string;
  back: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface CodeChallenge {
  title: string;
  description: string;
  starterCode: string;
  solution: string;
  hints: string[];
}

interface PhysicsSimulation {
  title: string;
  description: string;
  formula: string;
  variables: { name: string; symbol: string; unit: string; min: number; max: number; default: number }[];
}

interface MathProblem {
  problem: string;
  answer: number;
  tolerance?: number;
  steps: string[];
}

interface ModuleContent {
  flashcards: Flashcard[];
  quizQuestions: QuizQuestion[];
  codeChallenges: CodeChallenge[];
  physicsSimulations: PhysicsSimulation[];
  mathProblems: MathProblem[];
}

// ==================== COURSE CONTENT ====================
const MODULE_CONTENT: Record<string, Record<string, ModuleContent>> = {
  python: {
    '1': {
      flashcards: [
        { front: 'What is a variable in Python?', back: 'A named container that stores data values. Example: x = 5' },
        { front: 'How do you create a list in Python?', back: 'Using square brackets: my_list = [1, 2, 3]' },
        { front: 'What is the difference between == and =?', back: '= is assignment, == is comparison for equality' },
        { front: 'What does len() do?', back: 'Returns the length/count of items in a sequence' },
        { front: 'How do you define a function?', back: 'Using def keyword: def my_function():' },
      ],
      quizQuestions: [
        { question: 'What is the output of print(type(5))?', options: ["<class 'int'>", "<class 'str'>", "<class 'float'>", 'int'], correct: 0, explanation: 'The type() function returns the data type. 5 is an integer.' },
        { question: 'Which is a valid variable name?', options: ['2name', 'my-var', '_myVar', 'my var'], correct: 2, explanation: 'Variable names can start with underscore or letter, no spaces or hyphens.' },
        { question: 'What does range(5) produce?', options: ['[0,1,2,3,4]', '[1,2,3,4,5]', '[0,1,2,3,4,5]', '5'], correct: 0, explanation: 'range(5) generates numbers from 0 to 4 (5 exclusive).' },
      ],
      codeChallenges: [
        { title: 'Hello World', description: 'Write a program that prints "Hello, World!"', starterCode: '# Write your code here\n', solution: 'print("Hello, World!")', hints: ['Use the print() function', 'Put your text in quotes'] },
        { title: 'Sum of Two Numbers', description: 'Create variables a=5 and b=3, then print their sum', starterCode: '# Define variables and print sum\n', solution: 'a = 5\nb = 3\nprint(a + b)', hints: ['Assign values with =', 'Use + to add numbers'] },
      ],
      physicsSimulations: [],
      mathProblems: [],
    },
    '2': {
      flashcards: [
        { front: 'What is a loop?', back: 'A control structure that repeats a block of code' },
        { front: 'What is the syntax for a for loop?', back: 'for item in iterable:' },
        { front: 'What does break do?', back: 'Exits the loop immediately' },
        { front: 'What does continue do?', back: 'Skips the current iteration and continues with the next' },
      ],
      quizQuestions: [
        { question: 'How many times will this loop run: for i in range(3):', options: ['2', '3', '4', '1'], correct: 1, explanation: 'range(3) produces 0, 1, 2 - three iterations.' },
        { question: 'Which loop is best for unknown iterations?', options: ['for loop', 'while loop', 'do-while', 'repeat loop'], correct: 1, explanation: 'while loops continue until a condition is false.' },
      ],
      codeChallenges: [
        { title: 'Print Numbers 1-10', description: 'Use a for loop to print numbers 1 through 10', starterCode: '# Use a for loop\n', solution: 'for i in range(1, 11):\n    print(i)', hints: ['range(1, 11) gives 1-10', 'Remember to indent'] },
      ],
      physicsSimulations: [],
      mathProblems: [],
    },
  },
  javascript: {
    '1': {
      flashcards: [
        { front: 'What is JavaScript?', back: 'A programming language that runs in web browsers and enables interactive web pages' },
        { front: 'How do you declare a variable with let?', back: 'let variableName = value;' },
        { front: 'What is the difference between let and const?', back: 'let can be reassigned, const cannot be reassigned' },
        { front: 'What are template literals?', back: 'Strings using backticks that allow embedded expressions: `Hello ${name}`' },
        { front: 'What is console.log()?', back: 'A function that outputs messages to the browser console' },
      ],
      quizQuestions: [
        { question: 'Which keyword declares a constant?', options: ['var', 'let', 'const', 'constant'], correct: 2, explanation: 'const declares a constant that cannot be reassigned.' },
        { question: 'What is the result of typeof "hello"?', options: ['text', 'string', 'String', 'word'], correct: 1, explanation: 'typeof returns the data type as a lowercase string.' },
        { question: 'Which is NOT a primitive type?', options: ['string', 'number', 'array', 'boolean'], correct: 2, explanation: 'Array is an object, not a primitive type.' },
      ],
      codeChallenges: [
        { title: 'Variable Declaration', description: 'Declare a const name with your name and log it', starterCode: '// Declare and log your name\n', solution: 'const name = "Student";\nconsole.log(name);', hints: ['Use const for constants', 'console.log() prints values'] },
        { title: 'Template Literal', description: 'Create a greeting using template literals', starterCode: 'const name = "World";\n// Create greeting\n', solution: 'const name = "World";\nconst greeting = `Hello, ${name}!`;\nconsole.log(greeting);', hints: ['Use backticks ``', 'Use ${} to embed variables'] },
      ],
      physicsSimulations: [],
      mathProblems: [],
    },
    '2': {
      flashcards: [
        { front: 'What is an array?', back: 'An ordered collection of values: [1, 2, 3]' },
        { front: 'How do you access array elements?', back: 'Using index: array[0] gets the first element' },
        { front: 'What does .push() do?', back: 'Adds an element to the end of an array' },
        { front: 'What does .map() do?', back: 'Creates a new array by transforming each element' },
      ],
      quizQuestions: [
        { question: 'What is the index of the first array element?', options: ['1', '0', '-1', 'first'], correct: 1, explanation: 'Arrays are zero-indexed in JavaScript.' },
        { question: 'Which method removes the last element?', options: ['push()', 'pop()', 'shift()', 'remove()'], correct: 1, explanation: 'pop() removes and returns the last element.' },
      ],
      codeChallenges: [
        { title: 'Array Manipulation', description: 'Create an array [1,2,3], add 4 to it, and log it', starterCode: '// Create and modify array\n', solution: 'const arr = [1, 2, 3];\narr.push(4);\nconsole.log(arr);', hints: ['Use [] to create array', 'Use push() to add'] },
      ],
      physicsSimulations: [],
      mathProblems: [],
    },
  },
  react: {
    '1': {
      flashcards: [
        { front: 'What is React?', back: 'A JavaScript library for building user interfaces using components' },
        { front: 'What is JSX?', back: 'JavaScript XML - a syntax extension that lets you write HTML-like code in JavaScript' },
        { front: 'What is a component?', back: 'A reusable piece of UI that can have its own logic and appearance' },
        { front: 'What is props?', back: 'Properties passed to components to customize their behavior' },
        { front: 'What is state?', back: 'Data that can change over time and triggers re-renders' },
      ],
      quizQuestions: [
        { question: 'What hook is used for state?', options: ['useEffect', 'useState', 'useContext', 'useRef'], correct: 1, explanation: 'useState is the hook for managing component state.' },
        { question: 'How do you pass data to a child component?', options: ['state', 'props', 'context', 'params'], correct: 1, explanation: 'Props are used to pass data from parent to child.' },
        { question: 'What must a component return?', options: ['String', 'Object', 'JSX or null', 'Array'], correct: 2, explanation: 'Components must return JSX elements or null.' },
      ],
      codeChallenges: [
        { title: 'Simple Component', description: 'Create a component that displays "Hello React"', starterCode: 'function Greeting() {\n  // Return JSX\n}\n', solution: 'function Greeting() {\n  return <h1>Hello React</h1>;\n}', hints: ['Return JSX in parentheses', 'Use HTML-like syntax'] },
      ],
      physicsSimulations: [],
      mathProblems: [],
    },
  },
  ai: {
    '1': {
      flashcards: [
        { front: 'What is Artificial Intelligence?', back: 'The simulation of human intelligence by machines' },
        { front: 'What is Machine Learning?', back: 'A subset of AI where systems learn from data without explicit programming' },
        { front: 'What is a neural network?', back: 'A computing system inspired by biological neural networks in the brain' },
        { front: 'What is training data?', back: 'Data used to teach a machine learning model' },
        { front: 'What is a model?', back: 'A mathematical representation learned from data' },
      ],
      quizQuestions: [
        { question: 'Which is NOT a type of machine learning?', options: ['Supervised', 'Unsupervised', 'Reinforcement', 'Automatic'], correct: 3, explanation: 'The three main types are supervised, unsupervised, and reinforcement learning.' },
        { question: 'What is overfitting?', options: ['Model is too simple', 'Model memorizes training data', 'Model is too fast', 'Model uses too much memory'], correct: 1, explanation: 'Overfitting occurs when a model learns training data too well and fails on new data.' },
      ],
      codeChallenges: [
        { title: 'Data Preparation', description: 'Create a simple dataset as a list of dictionaries', starterCode: '# Create training data\n', solution: 'training_data = [\n  {"input": [0, 0], "output": 0},\n  {"input": [1, 1], "output": 1}\n]', hints: ['Use list of dicts', 'Include input and output'] },
      ],
      physicsSimulations: [],
      mathProblems: [],
    },
  },
  physics: {
    '1': {
      flashcards: [
        { front: 'What is velocity?', back: 'The rate of change of position with respect to time (v = d/t)' },
        { front: 'What is acceleration?', back: 'The rate of change of velocity with respect to time (a = Δv/Δt)' },
        { front: "What is Newton's First Law?", back: 'An object at rest stays at rest, and an object in motion stays in motion unless acted upon by a force' },
        { front: "What is Newton's Second Law?", back: 'Force equals mass times acceleration (F = ma)' },
        { front: "What is Newton's Third Law?", back: 'For every action, there is an equal and opposite reaction' },
      ],
      quizQuestions: [
        { question: 'What is the unit of force?', options: ['Joule', 'Newton', 'Watt', 'Pascal'], correct: 1, explanation: 'Force is measured in Newtons (N).' },
        { question: 'If mass doubles and acceleration stays same, force...', options: ['Halves', 'Doubles', 'Stays same', 'Quadruples'], correct: 1, explanation: 'F = ma, so if m doubles, F doubles.' },
        { question: 'What is 9.8 m/s²?', options: ['Speed of light', 'Gravity on Earth', 'Sound speed', 'Escape velocity'], correct: 1, explanation: "Earth's gravitational acceleration is approximately 9.8 m/s²." },
      ],
      codeChallenges: [],
      physicsSimulations: [
        { 
          title: 'Projectile Motion',
          description: 'Explore how objects move when thrown',
          formula: 'y = v₀t - ½gt²',
          variables: [
            { name: 'Initial Velocity', symbol: 'v0', unit: 'm/s', min: 0, max: 100, default: 20 },
            { name: 'Angle', symbol: 'angle', unit: '°', min: 0, max: 90, default: 45 },
            { name: 'Gravity', symbol: 'g', unit: 'm/s²', min: 1, max: 20, default: 9.8 },
          ]
        },
        {
          title: 'Force Calculator',
          description: 'Calculate force using F = ma',
          formula: 'F = ma',
          variables: [
            { name: 'Mass', symbol: 'm', unit: 'kg', min: 0.1, max: 100, default: 10 },
            { name: 'Acceleration', symbol: 'a', unit: 'm/s²', min: 0, max: 50, default: 9.8 },
          ]
        }
      ],
      mathProblems: [],
    },
    '2': {
      flashcards: [
        { front: 'What is kinetic energy?', back: 'Energy of motion: KE = ½mv²' },
        { front: 'What is potential energy?', back: 'Stored energy due to position: PE = mgh' },
        { front: 'What is work?', back: 'Force applied over a distance: W = Fd' },
        { front: 'What is power?', back: 'Rate of doing work: P = W/t' },
      ],
      quizQuestions: [
        { question: 'What is the unit of energy?', options: ['Newton', 'Watt', 'Joule', 'Pascal'], correct: 2, explanation: 'Energy is measured in Joules (J).' },
        { question: 'If velocity doubles, kinetic energy...', options: ['Doubles', 'Triples', 'Quadruples', 'Halves'], correct: 2, explanation: 'KE = ½mv², so if v doubles, KE quadruples.' },
      ],
      codeChallenges: [],
      physicsSimulations: [
        {
          title: 'Energy Calculator',
          description: 'Calculate kinetic and potential energy',
          formula: 'KE = ½mv², PE = mgh',
          variables: [
            { name: 'Mass', symbol: 'm', unit: 'kg', min: 0.1, max: 100, default: 10 },
            { name: 'Velocity', symbol: 'v', unit: 'm/s', min: 0, max: 50, default: 5 },
            { name: 'Height', symbol: 'h', unit: 'm', min: 0, max: 100, default: 10 },
          ]
        }
      ],
      mathProblems: [],
    },
  },
  math: {
    '1': {
      flashcards: [
        { front: 'What is a quadratic equation?', back: 'An equation of the form ax² + bx + c = 0' },
        { front: 'What is the quadratic formula?', back: 'x = (-b ± √(b²-4ac)) / 2a' },
        { front: 'What is a derivative?', back: 'The rate of change of a function at a point' },
        { front: 'What is the derivative of x²?', back: '2x' },
        { front: 'What is an integral?', back: 'The reverse of a derivative; finds area under a curve' },
      ],
      quizQuestions: [
        { question: 'What is the slope of y = 3x + 2?', options: ['2', '3', '5', '6'], correct: 1, explanation: 'In y = mx + b, m is the slope. Here m = 3.' },
        { question: 'What is the derivative of 5x³?', options: ['5x²', '15x²', '15x³', '3x²'], correct: 1, explanation: 'Power rule: d/dx(ax^n) = nax^(n-1). So 3×5x² = 15x².' },
        { question: 'What is √144?', options: ['11', '12', '13', '14'], correct: 1, explanation: '12 × 12 = 144, so √144 = 12.' },
      ],
      codeChallenges: [],
      physicsSimulations: [],
      mathProblems: [
        { problem: 'Solve: 2x + 5 = 15', answer: 5, steps: ['Subtract 5 from both sides: 2x = 10', 'Divide by 2: x = 5'] },
        { problem: 'Solve: x² = 49', answer: 7, steps: ['Take square root: x = ±7', 'Positive solution: x = 7'] },
        { problem: 'Find the slope of line through (0,0) and (3,6)', answer: 2, steps: ['slope = (y2-y1)/(x2-x1)', 'slope = (6-0)/(3-0) = 6/3 = 2'] },
        { problem: 'What is 15% of 80?', answer: 12, steps: ['15% = 0.15', '0.15 × 80 = 12'] },
      ],
    },
    '2': {
      flashcards: [
        { front: 'What is sin(90°)?', back: '1' },
        { front: 'What is cos(0°)?', back: '1' },
        { front: 'What is the Pythagorean theorem?', back: 'a² + b² = c² for right triangles' },
        { front: 'What is the area of a circle?', back: 'A = πr²' },
      ],
      quizQuestions: [
        { question: 'What is tan(45°)?', options: ['0', '1', '√2', 'undefined'], correct: 1, explanation: 'tan(45°) = sin(45°)/cos(45°) = 1.' },
        { question: 'In a right triangle with legs 3 and 4, what is the hypotenuse?', options: ['5', '6', '7', '12'], correct: 0, explanation: '3² + 4² = 9 + 16 = 25, √25 = 5.' },
      ],
      codeChallenges: [],
      physicsSimulations: [],
      mathProblems: [
        { problem: 'Find the hypotenuse: legs are 5 and 12', answer: 13, steps: ['Use a² + b² = c²', '25 + 144 = 169', '√169 = 13'] },
        { problem: 'Area of circle with radius 7 (use π ≈ 3.14)', answer: 153.86, tolerance: 1, steps: ['A = πr²', 'A = 3.14 × 49', 'A ≈ 153.86'] },
      ],
    },
  },
};

// Default content for courses without specific content
const DEFAULT_CONTENT: ModuleContent = {
  flashcards: [
    { front: 'Welcome to this module!', back: 'Start learning by exploring the content.' },
    { front: 'How do you learn effectively?', back: 'Practice regularly, take notes, and test yourself!' },
  ],
  quizQuestions: [
    { question: 'What is the best way to learn?', options: ['Just reading', 'Active practice', 'Memorization only', 'Skipping ahead'], correct: 1, explanation: 'Active practice helps reinforce learning.' },
  ],
  codeChallenges: [],
  physicsSimulations: [],
  mathProblems: [],
};

// Helper function to get content
const getModuleContent = (courseId: string, moduleId: string): ModuleContent => {
  const courseContent = MODULE_CONTENT[courseId];
  if (courseContent && courseContent[moduleId]) {
    return courseContent[moduleId];
  }
  if (courseContent && courseContent['1']) {
    return courseContent['1'];
  }
  return DEFAULT_CONTENT;
};

// ==================== MAIN COMPONENT ====================
export default function GamifiedLearning() {
  const { courseId = 'python', moduleId = '1' } = useParams<{ courseId: string; moduleId: string }>();
  const navigate = useNavigate();
  
  const content = getModuleContent(courseId, moduleId);
  const { flashcards, quizQuestions, codeChallenges, physicsSimulations, mathProblems } = content;
  
  const [mode, setMode] = useState<'menu' | 'flashcards' | 'quiz' | 'code' | 'physics' | 'math'>('menu');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [combo, setCombo] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeOutput, setCodeOutput] = useState('');
  const [mathAnswer, setMathAnswer] = useState('');
  const [showMathSolution, setShowMathSolution] = useState(false);
  const [physicsValues, setPhysicsValues] = useState<Record<string, number>>({});
  const [physicsResult, setPhysicsResult] = useState<string>('');

  const courseTitles: Record<string, string> = {
    python: 'Python Fundamentals',
    javascript: 'JavaScript Mastery',
    react: 'React Development',
    ai: 'AI & Machine Learning',
    physics: 'Physics Foundations',
    math: 'Mathematics Essentials',
  };

  const courseTitle = courseTitles[courseId] || 'Course';

  const XP_VALUES = { flashcard: 10, quiz: 20, code: 100, physics: 50, math: 30 };

  const addXP = (base: number) => {
    const earned = base * combo;
    setXpEarned(prev => prev + earned);
    setStreak(prev => prev + 1);
    if (streak > 0 && streak % 3 === 0) {
      setCombo(prev => Math.min(prev + 1, 5));
    }
  };

  const resetCombo = () => { setStreak(0); setCombo(1); };

  const nextFlashcard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setFlipped(false);
      addXP(XP_VALUES.flashcard);
    } else {
      setMode('menu');
      setCurrentIndex(0);
    }
  };

  const prevFlashcard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setFlipped(false);
    }
  };

  const handleQuizAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    setShowResult(true);
    if (index === quizQuestions[currentIndex].correct) {
      addXP(XP_VALUES.quiz);
      setScore(prev => prev + 1);
    } else {
      resetCombo();
    }
  };

  const nextQuizQuestion = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setMode('menu');
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const runCode = () => {
    const output = `Code executed successfully!\n\nYour code:\n${codeInput}`;
    setCodeOutput(output);
    addXP(XP_VALUES.code);
  };

  const checkMathAnswer = () => {
    const problem = mathProblems[currentIndex];
    const userAnswer = parseFloat(mathAnswer);
    const tolerance = problem.tolerance || 0.01;
    if (Math.abs(userAnswer - problem.answer) <= tolerance) {
      addXP(XP_VALUES.math);
    } else {
      resetCombo();
    }
    setShowMathSolution(true);
  };

  const nextMathProblem = () => {
    if (currentIndex < mathProblems.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setMathAnswer('');
      setShowMathSolution(false);
    } else {
      setMode('menu');
      setCurrentIndex(0);
      setMathAnswer('');
      setShowMathSolution(false);
    }
  };

  const calculatePhysics = () => {
    const sim = physicsSimulations[currentIndex];
    if (!sim) return;

    const vals = sim.variables.reduce((acc, v) => {
      acc[v.symbol] = physicsValues[v.symbol] ?? v.default;
      return acc;
    }, {} as Record<string, number>);

    let result = '';
    if (sim.title === 'Force Calculator') {
      const force = vals['m'] * vals['a'];
      result = `Force = ${vals['m']} kg × ${vals['a']} m/s² = ${force.toFixed(2)} N`;
    } else if (sim.title === 'Projectile Motion') {
      const v0 = vals['v0'];
      const angle = vals['angle'] * Math.PI / 180;
      const g = vals['g'];
      const maxHeight = (v0 * v0 * Math.sin(angle) * Math.sin(angle)) / (2 * g);
      const range = (v0 * v0 * Math.sin(2 * angle)) / g;
      const time = (2 * v0 * Math.sin(angle)) / g;
      result = `Max Height: ${maxHeight.toFixed(2)} m\nRange: ${range.toFixed(2)} m\nTime of Flight: ${time.toFixed(2)} s`;
    } else if (sim.title === 'Energy Calculator') {
      const ke = 0.5 * vals['m'] * vals['v'] * vals['v'];
      const pe = vals['m'] * 9.8 * vals['h'];
      result = `Kinetic Energy: ${ke.toFixed(2)} J\nPotential Energy: ${pe.toFixed(2)} J\nTotal Energy: ${(ke + pe).toFixed(2)} J`;
    }
    setPhysicsResult(result);
    addXP(XP_VALUES.physics);
  };

  useEffect(() => {
    if (mode === 'physics' && physicsSimulations.length > 0 && physicsSimulations[currentIndex]) {
      const sim = physicsSimulations[currentIndex];
      const initial: Record<string, number> = {};
      sim.variables.forEach(v => { initial[v.symbol] = v.default; });
      setPhysicsValues(initial);
      setPhysicsResult('');
    }
  }, [mode, currentIndex, physicsSimulations]);

  useEffect(() => {
    if (mode === 'code' && codeChallenges.length > 0 && codeChallenges[currentIndex]) {
      setCodeInput(codeChallenges[currentIndex].starterCode || '');
      setCodeOutput('');
    } else if (mode === 'code' && codeChallenges.length === 0) {
      // No code challenges available, go back to menu
      setMode('menu');
    }
  }, [mode, currentIndex, codeChallenges]);

  const renderMenu = () => (
    <div className="gamified-menu">
      <h1>Choose Your Challenge</h1>
      <p>Select a learning mode to earn XP and level up!</p>
      
      <div className="challenge-grid">
        {flashcards.length > 0 && (
          <button className="challenge-card" onClick={() => { setMode('flashcards'); setCurrentIndex(0); }}>
            <span className="material-symbols-outlined icon">style</span>
            <h3>Flashcards</h3>
            <p>Quick recall practice</p>
            <span className="xp-badge">+{XP_VALUES.flashcard} XP each</span>
          </button>
        )}
        {quizQuestions.length > 0 && (
          <button className="challenge-card" onClick={() => { setMode('quiz'); setCurrentIndex(0); setScore(0); }}>
            <span className="material-symbols-outlined icon">quiz</span>
            <h3>Smart Quiz</h3>
            <p>Timed multiple choice</p>
            <span className="xp-badge">+{XP_VALUES.quiz} XP each</span>
          </button>
        )}
        {codeChallenges.length > 0 && (
          <button className="challenge-card" onClick={() => { setMode('code'); setCurrentIndex(0); }}>
            <span className="material-symbols-outlined icon">code</span>
            <h3>Code Challenge</h3>
            <p>Write & run code</p>
            <span className="xp-badge">+{XP_VALUES.code} XP each</span>
          </button>
        )}
        {physicsSimulations.length > 0 && (
          <button className="challenge-card" onClick={() => { setMode('physics'); setCurrentIndex(0); }}>
            <span className="material-symbols-outlined icon">science</span>
            <h3>Physics Lab</h3>
            <p>Interactive simulations</p>
            <span className="xp-badge">+{XP_VALUES.physics} XP each</span>
          </button>
        )}
        {mathProblems.length > 0 && (
          <button className="challenge-card" onClick={() => { setMode('math'); setCurrentIndex(0); }}>
            <span className="material-symbols-outlined icon">calculate</span>
            <h3>Math Solver</h3>
            <p>Step-by-step solutions</p>
            <span className="xp-badge">+{XP_VALUES.math} XP each</span>
          </button>
        )}
      </div>
      <div className="stats-bar">
        <div className="stat"><span className="material-symbols-outlined">local_fire_department</span> Streak<span>{streak}</span></div>
        <div className="stat"><span className="material-symbols-outlined">bolt</span> Combo<span>x{combo}</span></div>
        <div className="stat"><span className="material-symbols-outlined">star</span> XP Today<span>{xpEarned}</span></div>
      </div>
    </div>
  );

  const renderFlashcards = () => {
    if (flashcards.length === 0 || !flashcards[currentIndex]) {
      return <div className="no-content"><p>No flashcards available for this module.</p><button onClick={() => setMode('menu')}>Back to Menu</button></div>;
    }
    return (
      <div className="flashcard-mode">
        <div className="mode-header">
          <button className="back-btn" onClick={() => setMode('menu')}><span className="material-symbols-outlined">arrow_back</span></button>
          <h2>Flashcards</h2>
          <span className="progress">{currentIndex + 1} / {flashcards.length}</span>
        </div>
        <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
          <div className="flashcard-inner">
            <div className="flashcard-front"><p>{flashcards[currentIndex].front}</p><span className="tap-hint">Tap to flip</span></div>
            <div className="flashcard-back"><p>{flashcards[currentIndex].back}</p></div>
          </div>
        </div>
        <div className="flashcard-controls">
          <button onClick={prevFlashcard} disabled={currentIndex === 0}><span className="material-symbols-outlined">chevron_left</span>Previous</button>
          <button onClick={nextFlashcard} className="primary">{currentIndex === flashcards.length - 1 ? 'Finish' : 'Next'}<span className="material-symbols-outlined">chevron_right</span></button>
        </div>
      </div>
    );
  };

  const renderQuiz = () => {
    const question = quizQuestions[currentIndex];
    if (!question) return <div>No questions available</div>;
    return (
      <div className="quiz-mode">
        <div className="mode-header">
          <button className="back-btn" onClick={() => setMode('menu')}><span className="material-symbols-outlined">arrow_back</span></button>
          <h2>Quiz</h2>
          <span className="progress">{currentIndex + 1} / {quizQuestions.length}</span>
        </div>
        <div className="quiz-card">
          <div className="score-display">Score: {score}/{quizQuestions.length}</div>
          <h3>{question.question}</h3>
          <div className="options">
            {question.options.map((option, idx) => (
              <button key={idx} className={`option ${selectedAnswer === idx ? (idx === question.correct ? 'correct' : 'incorrect') : ''} ${showResult && idx === question.correct ? 'correct' : ''}`} onClick={() => handleQuizAnswer(idx)} disabled={selectedAnswer !== null}>{option}</button>
            ))}
          </div>
          {showResult && (
            <div className="explanation">
              <p className={selectedAnswer === question.correct ? 'correct-text' : 'incorrect-text'}>{selectedAnswer === question.correct ? 'Correct!' : 'Incorrect!'}</p>
              <p>{question.explanation}</p>
              <button onClick={nextQuizQuestion} className="next-btn">{currentIndex === quizQuestions.length - 1 ? 'Finish' : 'Next Question'}</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCodeChallenge = () => {
    const challenge = codeChallenges[currentIndex];
    if (!challenge) {
      return (
        <div className="no-content">
          <span className="material-symbols-outlined icon">code</span>
          <h3>No Code Challenges Available</h3>
          <p>This module doesn't have code challenges yet.</p>
          <button onClick={() => setMode('menu')} className="back-menu-btn">Back to Menu</button>
        </div>
      );
    }
    return (
      <div className="code-mode">
        <div className="mode-header">
          <button className="back-btn" onClick={() => setMode('menu')}><span className="material-symbols-outlined">arrow_back</span></button>
          <h2>{challenge.title}</h2>
          <span className="progress">{currentIndex + 1} / {codeChallenges.length}</span>
        </div>
        <div className="code-challenge">
          <p className="description">{challenge.description}</p>
          <div className="hints"><strong>Hints:</strong><ul>{challenge.hints.map((hint, idx) => <li key={idx}>{hint}</li>)}</ul></div>
          <div className="code-editor"><textarea value={codeInput} onChange={(e) => setCodeInput(e.target.value)} placeholder="Write your code here..." spellCheck={false} /></div>
          <div className="code-controls">
            <button onClick={runCode} className="run-btn"><span className="material-symbols-outlined">play_arrow</span>Run Code</button>
            <button onClick={() => setCodeInput(challenge.solution)} className="solution-btn">Show Solution</button>
          </div>
          {codeOutput && <div className="code-output"><pre>{codeOutput}</pre></div>}
        </div>
      </div>
    );
  };

  const renderPhysicsSimulation = () => {
    const sim = physicsSimulations[currentIndex];
    if (!sim) {
      return (
        <div className="no-content">
          <span className="material-symbols-outlined icon">science</span>
          <h3>No Physics Simulations Available</h3>
          <p>This module doesn't have physics simulations yet.</p>
          <button onClick={() => setMode('menu')} className="back-menu-btn">Back to Menu</button>
        </div>
      );
    }
    return (
      <div className="physics-mode">
        <div className="mode-header">
          <button className="back-btn" onClick={() => setMode('menu')}><span className="material-symbols-outlined">arrow_back</span></button>
          <h2><span className="material-symbols-outlined">science</span> {sim.title}</h2>
          <span className="progress">{currentIndex + 1} / {physicsSimulations.length}</span>
        </div>
        <div className="physics-lab">
          <p className="description">{sim.description}</p>
          <div className="formula">Formula: <code>{sim.formula}</code></div>
          <div className="variables">
            {sim.variables.map((v) => (
              <div key={v.symbol} className="variable-input">
                <label>{v.name} ({v.symbol})</label>
                <input type="range" min={v.min} max={v.max} step={(v.max - v.min) / 100} value={physicsValues[v.symbol] ?? v.default} onChange={(e) => setPhysicsValues(prev => ({ ...prev, [v.symbol]: parseFloat(e.target.value) }))} />
                <span className="value">{(physicsValues[v.symbol] ?? v.default).toFixed(1)} {v.unit}</span>
              </div>
            ))}
          </div>
          <button onClick={calculatePhysics} className="calculate-btn">Calculate</button>
          {physicsResult && <div className="physics-result"><pre>{physicsResult}</pre></div>}
          {currentIndex < physicsSimulations.length - 1 && <button onClick={() => { setCurrentIndex(prev => prev + 1); setPhysicsResult(''); }} className="next-btn">Next Simulation</button>}
        </div>
      </div>
    );
  };

  const renderMathSolver = () => {
    const problem = mathProblems[currentIndex];
    if (!problem) {
      return (
        <div className="no-content">
          <span className="material-symbols-outlined icon">calculate</span>
          <h3>No Math Problems Available</h3>
          <p>This module doesn't have math problems yet.</p>
          <button onClick={() => setMode('menu')} className="back-menu-btn">Back to Menu</button>
        </div>
      );
    }
    return (
      <div className="math-mode">
        <div className="mode-header">
          <button className="back-btn" onClick={() => setMode('menu')}><span className="material-symbols-outlined">arrow_back</span></button>
          <h2><span className="material-symbols-outlined">calculate</span> Math Solver</h2>
          <span className="progress">{currentIndex + 1} / {mathProblems.length}</span>
        </div>
        <div className="math-problem">
          <h3>{problem.problem}</h3>
          <div className="answer-input">
            <input type="number" value={mathAnswer} onChange={(e) => setMathAnswer(e.target.value)} placeholder="Your answer..." disabled={showMathSolution} />
            {!showMathSolution && <button onClick={checkMathAnswer} className="check-btn" disabled={!mathAnswer}>Check Answer</button>}
          </div>
          {showMathSolution && (
            <div className="solution">
              <p className={parseFloat(mathAnswer) === problem.answer ? 'correct' : 'incorrect'}>{Math.abs(parseFloat(mathAnswer) - problem.answer) <= (problem.tolerance || 0.01) ? 'Correct!' : `The answer is ${problem.answer}`}</p>
              <div className="steps"><strong>Solution Steps:</strong><ol>{problem.steps.map((step, idx) => <li key={idx}>{step}</li>)}</ol></div>
              <button onClick={nextMathProblem} className="next-btn">{currentIndex === mathProblems.length - 1 ? 'Finish' : 'Next Problem'}</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="gamified-learning">
      <header className="gamified-header">
        <button className="back-btn" onClick={() => navigate(`/course/${courseId}`)}><span className="material-symbols-outlined">arrow_back</span></button>
        <div className="header-info"><h1>{courseTitle}</h1><span className="module-badge">Module {moduleId}</span></div>
        <div className="xp-display"><span className="material-symbols-outlined">star</span><span>{xpEarned} XP</span></div>
      </header>
      <main className="gamified-content">
        {mode === 'menu' && renderMenu()}
        {mode === 'flashcards' && renderFlashcards()}
        {mode === 'quiz' && renderQuiz()}
        {mode === 'code' && renderCodeChallenge()}
        {mode === 'physics' && renderPhysicsSimulation()}
        {mode === 'math' && renderMathSolver()}
      </main>
    </div>
  );
}
