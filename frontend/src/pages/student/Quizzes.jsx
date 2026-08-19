import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/quizzes');
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async (quizId) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/attempts/quizzes/${quizId}/start`);
      navigate(`/student/quiz/${quizId}`, { state: { attemptId: response.data.attemptId } });
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert(error.response?.data?.message || 'Error starting quiz');
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(search.toLowerCase()) ||
                         quiz.description?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || quiz.difficulty === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return <div className="flex items-center justify-center"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Available Quizzes</h1>
      
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search quizzes..."
          className="input input-bordered flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="select select-bordered"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => (
          <div key={quiz.id} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">{quiz.title}</h2>
              <p className="text-sm opacity-70">{quiz.description || 'No description'}</p>
              <div className="flex gap-2 flex-wrap mt-2">
                <span className="badge badge-outline">{quiz.category?.name || 'No Category'}</span>
                <span className="badge badge-secondary">{quiz.difficulty || 'Medium'}</span>
              </div>
              <div className="divider my-2"></div>
              <div className="text-sm space-y-1">
                <div>⏱️ {quiz.duration} minutes</div>
                <div>❓ {quiz._count.questions} questions</div>
                <div>🎯 {quiz.passingScore}% to pass</div>
              </div>
              <div className="card-actions justify-end mt-4">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleStartQuiz(quiz.id)}
                >
                  Start Quiz
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredQuizzes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No quizzes available</p>
        </div>
      )}
    </div>
  );
};

export default Quizzes;