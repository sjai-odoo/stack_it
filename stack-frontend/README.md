# Stack Overflow Clone - Frontend

A modern, responsive Stack Overflow clone built with React, TypeScript, Vite, and Tailwind CSS.

## Features

### 🔐 Authentication
- User registration and login
- JWT token-based authentication
- Protected routes
- Persistent login state

### 📝 Questions & Answers
- Rich text editor (TipTap) for questions and answers
- Tag-based categorization with multi-select
- Voting system (upvote/downvote)
- Accept answers functionality
- Comments on questions and answers

### 🏷️ Tags
- Tag management and selection
- Tag-based filtering and search
- Color-coded tags with descriptions

### 🔔 Notifications
- Real-time notification system
- Notification types: answers, comments, mentions, votes, accepts
- Mark as read functionality
- Unread count badge

### 👥 User Management
- User profiles and reputation system
- Role-based access control (user, moderator, admin)
- User activity tracking

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Dark/light mode support (coming soon)
- Modern component library
- Smooth animations and transitions

### 🔍 Search & Filtering
- Full-text search across questions
- Advanced filtering options
- Sort by newest, votes, views, unanswered

### 🛠️ Admin Dashboard
- User management
- Content moderation
- System statistics
- Analytics and reporting

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Rich Text Editor**: TipTap
- **UI Components**: Lucide React Icons
- **Form Handling**: React Select
- **State Management**: React Context + Hooks

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd stack-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env.local
```

4. Update the environment variables:
```env
VITE_API_URL=http://localhost:3000/api
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Navigation header
│   ├── RichTextEditor.tsx  # TipTap editor component
│   ├── TagSelector.tsx     # Tag selection component
│   └── NotificationDropdown.tsx  # Notification bell
├── pages/              # Page components
│   ├── HomePage.tsx    # Questions listing
│   ├── AskQuestionPage.tsx  # Question creation
│   ├── LoginPage.tsx   # User login
│   ├── RegisterPage.tsx     # User registration
│   └── AdminDashboard.tsx   # Admin panel
├── hooks/              # Custom React hooks
│   └── useAuth.ts      # Authentication hook
├── services/           # API services
│   └── api.ts          # Axios API client
├── types/              # TypeScript type definitions
│   └── index.ts        # Main type definitions
└── utils/              # Utility functions
```

## API Integration

The frontend is designed to work with a RESTful API backend. The main API service (`src/services/api.ts`) includes endpoints for:

- Authentication (login, register, current user)
- Questions (CRUD operations, voting)
- Answers (CRUD operations, voting, accepting)
- Comments (CRUD operations, voting)
- Tags (listing, creation)
- Notifications (fetching, marking as read)
- Users (profiles, updates)

## Component Library

### Core Components

- **RichTextEditor**: TipTap-based rich text editor with toolbar
- **TagSelector**: Multi-select tag component with search
- **NotificationDropdown**: Bell icon with unread count and dropdown
- **Header**: Responsive navigation with search and user menu

### Styling

The project uses Tailwind CSS with custom design tokens:

- Primary colors: Blue palette
- Gray scale: Neutral grays
- Custom components: Buttons, cards, inputs, forms

## Authentication Flow

1. User registers/logs in
2. JWT token stored in localStorage
3. Token automatically included in API requests
4. Protected routes redirect to login if not authenticated
5. Token refresh handled automatically

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Future Enhancements

- [ ] Dark mode support
- [ ] Real-time notifications with WebSocket
- [ ] Advanced search filters
- [ ] User reputation badges
- [ ] Question bounties
- [ ] Mobile app (React Native)
- [ ] Internationalization (i18n)
- [ ] PWA features
- [ ] Advanced analytics
- [ ] Social features (following, bookmarks)
