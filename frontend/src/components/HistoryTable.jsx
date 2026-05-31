import React, { useState, useEffect } from 'react';
import { Calendar, Search, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import apiService from '../utils/api';

export default function HistoryTable({ triggerRefresh }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchHistory();
  }, [page, triggerRefresh]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const skip = page * limit;
      const res = await apiService.getHistory(skip, limit);
      setHistory(res);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch historical database entries.");
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

  // Filter history locally by search term
  const filteredHistory = history.filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      item.car_brand.toLowerCase().includes(term) ||
      item.car_model_name.toLowerCase().includes(term) ||
      item.fuel_type.toLowerCase().includes(term) ||
      item.transmission.toLowerCase().includes(term) ||
      item.owner_type.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6 pb-12">
      
      {/* Filtering Toolset */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between glass-card p-4 rounded-2xl">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Brand, Model, Fuel, Owner..."
            className="w-full pl-10 pr-4 py-2.5 input-premium focus:ring-1 text-sm"
          />
        </div>

        <button 
          onClick={fetchHistory}
          className="p-2.5 rounded-xl border border-white/5 bg-slate-900 hover:bg-slate-800 transition text-slate-400 hover:text-slate-200 self-stretch sm:self-auto flex items-center justify-center gap-2 text-sm font-semibold"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Main Table Panel */}
      <div className="glass-card rounded-3xl border border-white/5 overflow-hidden">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
            <p className="text-slate-400 text-sm">Querying MySQL predictive records...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-rose-400 text-sm">{error}</div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-sm">
            {searchTerm ? "No search records match your filter criteria." : "No predictions recorded inside database yet."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/45 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-white/5">
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6">Vehicle Details</th>
                  <th className="py-4 px-6">Fuel</th>
                  <th className="py-4 px-6">Transmission</th>
                  <th className="py-4 px-6">Ownership</th>
                  <th className="py-4 px-6 text-right">AI Predicted Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm text-slate-300">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 text-slate-500 whitespace-nowrap text-xs font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 stroke-[1.5]" />
                        {formatDate(item.created_at)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <span className="font-bold text-white block">
                          {item.car_brand} {item.car_model_name}
                        </span>
                        <span className="text-slate-500 text-xs font-medium">
                          Mfg: {item.year_manufactured} &middot; {item.km_driven.toLocaleString()} km
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full ${
                        item.fuel_type === 'Diesel' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        item.fuel_type === 'Petrol' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                        'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                      }`}>
                        {item.fuel_type}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-400">{item.transmission}</span>
                    </td>
                    <td className="py-4 px-6 text-xs font-bold text-slate-400">
                      {item.owner_type}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="font-black text-emerald-400 text-base">
                        {formatCurrency(item.predicted_price)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Simple Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/20 border-t border-white/5 text-sm">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0 || loading}
            className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition disabled:opacity-30 disabled:hover:bg-transparent font-semibold text-slate-400 hover:text-slate-200"
          >
            Previous
          </button>
          <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Page {page + 1}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={history.length < limit || loading}
            className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 transition disabled:opacity-30 disabled:hover:bg-transparent font-semibold text-slate-400 hover:text-slate-200"
          >
            Next
          </button>
        </div>

      </div>

    </div>
  );
}
