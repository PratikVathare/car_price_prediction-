import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../utils/api';
import { Calendar, Search, RefreshCw, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';

export default function PredictionHistoryPage() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [page, setPage] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const skip = page * limit;
      // Fetch user's own history endpoints (JWT authenticated query)
      const res = await apiService.getPersonalHistory(skip, limit);
      setHistory(res);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch search history logs.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Local filter logic
  const filteredHistory = history.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.car_name.toLowerCase().includes(term) ||
      item.fuel.toLowerCase().includes(term) ||
      item.transmission.toLowerCase().includes(term) ||
      item.owner.toLowerCase().includes(term)
    );
  });

  return (
    <div className="container space-y-4">
      
      {/* Title Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h2 className="fw-black text-dark mb-1">Prediction History</h2>
          <p className="text-secondary small mb-0">Review your past evaluated vehicle valuations logged in MySQL.</p>
        </div>
        <button 
          onClick={fetchHistory}
          disabled={loading}
          className="btn btn-outline-secondary d-flex align-items-center gap-1.5 px-3"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="card border-0 shadow-sm rounded-3 p-3 mb-4">
        <div className="input-group">
          <span className="input-group-text bg-white border-secondary-subtle text-secondary">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search by Car Name, Fuel, Transmission, Owner..."
            className="form-control border-secondary-subtle"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        
        {loading ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5 my-5">
            <Loader2 className="animate-spin text-primary mb-3" size={32} />
            <p className="text-secondary small">Connecting to database history logs...</p>
          </div>
        ) : error ? (
          <div className="text-center py-5 text-danger small fw-semibold">{error}</div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-5 text-secondary small">
            {searchTerm ? "No results match your search parameters." : "You have not evaluated any cars yet."}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-dark small">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Car Name</th>
                  <th className="px-4 py-3">Specifications</th>
                  <th className="px-4 py-3">Fuel</th>
                  <th className="px-4 py-3">Transmission</th>
                  <th className="px-4 py-3 text-end">Predicted Price</th>
                </tr>
              </thead>
              <tbody className="small">
                {filteredHistory.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-secondary whitespace-nowrap">
                      <span className="d-inline-flex align-items-center gap-1.5 font-monospace text-xs">
                        <Calendar size={14} />
                        {formatDate(item.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3 fw-bold text-dark">{item.car_name}</td>
                    <td className="px-4 py-3 text-secondary">
                      Mfg: <strong>{item.year}</strong> &middot; {item.km_driven.toLocaleString()} km &middot; {item.owner}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge rounded-pill ${
                        item.fuel === 'Diesel' ? 'bg-primary-subtle text-primary border border-primary' :
                        item.fuel === 'Petrol' ? 'bg-info-subtle text-info border border-info' :
                        'bg-secondary-subtle text-secondary border border-secondary'
                      } px-2.5 py-1.5`}>
                        {item.fuel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-secondary fw-semibold">{item.transmission}</td>
                    <td className="px-4 py-3 text-end fw-black text-success fs-6">
                      {formatCurrency(item.predicted_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="card-footer bg-light border-0 px-4 py-3 d-flex items-center justify-content-between">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
            className="btn btn-sm btn-outline-secondary px-3 d-flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            Previous
          </button>
          <span className="text-secondary small fw-bold">Page {page + 1}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={history.length < limit || loading}
            className="btn btn-sm btn-outline-secondary px-3 d-flex items-center gap-1"
          >
            Next
            <ArrowRight size={14} />
          </button>
        </div>

      </div>

    </div>
  );
}
