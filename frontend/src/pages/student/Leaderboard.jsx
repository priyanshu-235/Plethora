import { useState, useEffect } from 'react';
import axios from 'axios';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [categoryLeaderboard, setCategoryLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overall');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchLeaderboard();
    fetchCategories();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/leaderboard');
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
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

  const fetchCategoryLeaderboard = async (categoryName) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/leaderboard/category/${categoryName}`);
      setCategoryLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching category leaderboard:', error);
    }
  };

  const handleCategoryChange = (categoryName) => {
    setSelectedCategory(categoryName);
    if (categoryName === 'all') {
      setActiveTab('overall');
    } else {
      setActiveTab('category');
      fetchCategoryLeaderboard(categoryName);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center"><span className="loading loading-spinner loading-lg"></span></div>;
  }

  const displayLeaderboard = activeTab === 'category' ? categoryLeaderboard : leaderboard;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
      
      <div className="tabs tabs-boxed mb-6">
        <a className={`tab ${activeTab === 'overall' ? 'tab-active' : ''}`} onClick={() => { setActiveTab('overall'); setSelectedCategory('all'); }}>
          Overall
        </a>
        <a className={`tab ${activeTab === 'category' ? 'tab-active' : ''}`} onClick={() => setActiveTab('category')}>
          Category
        </a>
      </div>

      {activeTab === 'category' && (
        <div className="form-control mb-6">
          <select
            className="select select-bordered"
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">
            {activeTab === 'overall' ? 'Overall Leaderboard' : `${selectedCategory} Leaderboard`}
          </h2>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>Average Score</th>
                  <th>Highest Score</th>
                  <th>Attempts</th>
                </tr>
              </thead>
              <tbody>
                {displayLeaderboard.map((student, index) => (
                  <tr key={student.id} className={index < 3 ? 'bg-primary bg-opacity-10' : ''}>
                    <td>
                      <span className={`font-bold ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-amber-600' : ''}`}>
                        #{student.rank}
                      </span>
                    </td>
                    <td>{student.name}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <progress 
                          className="progress progress-primary w-24" 
                          value={student.averageScore} 
                          max="100"
                        ></progress>
                        <span className="font-bold">{student.averageScore}%</span>
                      </div>
                    </td>
                    <td>{student.highestScore}%</td>
                    <td>{student.attempts || student.completedAttempts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {displayLeaderboard.length === 0 && (
            <p className="text-center py-4 text-gray-500">No leaderboard data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;