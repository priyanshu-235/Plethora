import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Students', value: stats?.totalStudents || 0, icon: '👥', color: 'bg-primary' },
    { title: 'Total Quizzes', value: stats?.totalQuizzes || 0, icon: '📝', color: 'bg-secondary' },
    { title: 'Published Quizzes', value: stats?.publishedQuizzes || 0, icon: '✅', color: 'bg-accent' },
    { title: 'Draft Quizzes', value: stats?.draftQuizzes || 0, icon: '📄', color: 'bg-warning' },
    { title: 'Total Questions', value: stats?.totalQuestions || 0, icon: '❓', color: 'bg-info' },
    { title: 'Total Attempts', value: stats?.totalAttempts || 0, icon: '🎯', color: 'bg-success' },
    { title: 'Average Score', value: `${stats?.averageScore || 0}%`, icon: '📊', color: 'bg-error' },
    { title: 'Passed Attempts', value: stats?.passedAttempts || 0, icon: '✨', color: 'bg-primary' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-base opacity-70">{stat.title}</h2>
              <div className="flex items-center justify-between">
                <span className="text-4xl font-bold">{stat.value}</span>
                <span className="text-4xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pass/Fail Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Pass/Fail Ratio</h2>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex-1">
                <div className="stat">
                  <div className="stat-title">Passed</div>
                  <div className="stat-value text-success">{stats?.passedAttempts || 0}</div>
                </div>
              </div>
              <div className="flex-1">
                <div className="stat">
                  <div className="stat-title">Failed</div>
                  <div className="stat-value text-error">{stats?.failedAttempts || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Quick Actions</h2>
            <div className="flex flex-col gap-2 mt-4">
              <button 
                className="btn btn-primary" 
                onClick={() => navigate('/admin/quizzes')}
              >
                Create New Quiz
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => navigate('/admin/categories')}
              >
                Add Category
              </button>
              <button 
                className="btn btn-accent" 
                onClick={() => navigate('/admin/users')}
              >
                View All Users
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;