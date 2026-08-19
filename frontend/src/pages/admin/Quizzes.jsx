import { useState, useEffect } from 'react';
import axios from 'axios';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    difficulty: 'MEDIUM',
    duration: 30,
    passingScore: 60,
    maxAttempts: 1,
    status: 'DRAFT'
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchQuizzes();
    fetchCategories();
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

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleOpenModal = (quiz = null) => {
    if (quiz) {
      setEditingQuiz(quiz);
      setFormData({
        title: quiz.title,
        description: quiz.description || '',
        categoryId: quiz.categoryId || '',
        difficulty: quiz.difficulty || 'MEDIUM',
        duration: quiz.duration,
        passingScore: quiz.passingScore,
        maxAttempts: quiz.maxAttempts,
        status: quiz.status
      });
    } else {
      setEditingQuiz(null);
      setFormData({
        title: '',
        description: '',
        categoryId: '',
        difficulty: 'MEDIUM',
        duration: 30,
        passingScore: 60,
        maxAttempts: 1,
        status: 'DRAFT'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingQuiz(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingQuiz) {
        await axios.put(`http://localhost:5000/api/quizzes/${editingQuiz.id}`, formData);
      } else {
        await axios.post('http://localhost:5000/api/quizzes', formData);
      }
      fetchQuizzes();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving quiz:', error);
    }
  };

  const handleDelete = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await axios.delete(`http://localhost:5000/api/quizzes/${quizId}`);
        fetchQuizzes();
      } catch (error) {
        console.error('Error deleting quiz:', error);
      }
    }
  };

  const handleStatusChange = async (quizId, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/quizzes/${quizId}/publish`, { status: newStatus });
      fetchQuizzes();
    } catch (error) {
      console.error('Error updating quiz status:', error);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      DRAFT: 'badge-warning',
      PUBLISHED: 'badge-success',
      UNPUBLISHED: 'badge-error'
    };
    return colors[status] || 'badge-neutral';
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
        <h1 className="text-3xl font-bold">Quiz Management</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          Create Quiz
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex justify-between items-start">
                <h2 className="card-title">{quiz.title}</h2>
                <span className={`badge ${getStatusBadge(quiz.status)}`}>
                  {quiz.status}
                </span>
              </div>
              <p className="text-sm opacity-70">{quiz.description || 'No description'}</p>
              <div className="flex gap-2 flex-wrap mt-2">
                <span className="badge badge-outline">{quiz.category?.name || 'No Category'}</span>
                <span className="badge badge-outline">{quiz.difficulty || 'Medium'}</span>
              </div>
              <div className="divider my-2"></div>
              <div className="text-sm space-y-1">
                <div>⏱️ Duration: {quiz.duration} minutes</div>
                <div>🎯 Passing Score: {quiz.passingScore}%</div>
                <div>🔄 Max Attempts: {quiz.maxAttempts}</div>
                <div>❓ Questions: {quiz._count.questions}</div>
                <div>📊 Attempts: {quiz._count.attempts}</div>
              </div>
              <div className="card-actions justify-end mt-4">
                <button 
                  className="btn btn-sm btn-info"
                  onClick={() => window.location.href = `/admin/quizzes/${quiz.id}/questions`}
                >
                  Questions
                </button>
                <button 
                  className="btn btn-sm"
                  onClick={() => handleOpenModal(quiz)}
                >
                  Edit
                </button>
                {quiz.status === 'DRAFT' && (
                  <button 
                    className="btn btn-sm btn-success"
                    onClick={() => handleStatusChange(quiz.id, 'PUBLISHED')}
                  >
                    Publish
                  </button>
                )}
                {quiz.status === 'PUBLISHED' && (
                  <button 
                    className="btn btn-sm btn-warning"
                    onClick={() => handleStatusChange(quiz.id, 'UNPUBLISHED')}
                  >
                    Unpublish
                  </button>
                )}
                <button 
                  className="btn btn-sm btn-error"
                  onClick={() => handleDelete(quiz.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box w-11/12 max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              {editingQuiz ? 'Edit Quiz' : 'Create Quiz'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Title</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Category</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                >
                  <option value="">No Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Duration (minutes)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                    required
                    min="1"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Passing Score (%)</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({...formData, passingScore: parseInt(e.target.value)})}
                    required
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Max Attempts</span>
                </label>
                <input
                  type="number"
                  className="input input-bordered"
                  value={formData.maxAttempts}
                  onChange={(e) => setFormData({...formData, maxAttempts: parseInt(e.target.value)})}
                  required
                  min="1"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Status</span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="UNPUBLISHED">Unpublished</option>
                </select>
              </div>

              <div className="modal-action">
                <button type="button" className="btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingQuiz ? 'Update' : 'Create'}
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

export default Quizzes;