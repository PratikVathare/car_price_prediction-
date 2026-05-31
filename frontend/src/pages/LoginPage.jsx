import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiService from '../utils/api';
import { LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username_or_email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (apiService.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Form Validations
    if (!formData.username_or_email.trim()) {
      setError("Username or Email address is required.");
      return;
    }
    if (formData.password.length < 5) {
      setError("Password must contain at least 5 characters.");
      return;
    }

    setLoading(true);
    try {
      await apiService.login(formData.username_or_email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center align-items-center py-5">
      <div className="col-12 col-sm-10 col-md-8 col-lg-5">
        
        {/* Card Component */}
        <div className="card shadow-lg border-0 rounded-4 p-4">
          <div className="card-body">
            
            <div className="text-center mb-4">
              <div className="d-inline-flex p-3 bg-primary bg-opacity-10 text-primary rounded-circle mb-3">
                <LogIn size={32} />
              </div>
              <h2 className="fw-bold text-dark mb-1">Welcome Back</h2>
              <p className="text-secondary small">Access the AI Car Prediction Engine</p>
            </div>

            {/* Error Notification Alert */}
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 rounded-3 border-0 py-3" role="alert">
                <AlertCircle className="flex-shrink-0" size={18} />
                <div className="small fw-semibold">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="needs-validation">
              
              {/* Username / Email */}
              <div className="mb-4">
                <label className="form-label fw-semibold text-secondary small uppercase">Username or Email</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. user@example.com"
                  className="form-control form-control-lg border-secondary-subtle"
                  value={formData.username_or_email}
                  onChange={(e) => setFormData({ ...formData, username_or_email: e.target.value })}
                />
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="form-label fw-semibold text-secondary small uppercase">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="form-control form-control-lg border-secondary-subtle"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg w-100 py-3 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Authenticating credentials...
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    Sign In
                  </>
                )}
              </button>

            </form>

            <div className="text-center mt-4 pt-2 border-top border-light-subtle">
              <span className="text-secondary small">Don't have an account? </span>
              <Link to="/register" className="text-primary text-decoration-none fw-semibold small">
                Sign Up
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
