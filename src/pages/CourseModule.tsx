import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CourseModule.scss';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
}

interface Module {
  id: number;
  title: string;
  content: string;
  duration: string;
  xp: number;
  quiz?: Question[];
}

const courseData: Record<string, { title: string; modules: Module[] }> = {
  'python': {
    title: 'Python Programming',
    modules: [
      {
        id: 1,
        title: 'Introduction to Python',
        content: `Python is a high-level, interpreted programming language known for its simplicity and readability. Created by Guido van Rossum in 1991, Python has become one of the most popular languages for beginners and professionals alike.

**Key Features of Python:**
• Easy to learn and read - Python uses indentation for code blocks
• Versatile - used for web development, data science, AI, automation
• Large standard library - batteries included philosophy
• Cross-platform - runs on Windows, Mac, Linux

**Your First Python Program:**
\`\`\`python
# This is a comment
print("Hello, World!")

# Variables don't need type declarations
name = "Alice"
age = 25
print(f"My name is {name} and I am {age} years old")
\`\`\`

Python is dynamically typed, meaning you don't need to declare variable types. The interpreter figures it out at runtime.`,
        duration: '20 min',
        xp: 50,
        quiz: [
          {
            id: 1,
            question: 'Who created Python?',
            options: ['James Gosling', 'Guido van Rossum', 'Brendan Eich', 'Dennis Ritchie'],
            correct: 1,
          },
          {
            id: 2,
            question: 'What is used to define code blocks in Python?',
            options: ['Curly braces {}', 'Parentheses ()', 'Indentation', 'Square brackets []'],
            correct: 2,
          },
        ],
      },
      {
        id: 2,
        title: 'Variables and Data Types',
        content: `Python has several built-in data types that you'll use constantly in your programs.

**Numeric Types:**
\`\`\`python
integer_num = 42        # int
float_num = 3.14        # float
complex_num = 2 + 3j    # complex
\`\`\`

**String Type:**
\`\`\`python
name = "Python"
message = 'Hello, World!'
multiline = """This is a
multiline string"""

# String methods
print(name.upper())      # PYTHON
print(name.lower())      # python
print(len(name))         # 6
\`\`\`

**Boolean Type:**
\`\`\`python
is_active = True
is_deleted = False
\`\`\`

**Type Conversion:**
\`\`\`python
x = "123"
y = int(x)   # Convert string to integer
z = float(y) # Convert integer to float
\`\`\``,
        duration: '25 min',
        xp: 60,
        quiz: [
          {
            id: 1,
            question: 'What is the result of type(3.14)?',
            options: ['<class \'int\'>', '<class \'float\'>', '<class \'str\'>', '<class \'decimal\'>'],
            correct: 1,
          },
          {
            id: 2,
            question: 'How do you convert "42" to an integer?',
            options: ['integer("42")', 'int("42")', 'toInt("42")', 'Number("42")'],
            correct: 1,
          },
        ],
      },
      {
        id: 3,
        title: 'Control Flow - If Statements',
        content: `Control flow statements allow your program to make decisions based on conditions.

**If-Elif-Else:**
\`\`\`python
age = 18

if age < 13:
    print("Child")
elif age < 20:
    print("Teenager")
else:
    print("Adult")
\`\`\`

**Comparison Operators:**
• == Equal to
• != Not equal to
• < Less than
• > Greater than
• <= Less than or equal
• >= Greater than or equal

**Logical Operators:**
\`\`\`python
x = 10
y = 20

if x > 5 and y > 15:
    print("Both conditions true")

if x > 15 or y > 15:
    print("At least one condition true")

if not x > 15:
    print("x is not greater than 15")
\`\`\`

**Ternary Operator:**
\`\`\`python
status = "adult" if age >= 18 else "minor"
\`\`\``,
        duration: '25 min',
        xp: 75,
        quiz: [
          {
            id: 1,
            question: 'What keyword is used for else-if in Python?',
            options: ['else if', 'elsif', 'elif', 'elseif'],
            correct: 2,
          },
        ],
      },
      {
        id: 4,
        title: 'Loops - For and While',
        content: `Loops allow you to repeat code multiple times.

**For Loops:**
\`\`\`python
# Looping through a list
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)

# Using range()
for i in range(5):        # 0, 1, 2, 3, 4
    print(i)

for i in range(2, 6):     # 2, 3, 4, 5
    print(i)

for i in range(0, 10, 2): # 0, 2, 4, 6, 8
    print(i)
\`\`\`

**While Loops:**
\`\`\`python
count = 0
while count < 5:
    print(count)
    count += 1
\`\`\`

**Loop Control:**
\`\`\`python
# break - exit the loop entirely
for i in range(10):
    if i == 5:
        break
    print(i)  # 0, 1, 2, 3, 4

# continue - skip current iteration
for i in range(5):
    if i == 2:
        continue
    print(i)  # 0, 1, 3, 4
\`\`\``,
        duration: '30 min',
        xp: 80,
        quiz: [
          {
            id: 1,
            question: 'What does range(3) produce?',
            options: ['[1, 2, 3]', '[0, 1, 2]', '[0, 1, 2, 3]', '[3]'],
            correct: 1,
          },
        ],
      },
      {
        id: 5,
        title: 'Functions',
        content: `Functions are reusable blocks of code that perform specific tasks.

**Defining Functions:**
\`\`\`python
def greet(name):
    return f"Hello, {name}!"

message = greet("Alice")
print(message)  # Hello, Alice!
\`\`\`

**Default Parameters:**
\`\`\`python
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Bob"))           # Hello, Bob!
print(greet("Bob", "Hi"))     # Hi, Bob!
\`\`\`

**Multiple Return Values:**
\`\`\`python
def get_stats(numbers):
    return min(numbers), max(numbers), sum(numbers)

minimum, maximum, total = get_stats([1, 2, 3, 4, 5])
\`\`\`

**Lambda Functions:**
\`\`\`python
square = lambda x: x ** 2
print(square(5))  # 25

# Useful with map/filter
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x ** 2, numbers))
\`\`\``,
        duration: '35 min',
        xp: 100,
        quiz: [
          {
            id: 1,
            question: 'What keyword is used to define a function?',
            options: ['function', 'func', 'def', 'define'],
            correct: 2,
          },
          {
            id: 2,
            question: 'What is a lambda function?',
            options: ['A function with no name', 'An anonymous small function', 'A recursive function', 'A built-in function'],
            correct: 1,
          },
        ],
      },
      {
        id: 6,
        title: 'Lists and Dictionaries',
        content: `Lists and dictionaries are essential data structures in Python.

**Lists:**
\`\`\`python
# Creating lists
fruits = ["apple", "banana", "cherry"]

# Accessing elements
print(fruits[0])    # apple
print(fruits[-1])   # cherry (last element)

# List methods
fruits.append("date")      # Add to end
fruits.insert(1, "apricot") # Insert at index
fruits.remove("banana")    # Remove by value
popped = fruits.pop()      # Remove and return last
\`\`\`

**List Comprehensions:**
\`\`\`python
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]
\`\`\`

**Dictionaries:**
\`\`\`python
person = {
    "name": "Alice",
    "age": 25,
    "city": "New York"
}

# Accessing values
print(person["name"])      # Alice
print(person.get("job", "Unknown"))  # Unknown (default)

# Adding/updating
person["job"] = "Engineer"
person.update({"age": 26, "hobby": "reading"})

# Dictionary comprehension
squares = {x: x**2 for x in range(5)}
\`\`\``,
        duration: '40 min',
        xp: 120,
      },
    ],
  },
  'javascript': {
    title: 'JavaScript Mastery',
    modules: [
      {
        id: 1,
        title: 'Introduction to JavaScript',
        content: `JavaScript is the programming language of the web. It runs in browsers and on servers (Node.js), making it essential for modern web development.

**Key Characteristics:**
• Dynamic typing - variables can hold any type
• Event-driven - responds to user interactions
• Prototype-based OOP - objects inherit from objects
• First-class functions - functions are values

**Your First JavaScript:**
\`\`\`javascript
// Variables
let name = "Alice";       // can be reassigned
const PI = 3.14159;       // cannot be reassigned
var oldStyle = "legacy";  // function-scoped (avoid)

// Console output
console.log("Hello, World!");
console.log(\`My name is \${name}\`);  // Template literal

// Basic function
function greet(name) {
    return \`Hello, \${name}!\`;
}
\`\`\`

**Running JavaScript:**
• In browser console (F12 → Console)
• In HTML: \`<script src="app.js"></script>\`
• With Node.js: \`node app.js\``,
        duration: '20 min',
        xp: 50,
        quiz: [
          {
            id: 1,
            question: 'Which keyword creates a constant variable?',
            options: ['let', 'var', 'const', 'constant'],
            correct: 2,
          },
          {
            id: 2,
            question: 'What is the correct way to write a template literal?',
            options: ['\'Hello ${name}\'', '"Hello ${name}"', '`Hello ${name}`', '(Hello ${name})'],
            correct: 2,
          },
        ],
      },
      {
        id: 2,
        title: 'Data Types and Operators',
        content: `JavaScript has 8 data types: 7 primitives and objects.

**Primitive Types:**
\`\`\`javascript
// String
let text = "Hello";

// Number (integers and floats)
let count = 42;
let price = 19.99;

// Boolean
let isActive = true;

// Undefined
let unknown;  // undefined by default

// Null
let empty = null;

// Symbol (unique identifier)
let sym = Symbol("id");

// BigInt (large integers)
let big = 9007199254740991n;
\`\`\`

**Type Checking:**
\`\`\`javascript
typeof "hello"   // "string"
typeof 42        // "number"
typeof true      // "boolean"
typeof {}        // "object"
typeof []        // "object" (arrays are objects!)
typeof null      // "object" (quirk of JS)
\`\`\`

**Operators:**
\`\`\`javascript
// Comparison
5 == "5"    // true (loose equality)
5 === "5"   // false (strict equality)

// Logical
true && false  // false
true || false  // true
!true          // false

// Nullish coalescing
let value = null ?? "default";  // "default"

// Optional chaining
let city = user?.address?.city;  // undefined if any is null
\`\`\``,
        duration: '25 min',
        xp: 60,
        quiz: [
          {
            id: 1,
            question: 'What is the result of 5 === "5"?',
            options: ['true', 'false', 'undefined', 'Error'],
            correct: 1,
          },
        ],
      },
      {
        id: 3,
        title: 'Arrays and Array Methods',
        content: `Arrays are ordered collections of values.

**Creating Arrays:**
\`\`\`javascript
const fruits = ["apple", "banana", "cherry"];
const mixed = [1, "two", true, { name: "object" }];
\`\`\`

**Essential Array Methods:**
\`\`\`javascript
// Adding/Removing
fruits.push("date");       // Add to end
fruits.pop();              // Remove from end
fruits.unshift("apricot"); // Add to start
fruits.shift();            // Remove from start

// Finding
fruits.indexOf("banana");  // 1
fruits.includes("cherry"); // true
fruits.find(f => f.length > 5);  // "banana"

// Transforming
const numbers = [1, 2, 3, 4, 5];

// map - transform each element
const doubled = numbers.map(n => n * 2);
// [2, 4, 6, 8, 10]

// filter - keep elements matching condition
const evens = numbers.filter(n => n % 2 === 0);
// [2, 4]

// reduce - combine into single value
const sum = numbers.reduce((acc, n) => acc + n, 0);
// 15

// Chaining
const result = numbers
    .filter(n => n > 2)
    .map(n => n * 2)
    .reduce((a, b) => a + b);
\`\`\``,
        duration: '30 min',
        xp: 80,
        quiz: [
          {
            id: 1,
            question: 'Which method transforms each element in an array?',
            options: ['filter', 'reduce', 'map', 'forEach'],
            correct: 2,
          },
        ],
      },
      {
        id: 4,
        title: 'Objects and Classes',
        content: `Objects are collections of key-value pairs.

**Object Literals:**
\`\`\`javascript
const person = {
    name: "Alice",
    age: 25,
    greet() {
        return \`Hi, I'm \${this.name}\`;
    }
};

// Accessing properties
console.log(person.name);      // Alice
console.log(person["age"]);    // 25

// Destructuring
const { name, age } = person;
\`\`\`

**Classes (ES6+):**
\`\`\`javascript
class Animal {
    constructor(name) {
        this.name = name;
    }
    
    speak() {
        console.log(\`\${this.name} makes a sound\`);
    }
}

class Dog extends Animal {
    constructor(name, breed) {
        super(name);  // Call parent constructor
        this.breed = breed;
    }
    
    speak() {
        console.log(\`\${this.name} barks!\`);
    }
}

const dog = new Dog("Rex", "German Shepherd");
dog.speak();  // Rex barks!
\`\`\``,
        duration: '35 min',
        xp: 100,
      },
      {
        id: 5,
        title: 'Async JavaScript',
        content: `JavaScript is single-threaded but handles async operations elegantly.

**Callbacks:**
\`\`\`javascript
setTimeout(() => {
    console.log("After 1 second");
}, 1000);
\`\`\`

**Promises:**
\`\`\`javascript
const fetchData = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const success = true;
            if (success) {
                resolve({ data: "Hello" });
            } else {
                reject(new Error("Failed"));
            }
        }, 1000);
    });
};

fetchData()
    .then(result => console.log(result))
    .catch(error => console.error(error));
\`\`\`

**Async/Await (Modern):**
\`\`\`javascript
async function getData() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}

// Arrow function version
const getData = async () => {
    const data = await fetch('/api/data');
    return data.json();
};
\`\`\``,
        duration: '40 min',
        xp: 120,
        quiz: [
          {
            id: 1,
            question: 'What keyword is used before a function to use await inside it?',
            options: ['promise', 'await', 'async', 'defer'],
            correct: 2,
          },
        ],
      },
      {
        id: 6,
        title: 'DOM Manipulation',
        content: `The DOM (Document Object Model) represents HTML as a tree of objects.

**Selecting Elements:**
\`\`\`javascript
// Modern methods
const el = document.getElementById('myId');
const el = document.querySelector('.myClass');
const els = document.querySelectorAll('.items');
\`\`\`

**Modifying Elements:**
\`\`\`javascript
const heading = document.querySelector('h1');

// Content
heading.textContent = "New Title";
heading.innerHTML = "<span>Styled</span> Title";

// Attributes
heading.setAttribute('id', 'main-title');
heading.classList.add('highlight');
heading.classList.toggle('active');

// Styles
heading.style.color = 'blue';
heading.style.fontSize = '24px';
\`\`\`

**Event Handling:**
\`\`\`javascript
const button = document.querySelector('button');

button.addEventListener('click', (event) => {
    console.log('Button clicked!');
    console.log(event.target);
});

// Common events: click, submit, keydown, mouseover, load
\`\`\`

**Creating Elements:**
\`\`\`javascript
const newDiv = document.createElement('div');
newDiv.textContent = 'Hello';
newDiv.className = 'card';
document.body.appendChild(newDiv);
\`\`\``,
        duration: '35 min',
        xp: 100,
      },
    ],
  },
  'react': {
    title: 'React Development',
    modules: [
      {
        id: 1,
        title: 'Introduction to React',
        content: `React is a JavaScript library for building user interfaces, created by Facebook.

**Why React?**
• Component-based architecture
• Virtual DOM for efficient updates
• Declarative UI programming
• Large ecosystem and community

**Key Concepts:**
\`\`\`jsx
// A simple React component
function Welcome() {
    return <h1>Hello, React!</h1>;
}

// Using the component
function App() {
    return (
        <div>
            <Welcome />
        </div>
    );
}
\`\`\`

**JSX (JavaScript XML):**
\`\`\`jsx
// JSX allows HTML-like syntax in JavaScript
const element = <h1>Hello, {2 + 2}!</h1>;

// JSX is transformed to:
const element = React.createElement('h1', null, 'Hello, 4!');

// Expressions in JSX
const name = "Alice";
const greeting = <h1>Hello, {name.toUpperCase()}</h1>;
\`\`\`

**Setting Up:**
\`\`\`bash
npx create-react-app my-app
cd my-app
npm start
\`\`\``,
        duration: '25 min',
        xp: 60,
        quiz: [
          {
            id: 1,
            question: 'Who created React?',
            options: ['Google', 'Facebook (Meta)', 'Microsoft', 'Apple'],
            correct: 1,
          },
          {
            id: 2,
            question: 'What is JSX?',
            options: ['A new programming language', 'JavaScript XML syntax extension', 'A CSS framework', 'A testing library'],
            correct: 1,
          },
        ],
      },
      {
        id: 2,
        title: 'Components and Props',
        content: `Components are the building blocks of React applications.

**Function Components:**
\`\`\`jsx
function Greeting({ name, age }) {
    return (
        <div>
            <h1>Hello, {name}!</h1>
            <p>You are {age} years old.</p>
        </div>
    );
}

// Using the component
<Greeting name="Alice" age={25} />
\`\`\`

**Props:**
\`\`\`jsx
// Props are read-only!
function UserCard({ user }) {
    return (
        <div className="card">
            <img src={user.avatar} alt={user.name} />
            <h2>{user.name}</h2>
            <p>{user.email}</p>
        </div>
    );
}

// Passing objects
const user = { name: "Alice", email: "alice@example.com" };
<UserCard user={user} />

// Spread operator
<UserCard {...user} />
\`\`\`

**Children Prop:**
\`\`\`jsx
function Card({ children, title }) {
    return (
        <div className="card">
            <h2>{title}</h2>
            <div className="card-body">
                {children}
            </div>
        </div>
    );
}

<Card title="Profile">
    <p>This is the card content</p>
    <button>Click me</button>
</Card>
\`\`\``,
        duration: '30 min',
        xp: 75,
        quiz: [
          {
            id: 1,
            question: 'Are props mutable or immutable?',
            options: ['Mutable', 'Immutable', 'Depends on the component', 'Only mutable in class components'],
            correct: 1,
          },
        ],
      },
      {
        id: 3,
        title: 'State and useState Hook',
        content: `State allows components to manage dynamic data.

**useState Hook:**
\`\`\`jsx
import { useState } from 'react';

function Counter() {
    const [count, setCount] = useState(0);
    
    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>
                Increment
            </button>
            <button onClick={() => setCount(0)}>
                Reset
            </button>
        </div>
    );
}
\`\`\`

**Multiple State Variables:**
\`\`\`jsx
function Form() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    return (
        <form>
            <input 
                value={name} 
                onChange={(e) => setName(e.target.value)}
            />
            <input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
            />
        </form>
    );
}
\`\`\`

**Object State:**
\`\`\`jsx
const [user, setUser] = useState({ name: '', age: 0 });

// Update object (must create new object!)
setUser({ ...user, name: 'Alice' });
\`\`\``,
        duration: '35 min',
        xp: 90,
        quiz: [
          {
            id: 1,
            question: 'What does useState return?',
            options: ['Just the state value', 'Just the setter function', 'An array with [state, setter]', 'An object with state and setter'],
            correct: 2,
          },
        ],
      },
      {
        id: 4,
        title: 'useEffect and Lifecycle',
        content: `useEffect handles side effects in function components.

**Basic useEffect:**
\`\`\`jsx
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
    const [user, setUser] = useState(null);
    
    useEffect(() => {
        // This runs after every render
        document.title = user?.name || 'Loading...';
    });
    
    useEffect(() => {
        // This runs once on mount
        console.log('Component mounted');
    }, []);  // Empty dependency array
    
    useEffect(() => {
        // This runs when userId changes
        fetch(\`/api/users/\${userId}\`)
            .then(res => res.json())
            .then(data => setUser(data));
    }, [userId]);
    
    return <div>{user?.name}</div>;
}
\`\`\`

**Cleanup Function:**
\`\`\`jsx
useEffect(() => {
    const interval = setInterval(() => {
        console.log('Tick');
    }, 1000);
    
    // Cleanup runs on unmount or before re-run
    return () => {
        clearInterval(interval);
    };
}, []);
\`\`\``,
        duration: '40 min',
        xp: 100,
      },
      {
        id: 5,
        title: 'Handling Events and Forms',
        content: `React handles events similarly to DOM events, with some differences.

**Event Handling:**
\`\`\`jsx
function Button() {
    const handleClick = (event) => {
        event.preventDefault();
        console.log('Button clicked!');
    };
    
    return <button onClick={handleClick}>Click Me</button>;
}
\`\`\`

**Controlled Forms:**
\`\`\`jsx
function LoginForm() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Submitting:', formData);
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
            />
            <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
            />
            <button type="submit">Login</button>
        </form>
    );
}
\`\`\``,
        duration: '30 min',
        xp: 85,
      },
      {
        id: 6,
        title: 'React Router and Navigation',
        content: `React Router enables client-side routing in React apps.

**Setup:**
\`\`\`jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function App() {
    return (
        <BrowserRouter>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/about">About</Link>
                <Link to="/users/1">User 1</Link>
            </nav>
            
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/users/:id" element={<UserDetail />} />
            </Routes>
        </BrowserRouter>
    );
}
\`\`\`

**URL Parameters:**
\`\`\`jsx
import { useParams, useNavigate } from 'react-router-dom';

function UserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    return (
        <div>
            <h1>User {id}</h1>
            <button onClick={() => navigate('/users')}>
                Back to Users
            </button>
        </div>
    );
}
\`\`\``,
        duration: '35 min',
        xp: 95,
      },
    ],
  },
  'ai': {
    title: 'AI & Machine Learning',
    modules: [
      {
        id: 1,
        title: 'Introduction to AI',
        content: `Artificial Intelligence (AI) is the simulation of human intelligence by machines.

**Types of AI:**
• **Narrow AI (Weak AI):** Designed for specific tasks
  - Virtual assistants (Siri, Alexa)
  - Image recognition
  - Recommendation systems
  
• **General AI (Strong AI):** Human-level intelligence (theoretical)
• **Super AI:** Beyond human intelligence (hypothetical)

**Key Concepts:**
\`\`\`
Machine Learning: Systems that learn from data
Deep Learning: Neural networks with many layers
Natural Language Processing: Understanding human language
Computer Vision: Understanding visual information
\`\`\`

**AI Applications:**
• Healthcare: Disease diagnosis, drug discovery
• Finance: Fraud detection, trading algorithms
• Transportation: Self-driving cars
• Entertainment: Content recommendations

**Ethics in AI:**
• Bias in training data
• Privacy concerns
• Job displacement
• Transparency and explainability`,
        duration: '20 min',
        xp: 50,
        quiz: [
          {
            id: 1,
            question: 'What type of AI is Siri or Alexa?',
            options: ['General AI', 'Super AI', 'Narrow AI', 'Strong AI'],
            correct: 2,
          },
        ],
      },
      {
        id: 2,
        title: 'Machine Learning Fundamentals',
        content: `Machine Learning enables computers to learn from data without explicit programming.

**Types of Machine Learning:**

**1. Supervised Learning:**
\`\`\`
Input: Labeled data (features + target)
Output: Predictions on new data

Examples:
- Email spam detection (spam/not spam)
- House price prediction (price in dollars)
- Image classification (cat/dog)
\`\`\`

**2. Unsupervised Learning:**
\`\`\`
Input: Unlabeled data (features only)
Output: Patterns and structures

Examples:
- Customer segmentation
- Anomaly detection
- Topic modeling
\`\`\`

**3. Reinforcement Learning:**
\`\`\`
Agent learns by interacting with environment
Receives rewards/penalties for actions

Examples:
- Game playing (AlphaGo, Chess)
- Robot navigation
- Trading strategies
\`\`\`

**The ML Pipeline:**
1. Data Collection
2. Data Preprocessing
3. Feature Engineering
4. Model Selection
5. Training
6. Evaluation
7. Deployment`,
        duration: '30 min',
        xp: 75,
        quiz: [
          {
            id: 1,
            question: 'Which ML type uses labeled data?',
            options: ['Unsupervised Learning', 'Reinforcement Learning', 'Supervised Learning', 'Deep Learning'],
            correct: 2,
          },
        ],
      },
      {
        id: 3,
        title: 'Neural Networks',
        content: `Neural networks are computing systems inspired by biological neural networks.

**Structure:**
\`\`\`
Input Layer → Hidden Layers → Output Layer

Each neuron:
- Receives inputs
- Applies weights and bias
- Passes through activation function
- Produces output
\`\`\`

**Key Components:**

**Weights:** Connection strengths between neurons
**Bias:** Additional parameter for flexibility
**Activation Functions:**
\`\`\`
ReLU: f(x) = max(0, x)
Sigmoid: f(x) = 1 / (1 + e^(-x))
Tanh: f(x) = (e^x - e^(-x)) / (e^x + e^(-x))
\`\`\`

**Training Process:**
1. **Forward Propagation:** Input → Output
2. **Calculate Loss:** Compare prediction vs actual
3. **Backpropagation:** Calculate gradients
4. **Update Weights:** Gradient descent

**Common Architectures:**
• **CNN (Convolutional Neural Network):** Images
• **RNN (Recurrent Neural Network):** Sequences
• **Transformer:** NLP, modern LLMs`,
        duration: '35 min',
        xp: 90,
      },
      {
        id: 4,
        title: 'Natural Language Processing',
        content: `NLP enables computers to understand and generate human language.

**NLP Tasks:**
• **Text Classification:** Sentiment analysis, spam detection
• **Named Entity Recognition:** Find people, places, organizations
• **Machine Translation:** Google Translate
• **Question Answering:** ChatGPT, search engines
• **Text Generation:** GPT, LLMs

**Text Preprocessing:**
\`\`\`python
# Tokenization
"Hello world" → ["Hello", "world"]

# Lowercasing
"Hello World" → "hello world"

# Stopword removal
"the cat is on the mat" → "cat mat"

# Stemming/Lemmatization
"running" → "run"
\`\`\`

**Word Representations:**
• **Bag of Words:** Word frequencies
• **TF-IDF:** Importance-weighted frequencies
• **Word Embeddings:** Dense vectors (Word2Vec, GloVe)
• **Contextualized Embeddings:** BERT, GPT

**Large Language Models (LLMs):**
Built on Transformer architecture
Trained on massive text corpora
Examples: GPT-4, Claude, LLaMA, Gemini`,
        duration: '40 min',
        xp: 100,
      },
      {
        id: 5,
        title: 'Computer Vision',
        content: `Computer Vision enables machines to interpret visual information.

**Core Tasks:**
• **Image Classification:** What's in the image?
• **Object Detection:** Where are objects located?
• **Semantic Segmentation:** Pixel-level classification
• **Face Recognition:** Identify or verify faces

**Convolutional Neural Networks (CNNs):**
\`\`\`
Convolutional layers → Feature extraction
Pooling layers → Dimensionality reduction
Fully connected → Classification

Common architectures:
- LeNet (1998)
- AlexNet (2012)
- VGGNet (2014)
- ResNet (2015)
- EfficientNet (2019)
\`\`\`

**Applications:**
• Medical imaging (X-rays, MRIs)
• Autonomous vehicles
• Security systems
• Augmented reality
• Quality control in manufacturing

**Modern Developments:**
• Vision Transformers (ViT)
• CLIP (image-text understanding)
• Stable Diffusion (image generation)
• SAM (Segment Anything Model)`,
        duration: '35 min',
        xp: 95,
      },
      {
        id: 6,
        title: 'Building AI Applications',
        content: `Practical guide to building AI-powered applications.

**Popular AI APIs:**
\`\`\`javascript
// OpenAI API
const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Explain AI in simple terms." }
    ]
});
\`\`\`

**Python ML Stack:**
\`\`\`python
import numpy as np          # Numerical computing
import pandas as pd         # Data manipulation
import sklearn              # Machine learning
import tensorflow           # Deep learning
import pytorch              # Deep learning
import transformers         # NLP models
\`\`\`

**Deployment Considerations:**
• Model size and latency
• Scaling and load balancing
• Monitoring and logging
• Version control for models
• A/B testing

**Best Practices:**
1. Start with a baseline model
2. Collect quality training data
3. Monitor model performance over time
4. Handle edge cases gracefully
5. Consider ethical implications`,
        duration: '45 min',
        xp: 120,
      },
    ],
  },
  'physics': {
    title: 'Physics Fundamentals',
    modules: [
      {
        id: 1,
        title: 'Mechanics - Motion',
        content: `Mechanics studies the motion of objects and the forces that cause motion.

**Key Concepts:**

**Distance vs Displacement:**
• Distance: Total path traveled (scalar)
• Displacement: Change in position (vector)

**Speed vs Velocity:**
• Speed: Rate of change of distance (scalar)
• Velocity: Rate of change of displacement (vector)
  v = Δx / Δt

**Acceleration:**
Rate of change of velocity
a = Δv / Δt

**Equations of Motion (constant acceleration):**
\`\`\`
v = u + at
s = ut + ½at²
v² = u² + 2as
s = ½(u + v)t

Where:
u = initial velocity
v = final velocity
a = acceleration
t = time
s = displacement
\`\`\`

**Example:**
A car accelerates from rest at 2 m/s² for 5 seconds.
• Final velocity: v = 0 + 2(5) = 10 m/s
• Distance: s = 0(5) + ½(2)(5²) = 25 m`,
        duration: '30 min',
        xp: 75,
        quiz: [
          {
            id: 1,
            question: 'What is the SI unit of acceleration?',
            options: ['m/s', 'm/s²', 'km/h', 'N'],
            correct: 1,
          },
          {
            id: 2,
            question: 'A car travels 100m in 10s. What is its average speed?',
            options: ['10 m/s', '100 m/s', '1000 m/s', '1 m/s'],
            correct: 0,
          },
        ],
      },
      {
        id: 2,
        title: 'Forces and Newton\'s Laws',
        content: `Forces cause objects to accelerate, change direction, or deform.

**Newton's Three Laws:**

**1st Law (Inertia):**
An object at rest stays at rest, and an object in motion stays in motion unless acted upon by a force.

**2nd Law:**
F = ma
Force equals mass times acceleration

**3rd Law:**
For every action, there is an equal and opposite reaction.

**Types of Forces:**
\`\`\`
• Gravity: F = mg (weight)
• Normal force: Perpendicular to surface
• Friction: f = μN
• Tension: Force in ropes/strings
• Applied force: External push/pull
\`\`\`

**Free Body Diagrams:**
Draw all forces acting on an object to analyze motion.

**Example Problem:**
A 10 kg box is pushed with 50 N force on a frictionless surface.
F = ma
50 = 10 × a
a = 5 m/s²`,
        duration: '35 min',
        xp: 85,
        quiz: [
          {
            id: 1,
            question: 'According to Newton\'s 2nd Law, if force doubles and mass stays the same, acceleration:',
            options: ['Stays the same', 'Halves', 'Doubles', 'Quadruples'],
            correct: 2,
          },
        ],
      },
      {
        id: 3,
        title: 'Energy and Work',
        content: `Energy is the ability to do work. Work transfers energy between objects.

**Work:**
W = F × d × cos(θ)
Work = Force × Distance × cos(angle)

**Kinetic Energy:**
Energy of motion
KE = ½mv²

**Potential Energy:**
Stored energy due to position
PE = mgh (gravitational)
PE = ½kx² (elastic/spring)

**Conservation of Energy:**
Energy cannot be created or destroyed, only transformed.
Total Energy = KE + PE = constant (in isolated system)

**Power:**
Rate of doing work
P = W/t = Fv
Unit: Watt (W) = J/s

**Example:**
A 2 kg ball falls from 10m height.
• Initial PE = mgh = 2 × 10 × 10 = 200 J
• At bottom: all converted to KE
• ½mv² = 200
• v² = 200
• v = 14.14 m/s`,
        duration: '35 min',
        xp: 90,
      },
      {
        id: 4,
        title: 'Waves and Sound',
        content: `Waves transfer energy without transferring matter.

**Wave Properties:**
\`\`\`
Wavelength (λ): Distance between peaks
Frequency (f): Waves per second (Hz)
Amplitude: Maximum displacement
Period (T): Time for one complete wave
T = 1/f
\`\`\`

**Wave Equation:**
v = fλ
Speed = Frequency × Wavelength

**Types of Waves:**
• **Transverse:** Oscillation perpendicular to direction (light, water)
• **Longitudinal:** Oscillation parallel to direction (sound)

**Sound Waves:**
• Travel through matter (not vacuum)
• Speed in air ≈ 343 m/s
• Speed increases in solids

**Doppler Effect:**
When source/observer moves, observed frequency changes.
Approaching: Higher pitch
Receding: Lower pitch

**Sound Intensity:**
Measured in decibels (dB)
• Whisper: 20 dB
• Conversation: 60 dB
• Rock concert: 110 dB
• Pain threshold: 130 dB`,
        duration: '35 min',
        xp: 85,
      },
      {
        id: 5,
        title: 'Electricity and Circuits',
        content: `Electricity is the flow of electric charge through conductors.

**Key Concepts:**

**Current (I):**
Flow of charge: I = Q/t
Unit: Ampere (A)

**Voltage (V):**
Energy per unit charge
Unit: Volt (V)

**Resistance (R):**
Opposition to current flow
Unit: Ohm (Ω)

**Ohm's Law:**
V = IR

**Power in Circuits:**
P = IV = I²R = V²/R

**Series Circuits:**
\`\`\`
Same current through all components
Rtotal = R1 + R2 + R3
Voltage divides among components
\`\`\`

**Parallel Circuits:**
\`\`\`
Same voltage across all branches
1/Rtotal = 1/R1 + 1/R2 + 1/R3
Current divides among branches
\`\`\`

**Example:**
A 12V battery with 4Ω resistor:
I = V/R = 12/4 = 3 A
P = IV = 12 × 3 = 36 W`,
        duration: '40 min',
        xp: 100,
        quiz: [
          {
            id: 1,
            question: 'What is the relationship in Ohm\'s Law?',
            options: ['V = I/R', 'V = IR', 'I = VR', 'R = VI'],
            correct: 1,
          },
        ],
      },
      {
        id: 6,
        title: 'Magnetism and Electromagnetism',
        content: `Magnetism is a force produced by moving electric charges.

**Magnetic Poles:**
• North and South poles
• Like poles repel, unlike attract
• Cannot exist independently (magnetic monopoles not found)

**Magnetic Fields:**
• Lines go from North to South (outside magnet)
• Stronger where lines are closer
• Earth has a magnetic field (compass works)

**Electromagnetism:**
Moving charges create magnetic fields
\`\`\`
Current in wire → Circular magnetic field
Coiled wire (solenoid) → Stronger field
\`\`\`

**Electromagnetic Induction:**
Changing magnetic field → Electric current
\`\`\`
Faraday's Law: ε = -N(dΦ/dt)
ε = induced EMF
N = number of coils
Φ = magnetic flux
\`\`\`

**Applications:**
• Electric motors
• Generators
• Transformers
• Wireless charging
• MRI machines

**Electromagnetic Spectrum:**
Radio → Microwave → Infrared → Visible → UV → X-ray → Gamma
(Increasing frequency and energy)`,
        duration: '40 min',
        xp: 95,
      },
    ],
  },
  'math': {
    title: 'Mathematics Mastery',
    modules: [
      {
        id: 1,
        title: 'Algebra Foundations',
        content: `Algebra uses symbols and letters to represent numbers and relationships.

**Variables and Expressions:**
• Variable: Letter representing unknown value (x, y, n)
• Expression: Combination of terms (3x + 5)
• Equation: Statement of equality (3x + 5 = 14)

**Solving Linear Equations:**
\`\`\`
3x + 5 = 14
3x = 14 - 5
3x = 9
x = 3
\`\`\`

**Order of Operations:** PEMDAS/BODMAS
1. Parentheses/Brackets
2. Exponents/Orders
3. Multiplication & Division (left to right)
4. Addition & Subtraction (left to right)

**Factoring:**
\`\`\`
x² + 5x + 6 = (x + 2)(x + 3)
x² - 9 = (x + 3)(x - 3)  [Difference of squares]
\`\`\`

**Quadratic Formula:**
For ax² + bx + c = 0:
x = (-b ± √(b² - 4ac)) / 2a

**Example:**
x² - 5x + 6 = 0
a = 1, b = -5, c = 6
x = (5 ± √(25 - 24)) / 2
x = (5 ± 1) / 2
x = 3 or x = 2`,
        duration: '30 min',
        xp: 75,
        quiz: [
          {
            id: 1,
            question: 'Solve for x: 2x + 6 = 14',
            options: ['x = 4', 'x = 5', 'x = 6', 'x = 10'],
            correct: 0,
          },
          {
            id: 2,
            question: 'What is the discriminant in the quadratic formula?',
            options: ['b² - 4ac', 'b² + 4ac', '2a', '-b'],
            correct: 0,
          },
        ],
      },
      {
        id: 2,
        title: 'Functions and Graphs',
        content: `A function maps each input to exactly one output.

**Function Notation:**
f(x) = 2x + 3
f(5) = 2(5) + 3 = 13

**Types of Functions:**

**Linear Functions:**
f(x) = mx + b
• m = slope (rise/run)
• b = y-intercept

**Quadratic Functions:**
f(x) = ax² + bx + c
• Parabola shape
• Vertex at x = -b/2a

**Exponential Functions:**
f(x) = a^x
• Growth (a > 1) or decay (0 < a < 1)

**Logarithmic Functions:**
f(x) = log_a(x)
• Inverse of exponential
• log_a(a^x) = x

**Transformations:**
\`\`\`
f(x) + k → Shift up k units
f(x - h) → Shift right h units
-f(x) → Reflect over x-axis
f(-x) → Reflect over y-axis
af(x) → Vertical stretch by factor a
\`\`\`

**Domain and Range:**
• Domain: All possible x-values (inputs)
• Range: All possible y-values (outputs)`,
        duration: '35 min',
        xp: 85,
      },
      {
        id: 3,
        title: 'Trigonometry',
        content: `Trigonometry deals with triangles and their relationships.

**Right Triangle Ratios:**
\`\`\`
sin(θ) = opposite / hypotenuse
cos(θ) = adjacent / hypotenuse
tan(θ) = opposite / adjacent

SOH-CAH-TOA mnemonic
\`\`\`

**Special Angles:**
\`\`\`
θ      sin    cos    tan
0°     0      1      0
30°    1/2    √3/2   1/√3
45°    √2/2   √2/2   1
60°    √3/2   1/2    √3
90°    1      0      undefined
\`\`\`

**Unit Circle:**
• Radius = 1
• (cos θ, sin θ) gives point on circle
• Extends trig to all angles

**Pythagorean Identities:**
sin²θ + cos²θ = 1
tan²θ + 1 = sec²θ
1 + cot²θ = csc²θ

**Solving Triangles:**
Law of Sines: a/sin A = b/sin B = c/sin C
Law of Cosines: c² = a² + b² - 2ab·cos C`,
        duration: '40 min',
        xp: 95,
        quiz: [
          {
            id: 1,
            question: 'What is sin(30°)?',
            options: ['0', '1/2', '√2/2', '1'],
            correct: 1,
          },
        ],
      },
      {
        id: 4,
        title: 'Calculus - Derivatives',
        content: `Calculus studies continuous change. Derivatives measure instantaneous rate of change.

**The Derivative:**
f'(x) = lim[h→0] (f(x+h) - f(x)) / h

**Power Rule:**
d/dx[x^n] = nx^(n-1)

**Examples:**
\`\`\`
f(x) = x³ → f'(x) = 3x²
f(x) = x⁵ → f'(x) = 5x⁴
f(x) = √x = x^(1/2) → f'(x) = (1/2)x^(-1/2)
\`\`\`

**Common Derivatives:**
\`\`\`
d/dx[sin x] = cos x
d/dx[cos x] = -sin x
d/dx[e^x] = e^x
d/dx[ln x] = 1/x
\`\`\`

**Rules:**
• Sum Rule: (f + g)' = f' + g'
• Product Rule: (fg)' = f'g + fg'
• Quotient Rule: (f/g)' = (f'g - fg') / g²
• Chain Rule: d/dx[f(g(x))] = f'(g(x)) · g'(x)

**Applications:**
• Velocity from position: v(t) = s'(t)
• Finding maxima/minima
• Rate of change problems`,
        duration: '45 min',
        xp: 110,
      },
      {
        id: 5,
        title: 'Calculus - Integrals',
        content: `Integration is the reverse of differentiation. It calculates accumulated quantities.

**Indefinite Integrals:**
∫ f(x) dx = F(x) + C
where F'(x) = f(x)

**Power Rule for Integration:**
∫ x^n dx = x^(n+1)/(n+1) + C (n ≠ -1)

**Examples:**
\`\`\`
∫ x² dx = x³/3 + C
∫ x⁴ dx = x⁵/5 + C
∫ 1/x dx = ln|x| + C
\`\`\`

**Common Integrals:**
\`\`\`
∫ sin x dx = -cos x + C
∫ cos x dx = sin x + C
∫ e^x dx = e^x + C
\`\`\`

**Definite Integrals:**
∫[a to b] f(x) dx = F(b) - F(a)

Represents area under curve from a to b

**Example:**
∫[0 to 2] x² dx = [x³/3] from 0 to 2
= 8/3 - 0 = 8/3

**Applications:**
• Area between curves
• Volume of solids
• Work done by force
• Probability distributions`,
        duration: '45 min',
        xp: 115,
      },
      {
        id: 6,
        title: 'Statistics and Probability',
        content: `Statistics analyzes data. Probability measures likelihood of events.

**Descriptive Statistics:**

**Measures of Center:**
• Mean: x̄ = Σx / n (average)
• Median: Middle value when sorted
• Mode: Most frequent value

**Measures of Spread:**
• Range: Max - Min
• Variance: σ² = Σ(x - x̄)² / n
• Standard Deviation: σ = √variance

**Probability Basics:**
P(A) = favorable outcomes / total outcomes
0 ≤ P(A) ≤ 1

**Probability Rules:**
\`\`\`
P(not A) = 1 - P(A)
P(A or B) = P(A) + P(B) - P(A and B)
P(A and B) = P(A) × P(B)  [if independent]
\`\`\`

**Normal Distribution:**
• Bell-shaped curve
• 68% within 1 standard deviation
• 95% within 2 standard deviations
• 99.7% within 3 standard deviations

**Z-Score:**
z = (x - μ) / σ
Measures how many standard deviations from mean`,
        duration: '40 min',
        xp: 100,
        quiz: [
          {
            id: 1,
            question: 'What is the median of [1, 3, 5, 7, 9]?',
            options: ['3', '5', '7', '25'],
            correct: 1,
          },
        ],
      },
    ],
  },
};

