import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const QuizAttempt = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const attemptId = location.state?.attemptId;

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  useEffect(() => {
    if (quiz && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [quiz, timeLeft]);

  const fetchQuizData = async () => {
    try {
      const [quizRes, questionsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/quizzes/${quizId}`),
        axios.get(`http://localhost:5000/api/questions/quiz/${quizId}`)
      ]);
      
      setQuiz(quizRes.data);
      setQuestions(questionsRes.data);
      setTimeLeft(quizRes.data.duration * 60);
    } catch (error) {
      console.error('Error fetching quiz data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId, optionId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmit = async () => {
    const answerArray = Object.entries(answers).map(([questionId, selectedOptionId]) => ({
      questionId,
      selectedOptionId
    }));

    try {
      const response = await axios.post(`http://localhost:5000/api/attempts/quizzes/${quizId}/submit`, {
        answers: answerArray
      });
      
      navigate('/student/result', { state: { result: response.data.result, quiz } });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error submitting quiz');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="flex items-center justify-center"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  const question = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{quiz?.title}</h1>
            <div className={`text-2xl font-bold ${timeLeft < 60 ? 'text-error' : 'text-primary'}`}>
              ⏱️ {formatTime(timeLeft)}
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm">
              Question {currentQuestion + 1} of {totalQuestions}
            </div>
            <div className="text-sm">
              Answered: {answeredCount}/{totalQuestions}
            </div>
          </div>
          <progress 
            className="progress progress-primary w-full" 
            value={answeredCount} 
            max={totalQuestions}
          ></progress>
        </div>
      </div>

      {question && (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="text-xl font-semibold mb-4">{question.questionText}</h2>
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <label 
                  key={option.id}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    answers[question.id] === option.id 
                      ? 'border-primary bg-primary bg-opacity-10' 
                      : 'border-base-300 hover:border-primary'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    className="radio radio-primary"
                    checked={answers[question.id] === option.id}
                    onChange={() => handleAnswerSelect(question.id, option.id)}
                  />
                  <span className="font-bold text-lg">{String.fromCharCode(65 + index)}.</span>
                  <span className="flex-1">{option.optionText}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          className="btn"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          Previous
        </button>
        
        <div className="flex gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              className={`btn btn-sm btn-circle ${
                currentQuestion === index ? 'btn-primary' : 'btn-outline'
              } ${answers[questions[index].id] ? 'btn-success' : ''}`}
              onClick={() => setCurrentQuestion(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestion === questions.length - 1 ? (
          <button className="btn btn-primary" onClick={handleSubmit}>
            Submit Quiz
          </button>
        ) : (
          <button
            className="btn"
            onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizAttempt;