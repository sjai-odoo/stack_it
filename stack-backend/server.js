import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-secret-key-123';

// In-memory storage
const users = [];
const questions = [];
const answers = [];
const tags = [
  { id: 1, name: 'javascript', description: 'JavaScript programming', color: '#f7df1e' },
  { id: 2, name: 'react', description: 'React framework', color: '#61dafb' },
  { id: 3, name: 'nodejs', description: 'Node.js runtime', color: '#339933' },
  { id: 4, name: 'python', description: 'Python programming', color: '#3776ab' },
  { id: 5, name: 'java', description: 'Java programming', color: '#ed8b00' }
];

// Create default admin user
const createDefaultUser = async () => {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  users.push({
    id: '1',
    username: 'admin',
    email: 'admin@stackit.com',
    password: hashedPassword,
    role: 'admin',
    reputation: 100,
    bio: 'System Administrator',
    avatar: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

// Initialize default user
createDefaultUser();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Helper function to remove password from user object
const sanitizeUser = (user) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    
    const foundUser = users.find(u => u.id === user.userId);
    if (!foundUser) {
      return res.status(403).json({ message: 'User not found' });
    }
    
    req.user = foundUser;
    next();
  });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 'Email already exists' : 'Username already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: (users.length + 1).toString(),
      username,
      email,
      password: hashedPassword,
      role: 'user',
      reputation: 1,
      bio: '',
      avatar: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    users.push(newUser);

    // Generate token
    const token = generateToken(newUser.id);

    res.status(201).json({
      success: true,
      data: {
        user: sanitizeUser(newUser),
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      success: true,
      data: {
        user: sanitizeUser(user),
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      user: sanitizeUser(req.user)
    }
  });
});

// Tags routes
app.get('/api/tags', (req, res) => {
  res.json({
    success: true,
    data: tags
  });
});

// Questions routes
app.get('/api/questions', (req, res) => {
  const questionsWithAuthors = questions.map(q => {
    const author = users.find(u => u.id === q.authorId);
    return {
      ...q,
      author: author ? sanitizeUser(author) : null
    };
  });

  res.json({
    success: true,
    data: {
      questions: questionsWithAuthors,
      pagination: {
        page: 1,
        limit: 10,
        total: questions.length,
        pages: Math.ceil(questions.length / 10)
      }
    }
  });
});

app.post('/api/questions', authenticateToken, (req, res) => {
  try {
    const { title, content, tags: questionTags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const newQuestion = {
      id: (questions.length + 1).toString(),
      title,
      content,
      tags: questionTags || [],
      authorId: req.user.id,
      votes: 0,
      views: 0,
      answers: [],
      acceptedAnswerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isClosed: false
    };

    questions.push(newQuestion);

    // Add author info for response
    const questionWithAuthor = {
      ...newQuestion,
      author: sanitizeUser(req.user)
    };

    res.status(201).json({
      success: true,
      data: questionWithAuthor
    });
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/questions/:id', (req, res) => {
  const question = questions.find(q => q.id === req.params.id);
  if (!question) {
    return res.status(404).json({ message: 'Question not found' });
  }

  const author = users.find(u => u.id === question.authorId);
  const questionWithAuthor = {
    ...question,
    author: author ? sanitizeUser(author) : null
  };

  res.json({
    success: true,
    data: questionWithAuthor
  });
});

// Search routes
app.get('/api/search/questions', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.json({
      success: true,
      data: {
        questions: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        }
      }
    });
  }

  const filteredQuestions = questions.filter(question =>
    question.title.toLowerCase().includes(q.toLowerCase()) ||
    question.content.toLowerCase().includes(q.toLowerCase())
  ).map(q => {
    const author = users.find(u => u.id === q.authorId);
    return {
      ...q,
      author: author ? sanitizeUser(author) : null
    };
  });

  res.json({
    success: true,
    data: {
      questions: filteredQuestions,
      pagination: {
        page: 1,
        limit: 10,
        total: filteredQuestions.length,
        pages: Math.ceil(filteredQuestions.length / 10)
      }
    }
  });
});

// Users routes
app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    success: true,
    data: sanitizeUser(user)
  });
});

// Catch all for undefined routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Default admin user: admin@stackit.com / admin123`);
  console.log(`✅ API endpoints available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Server shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Server shutting down...');
  process.exit(0);
}); 