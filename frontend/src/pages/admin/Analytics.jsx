import { useState, useEffect } from 'react';
import axios from 'axios';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [studentStats, setStudentStats] = useState([]);
  const [quizStats, setQuizStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    if (activeTab === 'students') {
      fetchStudentStats();
    } else if (activeTab === 'quizzes') {
      fetchQuizStats();
    }
  }, [activeTab]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/analytics');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentStats = async () => {
    setLoadingStudents(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/analytics/students');
      setStudentStats(response.data);
    } catch (error) {
      console.error('Error fetching student stats:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchQuizStats = async () => {
    setLoadingQuizzes(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/analytics/quizzes');
      setQuizStats(response.data);
    } catch (error) {
      console.error('Error fetching quiz stats:', error);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      
      <div className="tabs tabs-boxed mb-6">
        <a className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`} onClick={() => setActiveTab('overview')}>
          Overview
        </a>
        <a className={`tab ${activeTab === 'students' ? 'tab-active' : ''}`} onClick={() => setActiveTab('students')}>
          Students
        </a>
        <a className={`tab ${activeTab === 'quizzes' ? 'tab-active' : ''}`} onClick={() => setActiveTab('quizzes')}>
          Quizzes
        </a>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Popular Quizzes */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Most Popular Quizzes</h2>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Quiz Title</th>
                      <th>Attempts</th>
                      <th>Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics?.popularQuizzes?.length > 0 ? analytics.popularQuizzes.map((quiz, index) => (
                      <tr key={quiz.id}>
                        <td>{quiz.title}</td>
                        <td>{quiz._count?.attempts || 0}</td>
                        <td>
                          <span className="badge badge-primary">#{index + 1}</span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="3" className="text-center">No quiz data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Popular Categories */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Most Popular Categories</h2>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Total Attempts</th>
                      <th>Quizzes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics?.popularCategories?.length > 0 ? analytics.popularCategories.map((cat, index) => (
                      <tr key={cat.id}>
                        <td>{cat.name}</td>
                        <td>{cat.totalAttempts || 0}</td>
                        <td>{cat._count?.quizzes || 0}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="3" className="text-center">No category data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Difficulty Performance */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Performance by Difficulty</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(analytics?.difficultyStats || {}).map(([difficulty, stats]) => (
                  <div key={difficulty} className="stat bg-base-200">
                    <div className="stat-title">{difficulty}</div>
                    <div className="stat-value text-primary">{Math.round(stats.avgScore)}%</div>
                    <div className="stat-desc">{stats.attempts} attempts</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Student Performance</h2>
            {loadingStudents ? (
              <div className="flex items-center justify-center py-4">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Attempts</th>
                      <th>Avg Score</th>
                      <th>Highest Score</th>
                      <th>Pass Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentStats.length > 0 ? studentStats.map((student) => (
                      <tr key={student.id}>
                        <td>{student.name}</td>
                        <td>{student.totalAttempts}</td>
                        <td>{student.averageScore}%</td>
                        <td>{student.highestScore}%</td>
                        <td>{student.completedAttempts > 0 ? Math.round((student.passedQuizzes / student.completedAttempts) * 100) : 0}%</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="text-center">No student data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'quizzes' && (
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Quiz Performance</h2>
            {loadingQuizzes ? (
              <div className="flex items-center justify-center py-4">
                <span className="loading loading-spinner loading-lg"></span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Quiz</th>
                      <th>Category</th>
                      <th>Attempts</th>
                      <th>Avg Score</th>
                      <th>Pass Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizStats.length > 0 ? quizStats.map((quiz) => (
                      <tr key={quiz.id}>
                        <td>{quiz.title}</td>
                        <td>{quiz.category || 'N/A'}</td>
                        <td>{quiz.totalAttempts}</td>
                        <td>{quiz.averageScore}%</td>
                        <td>{quiz.passRate}%</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="text-center">No quiz data available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;