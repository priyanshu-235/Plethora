import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [attemptsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/attempts')
      ]);
      
      const attempts = attemptsRes.data;
      const completedAttempts = attempts.filter(a => a.status === 'COMPLETED');
      
      const stats = {
        totalQuizzes: attempts.length,
        passedQuizzes: completedAttempts.filter(a => a.percentage >= 60).length,
        averageScore: completedAttempts.length > 0 
          ? completedAttempts.reduce((sum, a) => sum + Number(a.percentage), 0) / completedAttempts.length 
          : 0,
        highestScore: completedAttempts.length > 0 
          ? Math.max(...completedAttempts.map(a => Number(a.percentage))) 
          : 0
      };
      
      setStats(stats);
      setRecentAttempts(attempts.slice(0, 5));
    } catch (error) {
      toast.error('Error fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat bg-base-100 shadow-xl">
          <div className="stat-title">Quizzes Attempted</div>
          <div className="stat-value text-primary">{stats?.totalQuizzes || 0}</div>
        </div>
        <div className="stat bg-base-100 shadow-xl">
          <div className="stat-title">Passed</div>
          <div className="stat-value text-success">{stats?.passedQuizzes || 0}</div>
        </div>
        <div className="stat bg-base-100 shadow-xl">
          <div className="stat-title">Average Score</div>
          <div className="stat-value text-secondary">{Math.round(stats?.averageScore || 0)}%</div>
        </div>
        <div className="stat bg-base-100 shadow-xl">
          <div className="stat-title">Highest Score</div>
          <div className="stat-value text-accent">{Math.round(stats?.highestScore || 0)}%</div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Recent Attempts</h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentAttempts.map((attempt) => (
                  <tr key={attempt.id}>
                    <td>{attempt.quiz.title}</td>
                    <td>{Math.round(Number(attempt.percentage))}%</td>
                    <td>
                      <span className={`badge ${Number(attempt.percentage) >= 60 ? 'badge-success' : 'badge-error'}`}>
                        {Number(attempt.percentage) >= 60 ? 'Passed' : 'Failed'}
                      </span>
                    </td>
                    <td>{new Date(attempt.completedAt || attempt.startedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {recentAttempts.length === 0 && (
            <p className="text-center py-4 text-gray-500">No quiz attempts yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;