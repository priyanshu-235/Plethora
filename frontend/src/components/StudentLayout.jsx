import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from './Footer';

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main content area with sidebar and dashboard */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-80 bg-base-200 min-h-screen p-4 flex flex-col">
          {/* Sidebar Header */}
          <div className="mb-4">
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="avatar placeholder">
                <div className="bg-secondary text-secondary-content rounded-full w-12 flex items-center justify-center">
                  <span className="text-xl">S</span>
                </div>
              </div>
              <div>
                <div className="font-bold">Student Portal</div>
                <div className="text-xs opacity-60">Quiz Platform</div>
              </div>
            </div>
          </div>
          
          <div className="divider"></div>
          
          {/* Navigation */}
          <ul className="menu text-base-content flex-1">
            <li>
              <Link to="/student/dashboard" className={isActive('/student/dashboard') ? 'active' : ''}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/student/quizzes" className={isActive('/student/quizzes') ? 'active' : ''}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                Available Quizzes
              </Link>
            </li>
            <li>
              <Link to="/student/history" className={isActive('/student/history') ? 'active' : ''}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Quiz History
              </Link>
            </li>
            <li>
              <Link to="/student/leaderboard" className={isActive('/student/leaderboard') ? 'active' : ''}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001-.946-4.44 5.448 5.448 0 00-7.771 0 7.771 7.771 0 004.44 1.946 3.42 3.42 0 004.44-1.946 5.448 5.448 0 007.771 0 7.771 7.771 0 00-1.946-4.44 3.42 3.42 0 00-4.44 1.946 5.448 5.448 0 00-7.771 0 7.771 0 001.946 4.44"></path></svg>
                Leaderboard
              </Link>
            </li>
            <div className="divider"></div>
            <li>
              <Link to="/login" onClick={logout} className="text-error">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                Logout
              </Link>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Navbar */}
          <div className="navbar bg-base-100 shadow-lg">
            <div className="flex-1">
              <a className="btn btn-ghost normal-case text-xl">Quiz Platform</a>
            </div>
            <div className="flex-none gap-2">
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                  <div className="w-10 rounded-full">
                    <div className="flex items-center justify-center h-full bg-secondary text-secondary-content">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </label>
                <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                  <li className="menu-title">{user?.name}</li>
                  <li><a className="text-sm opacity-70">{user?.email}</a></li>
                  <div className="divider my-0"></div>
                  <li><button onClick={logout} className="text-error">Logout</button></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default StudentLayout;