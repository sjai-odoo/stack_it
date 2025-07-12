import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'your-secret-key-123';

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://meetfinava82868:rlQ0bZN6NGKnl2XL@cluster0.umxqm4c.mongodb.net/stackit';

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  // Start server only after MongoDB connection is established
  startServer();
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// MongoDB Models
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  reputation: { type: Number, default: 1 },
  bio: { type: String, default: '' },
  avatar: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  color: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [{ type: String }],
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  votes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }],
  acceptedAnswerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Answer', default: null },
  isClosed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const answerSchema = new mongoose.Schema({
  content: { type: String, required: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  votes: { type: Number, default: 0 },
  isAccepted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  parentType: { type: String, enum: ['question', 'answer'], required: true },
  votes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Create models
const User = mongoose.model('User', userSchema);
const Tag = mongoose.model('Tag', tagSchema);
const Question = mongoose.model('Question', questionSchema);
const Answer = mongoose.model('Answer', answerSchema);
const Comment = mongoose.model('Comment', commentSchema);
const Notification = mongoose.model('Notification', notificationSchema);

// Initialize default data
const initializeDefaultData = async () => {
  try {
    // Create default admin user
    const existingAdmin = await User.findOne({ email: 'admin@stackit.com' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        email: 'admin@stackit.com',
        password: hashedPassword,
        role: 'admin',
        reputation: 100,
        bio: 'System Administrator'
      });
      console.log('✅ Default admin user created');
    }

    // Create default tags
    const tagCount = await Tag.countDocuments();
    if (tagCount === 0) {
      const defaultTags = [
        { name: 'javascript', description: 'JavaScript programming', color: '#f7df1e' },
        { name: 'react', description: 'React framework', color: '#61dafb' },
        { name: 'nodejs', description: 'Node.js runtime', color: '#339933' },
        { name: 'python', description: 'Python programming', color: '#3776ab' },
        { name: 'java', description: 'Java programming', color: '#ed8b00' },
        { name: 'html', description: 'HTML markup', color: '#e34c26' },
        { name: 'css', description: 'CSS styling', color: '#1572b6' },
        { name: 'mongodb', description: 'MongoDB database', color: '#4db33d' },
        { name: 'express', description: 'Express.js framework', color: '#000000' },
        { name: 'typescript', description: 'TypeScript programming', color: '#3178c6' },
        { name: 'vue', description: 'Vue.js framework', color: '#4fc08d' },
        { name: 'angular', description: 'Angular framework', color: '#dd0031' },
        { name: 'php', description: 'PHP programming', color: '#777bb4' },
        { name: 'mysql', description: 'MySQL database', color: '#4479a1' },
        { name: 'docker', description: 'Docker containers', color: '#2496ed' }
      ];
      
      await Tag.insertMany(defaultTags);
      console.log('✅ Default tags created');
    }
  } catch (error) {
    console.error('❌ Error initializing default data:', error);
  }
};

// Initialize default data (non-blocking)
initializeDefaultData().catch(console.error);

// Middleware
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.body,
    headers: req.headers['content-type']
  });
  next();
});

// Helper function to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Helper function to remove password from user object
const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  const { password, ...userWithoutPassword } = userObj;
  return {
    ...userWithoutPassword,
    id: userWithoutPassword._id || userWithoutPassword.id
  };
};

