# Stack Overflow Clone - Setup Instructions

This is a full-stack Stack Overflow clone built with React (Frontend) and Node.js (Backend).

## Quick Start (Simplified Version - No Database Required)

### 1. Backend Setup
```bash
cd stack-backend
npm install
npm run dev
```

The simplified server will start on `http://localhost:3000` with in-memory storage.

**Default Admin User:**
- Email: `admin@stackit.com`
- Password: `admin123`

### 2. Frontend Setup
```bash
cd stack-frontend
npm install
npm run dev
```

The frontend will start on `http://localhost:5173`

### 3. Test the Application
1. Open `http://localhost:5173` in your browser
2. Click "Sign in" and use the admin credentials above
3. Or click "Sign up" to create a new account
4. Start asking questions and exploring the features!

## Full Setup (With MongoDB)

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)

### 1. Install MongoDB

#### Option A: Local Installation
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install and start MongoDB service
3. Create a database named `stack-overflow-clone`

#### Option B: MongoDB Atlas (Cloud)
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Get your connection string

### 2. Backend Setup
```bash
cd stack-backend
npm install
```

#### Configure Environment Variables
Copy the example environment file:
```bash
copy env.example .env
```

Edit `.env` file:
```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/stack-overflow-clone
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/stack-overflow-clone?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3000
NODE_ENV=development
```

#### Initialize Database
```bash
npm run init-db
```

#### Start the Server
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd stack-frontend
npm install
npm run dev
```

## Features

### Authentication
- User registration and login
- JWT token-based authentication
- Password hashing with bcrypt
- Protected routes

### Questions & Answers
- Create, read, update, delete questions
- Add answers to questions
- Vote on questions and answers
- Accept answers
- Search questions

### User Management
- User profiles
- Reputation system
- Role-based access (user, moderator, admin)

### Tags
- Pre-defined programming tags
- Tag-based question filtering

### Search
- Full-text search for questions
- Filter by tags, sort by various criteria

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Questions
- `GET /api/questions` - Get all questions
- `POST /api/questions` - Create new question
- `GET /api/questions/:id` - Get specific question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

### Answers
- `POST /api/questions/:id/answers` - Add answer to question
- `PUT /api/answers/:id` - Update answer
- `DELETE /api/answers/:id` - Delete answer

### Tags
- `GET /api/tags` - Get all tags

### Search
- `GET /api/search/questions?q=query` - Search questions

## Troubleshooting

### Common Issues

1. **"Module not found" errors**
   - Make sure you've run `npm install` in both frontend and backend directories

2. **"Connection refused" errors**
   - Check if the backend server is running on port 3000
   - Check if the frontend is running on port 5173

3. **"Invalid credentials" errors**
   - Use the default admin account: `admin@stackit.com` / `admin123`
   - Or create a new account through the registration form

4. **MongoDB connection issues**
   - Make sure MongoDB is running locally
   - Check your MONGO_URI in the .env file
   - For MongoDB Atlas, ensure your IP is whitelisted

5. **CORS errors**
   - The backend is configured to accept requests from `http://localhost:5173`
   - Make sure you're accessing the frontend from the correct URL

### Development Tips

1. **Use the simplified server for quick testing:**
   ```bash
   npm run dev-simple
   ```

2. **Check server logs for debugging:**
   - Backend logs will show API requests and errors
   - Frontend console will show client-side errors

3. **Reset the database:**
   ```bash
   npm run init-db
   ```

## Project Structure

```
stack/
├── stack-backend/          # Node.js/Express backend
│   ├── config/            # Database configuration
│   ├── middleware/        # Authentication middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── scripts/          # Database scripts
│   ├── server.js         # Main server file
│   └── server-simple.js  # Simplified server (no DB)
├── stack-frontend/        # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom hooks
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service
│   │   └── types/        # TypeScript types
│   └── package.json
└── SETUP_INSTRUCTIONS.md
```

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose)
- JWT for authentication
- bcrypt for password hashing
- CORS for cross-origin requests

### Frontend
- React 18
- TypeScript
- Vite
- React Router
- Axios for API calls
- Tailwind CSS for styling
- Lucide React for icons

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License. 