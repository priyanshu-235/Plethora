import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import StudentLayout from './components/StudentLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Quizzes from './pages/admin/Quizzes';
import Categories from './pages/admin/Categories';
import Questions from './pages/admin/Questions';
import Analytics from './pages/admin/Analytics';
import StudentQuizzes from './pages/student/Quizzes';
import QuizAttempt from './pages/student/QuizAttempt';
import StudentDashboard from './pages/student/Dashboard';
import QuizHistory from './pages/student/History';
import QuizResult from './pages/student/Result';
import Leaderboard from './pages/student/Leaderboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-base-200">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="quizzes" element={<Quizzes />} />
              <Route path="quizzes/:quizId/questions" element={<Questions />} />
              <Route path="categories" element={<Categories />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
            
            {/* Student Routes */}
            <Route 
              path="/student/*" 
              element={
                <ProtectedRoute requiredRole="STUDENT">
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="quizzes" element={<StudentQuizzes />} />
              <Route path="quiz/:quizId" element={<QuizAttempt />} />
              <Route path="history" element={<QuizHistory />} />
              <Route path="result" element={<QuizResult />} />
              <Route path="leaderboard" element={<Leaderboard />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
