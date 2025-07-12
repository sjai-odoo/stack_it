# Stack Overflow Clone - Backend

A Node.js/Express backend for the Stack Overflow clone with MongoDB integration.

## Features

- **Authentication**: JWT-based authentication with bcrypt password hashing
- **User Management**: User registration, login, and profile management
- **MongoDB Integration**: Mongoose ODM with environment variable configuration
- **Security**: CORS configuration, input validation, and error handling
- **Environment Configuration**: Uses dotenv for environment variable management

## Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- npm or yarn

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd stack-backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

4. Configure your `.env` file with your MongoDB connection string:
```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/stack-overflow-clone

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3000
NODE_ENV=development
```

## MongoDB Configuration

### Local MongoDB
If you're using a local MongoDB instance:
```env
MONGO_URI=mongodb://localhost:27017/stack-overflow-clone
```

### MongoDB Atlas (Cloud)
If you're using MongoDB Atlas:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/stack-overflow-clone?retryWrites=true&w=majority
```

### Environment Variable Usage
The application uses the `MONGO_URI` environment variable for database connection:

- **Development**: `mongodb://localhost:27017/stack-overflow-clone`
- **Production**: Your MongoDB Atlas or production MongoDB connection string
- **Testing**: Separate test database connection string

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on port 3000 (or the port specified in your `.env` file).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Health Check
- `GET /api/health` - Server health status

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGO_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | - |
| `PORT` | Server port | No | 3000 |
| `NODE_ENV` | Environment mode | No | development |

## Project Structure

```
stack-backend/
├── config/
│   └── database.js      # MongoDB connection configuration
├── middleware/
│   └── auth.js          # Authentication middleware
├── models/
│   └── User.js          # User model
├── routes/
│   └── auth.js          # Authentication routes
├── server.js            # Main server file
├── package.json         # Dependencies and scripts
├── env.example          # Environment variables example
└── README.md           # This file
```

## Database Models

### User Model
- `username`: Unique username (3-30 characters)
- `email`: Unique email address
- `password`: Hashed password (min 6 characters)
- `avatar`: Optional avatar URL
- `reputation`: User reputation score
- `role`: User role (user, moderator, admin)
- `bio`: Optional user bio
- `isActive`: Account status
- `createdAt`, `updatedAt`: Timestamps

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Request body validation
- **CORS Configuration**: Cross-origin resource sharing setup
- **Error Handling**: Centralized error handling middleware

## Development

### Adding New Routes
1. Create a new route file in the `routes/` directory
2. Import and use the route in `server.js`
3. Add appropriate middleware (auth, validation, etc.)

### Adding New Models
1. Create a new model file in the `models/` directory
2. Define the Mongoose schema
3. Export the model

### Environment Variables
Always use environment variables for:
- Database connections
- API keys and secrets
- Configuration values
- Service URLs

## Troubleshooting

### MongoDB Connection Issues
1. Ensure MongoDB is running
2. Check your `MONGO_URI` environment variable
3. Verify network connectivity (for cloud databases)
4. Check MongoDB user permissions

### JWT Issues
1. Ensure `JWT_SECRET` is set in your environment
2. Check token expiration
3. Verify token format in requests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 