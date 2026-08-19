import { useLocation, useNavigate } from 'react-router-dom';

const QuizResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, attempt, quiz } = location.state || {};

  const handleGoBack = () => {
    navigate('/student/quizzes');
  };

  const handleViewHistory = () => {
    navigate('/student/history');
  };

  if (!result && !attempt) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No result data available</p>
        <button className="btn btn-primary mt-4" onClick={handleGoBack}>
          Go to Quizzes
        </button>
      </div>
    );
  }

  const displayResult = result || (attempt ? {
    score: Number(attempt.score),
    totalMarks: attempt.quiz?.questions?.reduce((sum, q) => sum + q.marks, 0) || 0,
    percentage: Number(attempt.percentage),
    correctAnswers: attempt.correctAnswers,
    incorrectAnswers: attempt.incorrectAnswers,
    unanswered: attempt.unanswered,
    passed: Number(attempt.percentage) >= 60
  } : null);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body text-center">
          <h1 className="text-3xl font-bold mb-2">Quiz Result</h1>
          <p className="text-xl">{quiz?.title || attempt?.quiz?.title}</p>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <div className={`text-6xl font-bold text-center mb-4 ${displayResult.passed ? 'text-success' : 'text-error'}`}>
            {Math.round(displayResult.percentage)}%
          </div>
          <div className="text-center mb-6">
            <span className={`badge badge-lg ${displayResult.passed ? 'badge-success' : 'badge-error'}`}>
              {displayResult.passed ? 'PASSED' : 'FAILED'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat bg-base-200">
              <div className="stat-title">Correct</div>
              <div className="stat-value text-success">{displayResult.correctAnswers}</div>
            </div>
            <div className="stat bg-base-200">
              <div className="stat-title">Incorrect</div>
              <div className="stat-value text-error">{displayResult.incorrectAnswers}</div>
            </div>
            <div className="stat bg-base-200">
              <div className="stat-title">Unanswered</div>
              <div className="stat-value text-warning">{displayResult.unanswered}</div>
            </div>
            <div className="stat bg-base-200">
              <div className="stat-title">Score</div>
              <div className="stat-value text-primary">{displayResult.score}/{displayResult.totalMarks}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button className="btn btn-primary" onClick={handleGoBack}>
          Take Another Quiz
        </button>
        <button className="btn btn-secondary" onClick={handleViewHistory}>
          View History
        </button>
      </div>
    </div>
  );
};

export default QuizResult;