// Auth middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Routes

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// API info route
app.get('/api', (req, res) => {
  res.json({
    message: 'StackIt API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      },
      tags: 'GET /api/tags',
      questions: {
        list: 'GET /api/questions',
        create: 'POST /api/questions',
        get: 'GET /api/questions/:id',
        search: 'GET /api/search/questions?q=term'
      },
      users: {
        get: 'GET /api/users/:id'
      },
      answers: {
        create: 'POST /api/questions/:id/answers'
      }
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: 'MongoDB connected'
  });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Register request received:', req.body);
    
    // Check if request body exists
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('Empty request body');
      return res.status(400).json({ 
        success: false,
        message: 'Request body is required' 
      });
    }

    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      console.log('Missing fields:', { username: !!username, email: !!email, password: !!password });
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    if (password.length < 6) {
      console.log('Password too short:', password.length);
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters' 
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [{ email: email.toLowerCase().trim() }, { username: username.toLowerCase().trim() }] 
    });
    
    if (existingUser) {
      console.log('User already exists:', { email: existingUser.email, username: existingUser.username });
      return res.status(400).json({ 
        success: false,
        message: existingUser.email === email.toLowerCase().trim() ? 'Email already exists' : 'Username already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'user',
      reputation: 1,
      bio: '',
      avatar: null,
      isActive: true
    });

    // Generate token
    const token = generateToken(newUser._id);

    console.log('Register successful for user:', email);
    res.status(201).json({
      success: true,
      data: {
        user: sanitizeUser(newUser),
        token
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    
    // Check if request body exists
    if (!req.body || Object.keys(req.body).length === 0) {
      console.log('Empty request body');
      return res.status(400).json({ 
        success: false,
        message: 'Request body is required' 
      });
    }

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password:', { email: !!email, password: !!password });
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      console.log('Invalid data types:', { email: typeof email, password: typeof password });
      return res.status(400).json({ 
        success: false,
        message: 'Email and password must be strings' 
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    console.log('Login successful for user:', email);
    res.json({
      success: true,
      data: {
        user: sanitizeUser(user),
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
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
app.get('/api/tags', async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    res.json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Questions routes
app.get('/api/questions', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const questions = await Question.find()
      .populate('authorId', 'username email avatar reputation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Question.countDocuments();

    const questionsWithAuthors = questions.map(q => ({
      ...q.toObject(),
      id: q._id,
      author: {
        ...q.authorId.toObject(),
        id: q.authorId._id
      }
    }));

    res.json({
      success: true,
      data: {
        questions: questionsWithAuthors,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/questions', authenticateToken, async (req, res) => {
  try {
    const { title, content, tags: questionTags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const newQuestion = await Question.create({
      title,
      content,
      tags: questionTags || [],
      authorId: req.user._id,
      votes: 0,
      views: 0,
      answers: [],
      acceptedAnswerId: null,
      isClosed: false
    });

    await newQuestion.populate('authorId', 'username email avatar reputation');

    const questionWithAuthor = {
      ...newQuestion.toObject(),
      id: newQuestion._id,
      author: {
        ...newQuestion.authorId.toObject(),
        id: newQuestion.authorId._id
      }
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

app.get('/api/questions/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('authorId', 'username email avatar reputation')
      .populate({
        path: 'answers',
        populate: {
          path: 'authorId',
          select: 'username email avatar reputation'
        }
      });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Get comments for this question
    const questionComments = await Comment.find({ 
      parentId: question._id, 
      parentType: 'question' 
    }).populate('authorId', 'username email avatar reputation');

    // Get comments for all answers
    const answerIds = question.answers.map(answer => answer._id);
    const answerComments = await Comment.find({ 
      parentId: { $in: answerIds }, 
      parentType: 'answer' 
    }).populate('authorId', 'username email avatar reputation');

    // Increment view count
    await Question.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    // Format comments with proper structure
    const formattedQuestionComments = questionComments.map(comment => ({
      ...comment.toObject(),
      id: comment._id,
      author: {
        ...comment.authorId.toObject(),
        id: comment.authorId._id
      },
      questionId: comment.parentId,
      answerId: undefined
    }));

    const formattedAnswerComments = answerComments.map(comment => ({
      ...comment.toObject(),
      id: comment._id,
      author: {
        ...comment.authorId.toObject(),
        id: comment.authorId._id
      },
      questionId: undefined,
      answerId: comment.parentId
    }));

    // Add comments to answers
    const answersWithComments = question.answers.map(answer => ({
      ...answer.toObject(),
      id: answer._id,
      author: {
        ...answer.authorId.toObject(),
        id: answer.authorId._id
      },
      comments: formattedAnswerComments.filter(comment => comment.answerId?.toString() === answer._id.toString())
    }));

    const questionWithAuthor = {
      ...question.toObject(),
      id: question._id,
      author: {
        ...question.authorId.toObject(),
        id: question.authorId._id
      },
      answers: answersWithComments,
      comments: formattedQuestionComments
    };

    res.json({
      success: true,
      data: questionWithAuthor
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search routes
app.get('/api/search/questions', async (req, res) => {
  try {
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

    const questions = await Question.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    })
    .populate('authorId', 'username email avatar reputation')
    .sort({ createdAt: -1 });

    const questionsWithAuthors = questions.map(q => ({
      ...q.toObject(),
      id: q._id,
      author: {
        ...q.authorId.toObject(),
        id: q.authorId._id
      }
    }));

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
  } catch (error) {
    console.error('Search questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Users routes
app.get('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    console.log('Fetching user with ID:', userId);
    
    // Check if ID is valid MongoDB ObjectId format
    if (!userId || userId.length !== 24) {
      console.log('Invalid user ID format:', userId);
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found in database:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found:', user.username);
    res.json({
      success: true,
      data: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Answers routes
app.post('/api/questions/:id/answers', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const questionId = req.params.id;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const newAnswer = await Answer.create({
      content,
      questionId,
      authorId: req.user._id,
      votes: 0,
      isAccepted: false
    });

    // Add answer to question
    await Question.findByIdAndUpdate(questionId, {
      $push: { answers: newAnswer._id }
    });

    await newAnswer.populate('authorId', 'username email avatar reputation');

    res.status(201).json({
      success: true,
      data: {
        ...newAnswer.toObject(),
        id: newAnswer._id,
        author: {
          ...newAnswer.authorId.toObject(),
          id: newAnswer.authorId._id
        }
      }
    });
  } catch (error) {
    console.error('Create answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept answer
app.post('/api/answers/:id/accept', authenticateToken, async (req, res) => {
  try {
    const answerId = req.params.id;
    const answer = await Answer.findById(answerId).populate('questionId');
    
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check if user is the question author
    if (answer.questionId.authorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only question author can accept answers' });
    }

    // Unaccept all other answers for this question
    await Answer.updateMany(
      { questionId: answer.questionId._id }, 
      { isAccepted: false }
    );

    // Accept this answer
    await Answer.findByIdAndUpdate(answerId, { isAccepted: true });

    // Update question's accepted answer
    await Question.findByIdAndUpdate(answer.questionId._id, { 
      acceptedAnswerId: answerId 
    });

    res.json({
      success: true,
      data: { message: 'Answer accepted successfully' }
    });
  } catch (error) {
    console.error('Accept answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Comments routes
app.post('/api/comments', authenticateToken, async (req, res) => {
  try {
    const { content, questionId, answerId } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    let parentId, parentType;
    if (questionId) {
      parentId = questionId;
      parentType = 'question';
      // Verify question exists
      const question = await Question.findById(questionId);
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }
    } else if (answerId) {
      parentId = answerId;
      parentType = 'answer';
      // Verify answer exists
      const answer = await Answer.findById(answerId);
      if (!answer) {
        return res.status(404).json({ message: 'Answer not found' });
      }
    } else {
      return res.status(400).json({ message: 'Either questionId or answerId is required' });
    }

    const newComment = await Comment.create({
      content,
      authorId: req.user._id,
      parentId,
      parentType,
      votes: 0
    });

    await newComment.populate('authorId', 'username email avatar reputation');

    res.status(201).json({
      success: true,
      data: {
        ...newComment.toObject(),
        id: newComment._id,
        author: newComment.authorId,
        questionId: parentType === 'question' ? parentId : undefined,
        answerId: parentType === 'answer' ? parentId : undefined
      }
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Vote routes
app.post('/api/questions/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { vote } = req.body;
    const questionId = req.params.id;

    if (vote !== 1 && vote !== -1) {
      return res.status(400).json({ message: 'Vote must be 1 or -1' });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Update vote count
    await Question.findByIdAndUpdate(questionId, {
      $inc: { votes: vote }
    });

    const updatedQuestion = await Question.findById(questionId)
      .populate('authorId', 'username email avatar reputation');

    res.json({
      success: true,
      data: {
        ...updatedQuestion.toObject(),
        id: updatedQuestion._id,
        author: updatedQuestion.authorId
      }
    });
  } catch (error) {
    console.error('Vote question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/answers/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { vote } = req.body;
    const answerId = req.params.id;

    if (vote !== 1 && vote !== -1) {
      return res.status(400).json({ message: 'Vote must be 1 or -1' });
    }

    const answer = await Answer.findById(answerId);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Update vote count
    await Answer.findByIdAndUpdate(answerId, {
      $inc: { votes: vote }
    });

    const updatedAnswer = await Answer.findById(answerId)
      .populate('authorId', 'username email avatar reputation');

    res.json({
      success: true,
      data: {
        ...updatedAnswer.toObject(),
        id: updatedAnswer._id,
        author: updatedAnswer.authorId
      }
    });
  } catch (error) {
    console.error('Vote answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/comments/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { vote } = req.body;
    const commentId = req.params.id;

    if (vote !== 1 && vote !== -1) {
      return res.status(400).json({ message: 'Vote must be 1 or -1' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Update vote count
    await Comment.findByIdAndUpdate(commentId, {
      $inc: { votes: vote }
    });

    const updatedComment = await Comment.findById(commentId)
      .populate('authorId', 'username email avatar reputation');

    res.json({
      success: true,
      data: {
        ...updatedComment.toObject(),
        id: updatedComment._id,
        author: updatedComment.authorId,
        questionId: updatedComment.parentType === 'question' ? updatedComment.parentId : undefined,
        answerId: updatedComment.parentType === 'answer' ? updatedComment.parentId : undefined
      }
    });
  } catch (error) {
    console.error('Vote comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
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

// Start server function
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ Default admin user: admin@stackit.com / admin123`);
    console.log(`✅ API endpoints available at http://localhost:${PORT}/api`);
    console.log(`✅ Frontend should connect to: http://localhost:${PORT}`);
  });
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Server shutting down...');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('Server shutting down...');
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    process.exit(1);
  }
}); 