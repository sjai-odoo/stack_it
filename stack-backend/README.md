# Stack Backend - Simple Version

This is a simplified, error-free backend for the Stack Overflow clone.

## Features

- ✅ **No Database Required** - Uses in-memory storage
- ✅ **User Registration & Login** - Full authentication
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Questions & Answers** - Create and manage questions
- ✅ **Tags System** - Pre-defined programming tags
- ✅ **Search** - Search through questions
- ✅ **CORS Enabled** - Works with React frontend

## Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm start

# Or with auto-restart during development
npm run dev
```

## Default Admin User

- **Email:** `admin@stackit.com`
- **Password:** `admin123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Questions
- `GET /api/questions` - Get all questions
- `POST /api/questions` - Create new question
- `GET /api/questions/:id` - Get specific question

### Tags
- `GET /api/tags` - Get all available tags

### Search
- `GET /api/search/questions?q=query` - Search questions

### Users
- `GET /api/users/:id` - Get user profile

### Health Check
- `GET /api/health` - Server health status

## Testing the API

You can test the API using curl or any HTTP client:

```bash
# Health check
curl http://localhost:3000/api/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@stackit.com","password":"admin123"}'

# Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

## Tech Stack

- **Node.js** - Runtime
- **Express.js** - Web framework
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin resource sharing

## Architecture

- **In-Memory Storage** - All data stored in arrays
- **RESTful API** - Clean REST endpoints
- **JWT Authentication** - Stateless authentication
- **Error Handling** - Comprehensive error handling
- **CORS Support** - Ready for frontend integration

## Data Storage

Since this uses in-memory storage, all data is lost when the server restarts. This is perfect for:
- Development and testing
- Demos and prototypes
- Learning and experimentation

For production use, you would typically connect to a database like MongoDB or PostgreSQL.

## Frontend Integration

This backend is designed to work with the React frontend in the `stack-frontend` directory. Make sure both are running:

1. Backend: `http://localhost:3000`
2. Frontend: `http://localhost:5173`

The frontend will automatically connect to the backend API. 