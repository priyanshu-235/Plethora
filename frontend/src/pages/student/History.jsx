import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const QuizHistory = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/attempts');
      setAttempts(response.data);
    } catch (error) {
      console.error('Error fetching attempts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResult = async (attemptId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/attempts/${attemptId}`);
      navigate('/student/result', { state: { attempt: response.data } });
    } catch (error) {
      console.error('Error fetching attempt details:', error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Quiz History</h1>
      
      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>Quiz</th>
              <th>Category</th>
              <th>Score</th>
              <th>Status</th>
              <th>Time Taken</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((attempt) => (
              <tr key={attempt.id}>
                <td>{attempt.quiz.title}</td>
                <td>{attempt.quiz.category?.name || 'N/A'}</td>
                <td>{Math.round(Number(attempt.percentage))}%</td>
                <td>
                  <span className={`badge ${Number(attempt.percentage) >= 60 ? 'badge-success' : 'badge-error'}`}>
                    {Number(attempt.percentage) >= 60 ? 'Passed' : 'Failed'}
                  </span>
                </td>
                <td>{Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s</td>
                <td>{new Date(attempt.completedAt || attempt.startedAt).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => handleViewResult(attempt.id)}
                    disabled={attempt.status === 'IN_PROGRESS'}
                  >
                    View Result
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {attempts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No quiz attempts yet</p>
        </div>
      )}
    </div>
  );
};

export default QuizHistory;