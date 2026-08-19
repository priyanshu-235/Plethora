const Footer = () => {
  return (
    <footer className="bg-base-300 text-base-content p-10 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold text-lg mb-4">Quiz Management Platform</h3>
          <p className="text-sm opacity-70">A comprehensive online assessment system for students and educators.</p>
        </div>
        <div>
          <h6 className="font-bold mb-4">Services</h6>
          <div className="flex flex-col gap-2">
            <a className="link link-hover">Quizzes</a>
            <a className="link link-hover">Categories</a>
            <a className="link link-hover">Leaderboard</a>
          </div>
        </div>
        <div>
          <h6 className="font-bold mb-4">Company</h6>
          <div className="flex flex-col gap-2">
            <a className="link link-hover">About</a>
            <a className="link link-hover">Contact</a>
            <a className="link link-hover">Privacy Policy</a>
          </div>
        </div>
        <div>
          <h6 className="font-bold mb-4">Legal</h6>
          <div className="flex flex-col gap-2">
            <a className="link link-hover">Terms of use</a>
            <a className="link link-hover">Privacy policy</a>
            <a className="link link-hover">Cookie policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;