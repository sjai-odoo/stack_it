# Database Setup Guide

## Overview
Your Stack Overflow application uses MongoDB with the database name `stack_it`. The application includes the following collections:

- **users** - User accounts and profiles
- **questions** - Questions posted by users
- **answers** - Answers to questions
- **comments** - Comments on questions and answers
- **tags** - Tags for categorizing questions
- **notifications** - User notifications

## Setup Instructions

### 1. Environment Variables
Make sure your `.env` file contains your MongoDB connection string:
```
MONGO_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/stack_it
JWT_SECRET=your-secret-key
```

### 2. Initialize Database
Run the following command to create initial data (tags and admin user):
```bash
npm run init-db
```

This will:
- Create 15 default tags (javascript, react, nodejs, etc.)
- Create an admin user (admin@stackit.com / admin123)

### 3. Test Database Connection
Verify your database setup:
```bash
npm run test-db
```

This will show:
- Connection status
- Available collections
- Document counts for each model

### 4. Start the Server
```bash
npm run dev
```

## Database Models

### User Model
- **username**: Unique username (3-30 characters)
- **email**: Unique email address
- **password**: Hashed password (min 6 characters)
- **avatar**: Profile picture URL
- **reputation**: User reputation score
- **role**: user, moderator, or admin
- **bio**: User biography (max 500 characters)
- **isActive**: Account status

### Question Model
- **title**: Question title (10-300 characters)
- **content**: Question content (min 20 characters)
- **author**: Reference to User
- **tags**: Array of Tag references
- **votes**: Upvotes and downvotes from users
- **views**: View count
- **isAnswered**: Whether question has accepted answer
- **acceptedAnswer**: Reference to accepted Answer
- **status**: open, closed, or duplicate
- **bounty**: Bounty amount and expiration

### Answer Model
- **content**: Answer content (min 20 characters)
- **author**: Reference to User
- **question**: Reference to Question
- **votes**: Upvotes and downvotes
- **isAccepted**: Whether answer is accepted
- **isEdited**: Whether answer has been edited
- **editHistory**: Array of edit records

### Comment Model
- **content**: Comment content (15-500 characters)
- **author**: Reference to User
- **question**: Reference to Question (optional)
- **answer**: Reference to Answer (optional)
- **votes**: Upvotes and downvotes
- **isEdited**: Whether comment has been edited
- **editHistory**: Array of edit records

### Tag Model
- **name**: Tag name (2-35 characters, lowercase)
- **description**: Tag description (max 500 characters)
- **color**: Tag color (hex format)
- **usageCount**: Number of times tag is used
- **isModeratorOnly**: Whether only moderators can use
- **synonyms**: Array of tag synonyms
- **createdBy**: Reference to User who created tag

### Notification Model
- **recipient**: Reference to User
- **type**: Type of notification (answer, comment, vote, etc.)
- **title**: Notification title (max 200 characters)
- **message**: Notification message (max 500 characters)
- **isRead**: Whether notification has been read
- **data**: Additional data (questionId, answerId, etc.)
- **expiresAt**: Expiration date (30 days from creation)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Questions
- `GET /api/questions` - Get all questions (with pagination, filtering, sorting)
- `GET /api/questions/:id` - Get single question
- `POST /api/questions` - Create new question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `POST /api/questions/:id/vote` - Vote on question

### Tags
- `GET /api/tags` - Get all tags
- `POST /api/tags` - Create new tag (admin only)

### Other endpoints for answers, comments, notifications, users, and search are also available.

## Useful Commands

```bash
# Start development server
npm run dev

# Initialize database with default data
npm run init-db

# Test database connection
npm run test-db

# Start production server
npm start
```

## Troubleshooting

### Connection Issues
- Verify your MongoDB connection string in `.env`
- Ensure your IP is whitelisted in MongoDB Atlas
- Check if your MongoDB cluster is running

### Empty Collections
- Run `npm run init-db` to create initial data
- Check the console output for any errors

### Model Errors
- Ensure all required fields are provided
- Check field validation rules in the models
- Verify data types match schema requirements 