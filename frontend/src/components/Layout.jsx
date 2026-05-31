import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, BarChart2, History, Cpu } from 'lucide-react';

export default function Layout({ children }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active bg-primary text-white' : 'text-secondary';

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      
      {/* Bootstrap Responsive Header Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-3">
        <div className="container">
          
          <Link to="/" className="navbar-brand d-flex align-items-center gap-2 font-monospace fw-bold">
            <div className="p-1.5 bg-primary rounded text-white d-inline-flex">
              <Car className="w-5 h-5" />
            </div>
            <span className="fs-4 text-white">AutoValuate AI</span>
          </Link>
          
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarContent"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarContent">
            
            {/* Direct Navigation Links (Always Accessible) */}
            <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1 px-lg-3">
              <li className="nav-item">
                <Link to="/predict" className={`nav-link px-3 rounded d-flex align-items-center gap-2 ${isActive('/predict')}`}>
                  <Cpu size={16} />
                  Predict Price
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/dashboard" className={`nav-link px-3 rounded d-flex align-items-center gap-2 ${isActive('/dashboard')}`}>
                  <BarChart2 size={16} />
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/history" className={`nav-link px-3 rounded d-flex align-items-center gap-2 ${isActive('/history')}`}>
                  <History size={16} />
                  Prediction History
                </Link>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-2">
              <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success px-3 py-2 small fw-bold">
                ANN Core Ready
              </span>
            </div>

          </div>
        </div>
      </nav>

      {/* Main Responsive Body Area */}
      <main className="flex-grow-1">
        <div className="container py-5">
          {children}
        </div>
      </main>

      {/* Footer Element */}
      <footer className="footer py-4 bg-dark text-light border-top border-secondary-subtle">
        <div className="container text-center">
          <span className="text-secondary small">
            &copy; 2026 AutoValuate AI Car Prediction System. Relational Database Logging Enabled.
          </span>
        </div>
      </footer>

    </div>
  );
}
