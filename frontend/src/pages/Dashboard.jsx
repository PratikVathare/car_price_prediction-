import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Cpu, DollarSign, TrendingUp, Compass, HelpCircle, Loader2, ArrowRight } from 'lucide-react';
import apiService from '../utils/api';

const COLORS = ['#0d6efd', '#0dcaf0', '#198754', '#ffc107', '#d63384', '#6f42c1', '#fd7e14'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Query global stats aggregates
      const statsRes = await apiService.getAnalytics();
      setStats(statsRes);
    } catch (err) {
      console.error(err);
      setError("Unable to retrieve dashboard dataset summaries.");
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

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 my-5">
        <Loader2 className="animate-spin text-primary mb-3" size={40} />
        <p className="text-secondary small">Gathering database stats summaries...</p>
      </div>
    );
  }

  if (error || !stats || stats.total_predictions === 0) {
    return (
      <div className="container">
        
        {/* Welcome Header Jumbotron */}
        <div className="bg-dark text-white p-5 rounded-4 mb-5 shadow-sm">
          <h1 className="fw-black display-5 mb-2">Pricing Insights</h1>
          <p className="lead text-secondary">Welcome to your AutoValuate AI pricing analytics workspace.</p>
        </div>

        {/* Empty State Banner */}
        <div className="card border-0 rounded-4 text-center py-5 px-4 shadow-sm">
          <div className="card-body py-4">
            <div className="d-inline-flex p-3 bg-secondary bg-opacity-10 text-secondary rounded-circle mb-4 animate-pulse">
              <HelpCircle size={40} />
            </div>
            <h3 className="fw-bold text-dark mb-2">Workspace Logs Empty</h3>
            <p className="text-secondary small mx-auto mb-4" style={{ maxWidth: '380px' }}>
              No prediction parameters are recorded in the database. Head over to the predictor calculator to query the TensorFlow ANN engine!
            </p>
            <Link to="/predict" className="btn btn-primary btn-lg px-4 py-2.5 fw-bold shadow-sm d-inline-flex align-items-center gap-2">
              Evaluate Car Price
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

      </div>
    );
  }

  // Map Brand search frequencies
  const brandData = Object.entries(stats.brand_stats).map(([name, count]) => ({
    name,
    count
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="container space-y-5">
      
      {/* Welcome Banner */}
      <div className="bg-dark text-white p-5 rounded-4 mb-4 shadow-sm position-relative overflow-hidden">
        <div className="position-absolute top-0 end-0 translate-middle-x p-4 opacity-10 pointer-events-none">
          <Cpu size={140} />
        </div>
        <h1 className="fw-black display-5 mb-2">AutoValuate AI Analytics</h1>
        <p className="lead text-secondary mb-0">Monitor price distributions, average valuations, and query trends dynamically.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="row g-4 mb-5">
        
        {/* Total Predictions */}
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 h-100 position-relative overflow-hidden">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-secondary mb-3 small fw-bold text-uppercase tracking-wider">
                <div className="p-2 bg-primary bg-opacity-10 rounded text-primary">
                  <Cpu size={18} />
                </div>
                Total Evaluations
              </div>
              <h2 className="fw-black text-dark mb-1">{stats.total_predictions}</h2>
              <span className="text-secondary small">Logged entries</span>
            </div>
          </div>
        </div>

        {/* Avg predicted Price */}
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 h-100 position-relative overflow-hidden">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-secondary mb-3 small fw-bold text-uppercase tracking-wider">
                <div className="p-2 bg-success bg-opacity-10 rounded text-success">
                  <DollarSign size={18} />
                </div>
                Average Price
              </div>
              <h2 className="fw-black text-success mb-1">{formatCurrency(stats.avg_predicted_price)}</h2>
              <span className="text-secondary small">Model mean output</span>
            </div>
          </div>
        </div>

        {/* Peak Predicted Price */}
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 h-100 position-relative overflow-hidden">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-secondary mb-3 small fw-bold text-uppercase tracking-wider">
                <div className="p-2 bg-info bg-opacity-10 rounded text-info">
                  <TrendingUp size={18} />
                </div>
                Peak Price
              </div>
              <h2 className="fw-black text-info mb-1">{formatCurrency(stats.max_predicted_price)}</h2>
              <span className="text-secondary small">Maximum logged value</span>
            </div>
          </div>
        </div>

        {/* Floor Predicted Price */}
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 h-100 position-relative overflow-hidden">
            <div className="card-body">
              <div className="d-flex align-items-center gap-2 text-secondary mb-3 small fw-bold text-uppercase tracking-wider">
                <div className="p-2 bg-warning bg-opacity-10 rounded text-warning">
                  <Compass size={18} />
                </div>
                Floor Price
              </div>
              <h2 className="fw-black text-warning mb-1">{formatCurrency(stats.min_predicted_price)}</h2>
              <span className="text-secondary small">Minimum logged value</span>
            </div>
          </div>
        </div>

      </div>

      {/* Visual Analytics Sections */}
      <div className="row g-4">
        
        {/* Trend Area Chart */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
              <TrendingUp className="text-primary" size={18} />
              Valuation vs. Manufacturing Year
            </h5>
            
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <AreaChart data={stats.historical_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPriceBootstrap" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0d6efd" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v/100000}L`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '0', borderRadius: '8px', color: '#fff' }}
                    labelStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                    formatter={(value) => [formatCurrency(value), 'Avg Price']}
                  />
                  <Area type="monotone" dataKey="avg_price" stroke="#0d6efd" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPriceBootstrap)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Brand Bar Chart */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
              <Cpu className="text-info" size={18} />
              Evaluations Count by Brand
            </h5>
            
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={brandData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '0', borderRadius: '8px', color: '#fff' }}
                    labelStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                    formatter={(value) => [value, 'Queries']}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {brandData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
