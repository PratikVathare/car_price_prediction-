import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiService from '../utils/api';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Form Validations
    if (formData.username.trim().length < 3) {
      setError("Username must contain at least 3 characters.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please provide a valid email address.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Re-enter password.");
      return;
    }

    setLoading(true);
    try {
      await apiService.register(formData.username, formData.email, formData.password);
      setSuccess("Account successfully registered! Redirecting to login page...");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
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
                <UserPlus size={32} />
              </div>
              <h2 className="fw-bold text-dark mb-1">Create Account</h2>
              <p className="text-secondary small">Begin using AutoValuate AI engine</p>
            </div>

            {/* Error Message alert */}
            {error && (
              <div className="alert alert-danger d-flex align-items-center gap-2 rounded-3 border-0 py-3" role="alert">
                <AlertCircle className="flex-shrink-0" size={18} />
                <div className="small fw-semibold">{error}</div>
              </div>
            )}

            {/* Success Message Alert */}
            {success && (
              <div className="alert alert-success d-flex align-items-center gap-2 rounded-3 border-0 py-3" role="alert">
                <CheckCircle2 className="flex-shrink-0" size={18} />
                <div className="small fw-semibold">{success}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              
              {/* Username */}
              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary small uppercase">Username</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. carfanatic"
                  className="form-control border-secondary-subtle"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary small uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. name@example.com"
                  className="form-control border-secondary-subtle"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              {/* Password */}
              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary small uppercase">Password</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  className="form-control border-secondary-subtle"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <label className="form-label fw-semibold text-secondary small uppercase">Confirm Password</label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter password"
                  className="form-control border-secondary-subtle"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || success}
                className="btn btn-primary btn-lg w-100 py-3 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    Sign Up
                  </>
                )}
              </button>

            </form>

            <div className="text-center mt-4 pt-2 border-top border-light-subtle">
              <span className="text-secondary small">Already have an account? </span>
              <Link to="/login" className="text-primary text-decoration-none fw-semibold small">
                Sign In
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