// Default course for any undefined course IDs
const defaultCourse: { title: string; modules: Module[] } = {
  title: 'Course',
  modules: [
    { id: 1, title: 'Welcome Module', content: 'Welcome to this course! Content is being prepared.', duration: '15 min', xp: 50 },
  ],
};

export default function CourseModule() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [totalXP, setTotalXP] = useState(0);
  const [showAI, setShowAI] = useState(false);

  const course = courseId && courseData[courseId] ? courseData[courseId] : defaultCourse;
  const currentModule = course.modules[currentModuleIndex];

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(`course-${courseId}-progress`);
    if (savedProgress) {
      const { completed, xp } = JSON.parse(savedProgress);
      setCompletedModules(completed || []);
      setTotalXP(xp || 0);
    }
  }, [courseId]);

  // Save progress
  const saveProgress = (completed: number[], xp: number) => {
    localStorage.setItem(`course-${courseId}-progress`, JSON.stringify({ completed, xp }));
  };

  const handleCompleteModule = () => {
    if (currentModule.quiz && !showQuiz) {
      setShowQuiz(true);
      return;
    }

    if (!completedModules.includes(currentModule.id)) {
      const newCompleted = [...completedModules, currentModule.id];
      const newXP = totalXP + currentModule.xp;
      setCompletedModules(newCompleted);
      setTotalXP(newXP);
      saveProgress(newCompleted, newXP);
    }

    // Move to next module
    if (currentModuleIndex < course.modules.length - 1) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setShowQuiz(false);
      setQuizAnswers({});
      setQuizSubmitted(false);
    }
  };

  const handleQuizAnswer = (questionId: number, optionIndex: number) => {
    setQuizAnswers({ ...quizAnswers, [questionId]: optionIndex });
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
  };

  const calculateQuizScore = () => {
    if (!currentModule.quiz) return { correct: 0, total: 0 };
    let correct = 0;
    currentModule.quiz.forEach((q) => {
      if (quizAnswers[q.id] === q.correct) correct++;
    });
    return { correct, total: currentModule.quiz.length };
  };

  const progress = (completedModules.length / course.modules.length) * 100;

  return (
    <div className="course-module-page">
      {/* Header */}
      <header className="course-header">
        <button className="back-btn" onClick={() => navigate('/learn')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="course-info">
          <h1>{course.title}</h1>
          <div className="progress-info">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span>{Math.round(progress)}% complete</span>
          </div>
        </div>
        <div className="xp-badge">
          <span className="material-symbols-outlined">star</span>
          <span>{totalXP} XP</span>
        </div>
      </header>

      {/* Module Navigation */}
      <nav className="module-nav">
        {course.modules.map((mod, index) => (
          <button
            key={mod.id}
            className={`module-dot ${index === currentModuleIndex ? 'active' : ''} ${completedModules.includes(mod.id) ? 'completed' : ''}`}
            onClick={() => {
              setCurrentModuleIndex(index);
              setShowQuiz(false);
              setQuizAnswers({});
              setQuizSubmitted(false);
            }}
          >
            {completedModules.includes(mod.id) ? (
              <span className="material-symbols-outlined">check</span>
            ) : (
              index + 1
            )}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="module-content">
        <div className="content-card">
          <div className="module-header">
            <span className="module-number">Module {currentModuleIndex + 1}</span>
            <h2>{currentModule.title}</h2>
            <div className="module-meta">
              <span><span className="material-symbols-outlined">schedule</span> {currentModule.duration}</span>
              <span><span className="material-symbols-outlined">star</span> +{currentModule.xp} XP</span>
            </div>
          </div>

          {!showQuiz ? (
            <>
              <div className="content-text">
                <p>{currentModule.content}</p>
              </div>
              <button className="action-btn" onClick={handleCompleteModule}>
                {currentModule.quiz ? 'Take Quiz' : 'Complete & Continue'}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </>
          ) : (
            <div className="quiz-section">
              <h3><span className="material-symbols-outlined">quiz</span> Quiz Time!</h3>
              {currentModule.quiz?.map((q, qIndex) => (
                <div key={q.id} className="quiz-question">
                  <p className="question-text">{qIndex + 1}. {q.question}</p>
                  <div className="options">
                    {q.options.map((opt, optIndex) => (
                      <button
                        key={optIndex}
                        className={`option ${quizAnswers[q.id] === optIndex ? 'selected' : ''} ${quizSubmitted ? (optIndex === q.correct ? 'correct' : quizAnswers[q.id] === optIndex ? 'incorrect' : '') : ''}`}
                        onClick={() => !quizSubmitted && handleQuizAnswer(q.id, optIndex)}
                        disabled={quizSubmitted}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {!quizSubmitted ? (
                <button 
                  className="action-btn" 
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(quizAnswers).length !== currentModule.quiz?.length}
                >
                  Submit Answers
                </button>
              ) : (
                <div className="quiz-result">
                  <p>
                    You got <strong>{calculateQuizScore().correct}</strong> out of <strong>{calculateQuizScore().total}</strong> correct!
                  </p>
                  <button className="action-btn" onClick={handleCompleteModule}>
                    Continue to Next Module
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* AI Floating Button */}
      <button className="ai-fab" onClick={() => setShowAI(true)} aria-label="Ask AI">
        <span className="material-symbols-outlined">smart_toy</span>
        <span className="fab-label">Ask AI</span>
      </button>

      {/* AI Full Screen Modal */}
      {showAI && (
        <div className="ai-modal">
          <div className="ai-modal-header">
            <h2><span className="material-symbols-outlined">school</span> Learning Options</h2>
            <button onClick={() => setShowAI(false)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="ai-modal-content">
            <p className="ai-hint">
              Currently learning: <strong>{currentModule.title}</strong>
            </p>
            
            {/* AI Session Option */}
            <button 
              className="start-ai-session"
              onClick={() => navigate(`/learn/session/${courseId}`)}
            >
              <span className="material-symbols-outlined">smart_toy</span>
              Start AI Tutor Session
            </button>
            <p className="ai-description">
              Get help from Gemini AI with voice and video interaction.
            </p>
            
            {/* Gamified Learning Option */}
            <button 
              className="start-ai-session gamified"
              onClick={() => navigate(`/learn/gamified/${courseId}/${currentModuleIndex + 1}`)}
            >
              <span className="material-symbols-outlined">sports_esports</span>
              Gamified Learning
            </button>
            <p className="ai-description">
              Practice with flashcards, quizzes, and code challenges to earn XP!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
