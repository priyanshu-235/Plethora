# Quiz Management Platform

A comprehensive full-stack online assessment platform that enables educators to create and manage quizzes while providing students with a seamless quiz-taking experience.

## 🚀 Features

### For Administrators
- **User Management**: Create and manage student accounts
- **Quiz Management**: Create, edit, delete, and publish quizzes
- **Category Management**: Organize quizzes into categories
- **Question Management**: Add multiple-choice questions with explanations
- **Analytics Dashboard**: Comprehensive platform analytics
- **Student Performance**: Track individual student progress
- **Quiz Performance**: Analyze quiz effectiveness and difficulty

### For Students
- **Quiz Discovery**: Browse available quizzes by category and difficulty
- **Timed Assessments**: Take quizzes with countdown timers
- **Instant Results**: Receive immediate feedback on performance
- **Answer Review**: Review completed attempts with correct answers
- **Performance Tracking**: Track personal progress over time
- **Leaderboard**: Compete with other students on rankings
- **Quiz History**: Access all past quiz attempts

## 🛠️ Tech Stack

### Frontend
- **React 19**: Modern React with automatic JSX runtime
- **Vite**: Fast build tool and dev server
- **React Router**: Client-side routing
- **Tailwind CSS v4**: Utility-first CSS framework
- **DaisyUI**: UI component library
- **Axios**: HTTP client for API requests
- **React Hot Toast**: Toast notifications

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **Prisma ORM 7**: Type-safe database ORM
- **PostgreSQL**: Relational database
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **Helmet**: Security headers
- **express-rate-limit**: Rate limiting
- **express-validator**: Input validation

## 🏗️ Architecture

### Project Structure
```
quiz-platform/
├── backend/                 # Node.js/Express API
│   ├── config/              # Database configuration
│   ├── middleware/          # Custom middleware
│   ├── prisma/              # Database schema and migrations
│   ├── routes/              # API route handlers
│   └── index.js             # Server entry point
├── frontend/               # React application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React context
│   │   ├── pages/           # Page components
│   │   └── main.jsx         # React entry point
│   └── vite.config.js       # Vite configuration
└── docs/                   # Project documentation
```

### Database Schema
- **User**: User accounts with roles (ADMIN/STUDENT)
- **Quiz**: Quiz definitions with metadata
- **Category**: Quiz categorization
- **Question**: Quiz questions with options
- **Option**: Multiple-choice answer options
- **Attempt**: Quiz attempt records
- **Answer**: Student answer records

### API Architecture
- **RESTful Design**: Standard REST API patterns
- **JWT Authentication**: Token-based authentication
- **Role-based Authorization**: Admin/Student access control
- **Input Validation**: Request validation middleware
- **Rate Limiting**: API endpoint protection
- **Error Handling**: Centralized error management

### Frontend Architecture
- **Component-based**: Modular React components
- **Context API**: Global state management
- **Protected Routes**: Authentication-gated navigation
- **Responsive Design**: Mobile-first UI
- **Real-time Updates**: Hot module replacement in development

## 📋 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure DATABASE_URL and JWT_SECRET in .env
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The backend will run on `http://localhost:5000` and frontend on `http://localhost:5173`.

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/quiz_platform
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Admin Routes
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - User management
- `GET /api/admin/analytics` - Platform analytics
- `GET /api/admin/analytics/students` - Student performance
- `GET /api/admin/analytics/quizzes` - Quiz performance

### Quiz Management
- `GET /api/quizzes` - List all quizzes
- `POST /api/quizzes` - Create quiz
- `PUT /api/quizzes/:id` - Update quiz
- `DELETE /api/quizzes/:id` - Delete quiz

### Category Management
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Question Management
- `GET /api/questions/quiz/:quizId` - Get quiz questions
- `POST /api/questions` - Create question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

### Quiz Attempts
- `POST /api/attempts/quizzes/:quizId/start` - Start quiz attempt
- `POST /api/attempts/quizzes/:quizId/submit` - Submit quiz answers
- `GET /api/attempts` - Get user's attempt history
- `GET /api/attempts/:id` - Get detailed attempt

### Leaderboard
- `GET /api/leaderboard` - Overall leaderboard
- `GET /api/leaderboard/category/:categoryName` - Category leaderboard
- `GET /api/leaderboard/monthly` - Monthly leaderboard

## 🔐 Security Features

- **Password Hashing**: bcrypt for secure password storage
- **JWT Authentication**: Token-based authentication with expiration
- **Rate Limiting**: Protection against brute force and DDoS attacks
- **Input Validation**: Comprehensive request validation
- **CORS Configuration**: Cross-origin resource sharing control
- **Security Headers**: Helmet for HTTP security headers
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **Role-based Access Control**: Admin and student role separation

## 🚢 Deployment

### Docker Deployment
```bash
docker-compose up --build
```

### Manual Deployment
See deployment guide for detailed instructions for various platforms including Vercel, Railway, AWS, and traditional deployment methods.

## 📊 Key Features Implementation

### Quiz Taking Flow
1. Student selects quiz from available quizzes
2. Backend validates quiz availability and attempt limits
3. Timer starts on frontend with server-side validation
4. Students navigate through questions with answer persistence
5. Automatic submission when timer expires
6. Backend calculates score and determines pass/fail
7. Results displayed with detailed answer breakdown

### Analytics System
- Multi-dimensional analytics (time, user, quiz, category, difficulty)
- Real-time performance tracking
- Popular content identification
- Difficulty-based performance analysis
- Student progress monitoring

### Leaderboard System
- Multi-factor ranking algorithm (average score, highest score, attempts)
- Category-specific rankings
- Monthly competition cycles
- Real-time ranking updates

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👥 Authors

- **Priyangshu Das** - Initial work

## 🙏 Acknowledgments

- React team for the amazing framework
- Prisma team for the excellent ORM
- DaisyUI for the beautiful components
- The open-source community

## 📞 Support

For support, please open an issue in the GitHub repository.