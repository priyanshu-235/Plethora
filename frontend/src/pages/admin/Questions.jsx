import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Questions = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    questionText: '',
    marks: 1,
    explanation: '',
    difficulty: 'MEDIUM',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false }
    ]
  });

  useEffect(() => {
    fetchQuiz();
    fetchQuestions();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/quizzes/${quizId}`);
      setQuiz(response.data);
    } catch (error) {
      console.error('Error fetching quiz:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/questions/quiz/${quizId}`);
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (question = null) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        questionText: question.questionText,
        marks: question.marks,
        explanation: question.explanation || '',
        difficulty: question.difficulty || 'MEDIUM',
        options: question.options.map(opt => ({
          text: opt.optionText,
          isCorrect: opt.isCorrect
        }))
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        questionText: '',
        marks: 1,
        explanation: '',
        difficulty: 'MEDIUM',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ]
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingQuestion(null);
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index][field] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { text: '', isCorrect: false }]
    });
  };

  const handleRemoveOption = (index) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: newOptions });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate at least one correct answer
    const hasCorrectAnswer = formData.options.some(opt => opt.isCorrect);
    if (!hasCorrectAnswer) {
      alert('Please mark at least one option as correct');
      return;
    }

    // Validate all options have text
    const hasEmptyOptions = formData.options.some(opt => !opt.text.trim());
    if (hasEmptyOptions) {
      alert('Please fill in all option texts');
      return;
    }

    try {
      const questionData = {
        quizId,
        questionText: formData.questionText,
        marks: formData.marks,
        explanation: formData.explanation,
        difficulty: formData.difficulty,
        options: formData.options.map(opt => ({
          text: opt.text,
          isCorrect: opt.isCorrect
        }))
      };

      if (editingQuestion) {
        await axios.put(`http://localhost:5000/api/questions/${editingQuestion.id}`, questionData);
      } else {
        await axios.post('http://localhost:5000/api/questions', questionData);
      }
      fetchQuestions();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Error saving question');
    }
  };

  const handleDelete = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await axios.delete(`http://localhost:5000/api/questions/${questionId}`);
        fetchQuestions();
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('Error deleting question');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <button 
            className="btn btn-sm btn-ghost mb-2"
            onClick={() => navigate('/admin/quizzes')}
          >
            ← Back to Quizzes
          </button>
          <h1 className="text-3xl font-bold">Questions for {quiz?.title}</h1>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          Add Question
        </button>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.id} className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-primary">Q{index + 1}</span>
                    <span className="badge badge-outline">{question.difficulty}</span>
                    <span className="badge badge-secondary">{question.marks} marks</span>
                  </div>
                  <h3 className="text-lg font-semibold">{question.questionText}</h3>
                  
                  <div className="mt-4 space-y-2">
                    {question.options.map((option, optIndex) => (
                      <div 
                        key={option.id} 
                        className={`flex items-center gap-2 p-2 rounded ${
                          option.isCorrect ? 'bg-success bg-opacity-20 border border-success' : 'bg-base-200'
                        }`}
                      >
                        <span className="font-bold">{String.fromCharCode(65 + optIndex)}.</span>
                        <span>{option.optionText}</span>
                        {option.isCorrect && <span className="badge badge-success ml-auto">Correct</span>}
                      </div>
                    ))}
                  </div>

                  {question.explanation && (
                    <div className="mt-4 p-3 bg-info bg-opacity-10 rounded">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <button 
                    className="btn btn-sm"
                    onClick={() => handleOpenModal(question)}
                  >
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm btn-error"
                    onClick={() => handleDelete(question.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {questions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No questions added yet</p>
          <p className="text-gray-400">Click "Add Question" to create your first question</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg mb-4">
              {editingQuestion ? 'Edit Question' : 'Add Question'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Question Text</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={formData.questionText}
                  onChange={(e) => setFormData({...formData, questionText: e.target.value})}
                  required
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Marks</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={formData.marks}
                    onChange={(e) => setFormData({...formData, marks: parseInt(e.target.value)})}
                    required
                    min="1"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Difficulty</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text">Explanation (Optional)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={formData.explanation}
                  onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                  rows="2"
                />
              </div>

              <div className="divider">Options</div>

              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-2 items-center mb-2">
                  <span className="font-bold w-6">{String.fromCharCode(65 + index)}.</span>
                  <input
                    type="text"
                    className="input input-bordered flex-1"
                    placeholder="Option text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                    required
                  />
                  <label className="label cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-success"
                      checked={option.isCorrect}
                      onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                    />
                    <span className="label-text ml-2">Correct</span>
                  </label>
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-circle btn-error"
                      onClick={() => handleRemoveOption(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                className="btn btn-sm btn-outline mt-2"
                onClick={handleAddOption}
              >
                + Add Option
              </button>

              <div className="modal-action mt-6">
                <button type="button" className="btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingQuestion ? 'Update' : 'Add'} Question
                </button>
              </div>
            </form>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={handleCloseModal}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
};

export default Questions;