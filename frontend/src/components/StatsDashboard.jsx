import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Cpu, DollarSign, TrendingUp, Award, Layers, HelpCircle, Loader2 } from 'lucide-react';
import apiService from '../utils/api';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

export default function StatsDashboard({ triggerRefresh }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, [triggerRefresh]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await apiService.getAnalytics();
      setData(res);
    } catch (err) {
      console.error(err);
      setError("Unable to retrieve analytical datasets.");
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
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
        <p className="text-slate-400 text-sm">Aggregating real-time MySQL parameters...</p>
      </div>
    );
  }

  if (error || !data || data.total_predictions === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 text-center py-20 glass-card rounded-3xl border-dashed border-white/10">
        <HelpCircle className="w-12 h-12 text-slate-500 mx-auto mb-4 animate-pulse" />
        <h3 className="text-lg font-bold text-slate-300 mb-1">Analytical Sandbox Empty</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          No prediction logs are currently recorded. Perform queries inside the Predictor panel to assemble analytics datasets.
        </p>
      </div>
    );
  }

  // Parse Brand Data
  const brandData = Object.entries(data.brand_stats).map(([name, count]) => ({
    name,
    count
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-8 pb-12">
      
      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Queries */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 p-4 translate-y-3 translate-x-3 text-white/5">
            <Cpu className="w-16 h-16" />
          </div>
          <div className="flex items-center gap-3 text-slate-400 mb-4">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Total Predictions</span>
          </div>
          <div className="text-3xl font-black text-white">{data.total_predictions}</div>
          <span className="text-xs text-slate-500 block mt-1">Logged MySQL rows</span>
        </div>

        {/* Avg Prediction */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 p-4 translate-y-3 translate-x-3 text-white/5">
            <DollarSign className="w-16 h-16" />
          </div>
          <div className="flex items-center gap-3 text-slate-400 mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Average Price</span>
          </div>
          <div className="text-3xl font-black text-emerald-400">{formatCurrency(data.avg_predicted_price)}</div>
          <span className="text-xs text-slate-500 block mt-1">Valuation mean</span>
        </div>

        {/* Max Prediction */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 p-4 translate-y-3 translate-x-3 text-white/5">
            <TrendingUp className="w-16 h-16" />
          </div>
          <div className="flex items-center gap-3 text-slate-400 mb-4">
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Peak Price</span>
          </div>
          <div className="text-3xl font-black text-cyan-400">{formatCurrency(data.max_predicted_price)}</div>
          <span className="text-xs text-slate-500 block mt-1">Highest logged value</span>
        </div>

        {/* Min Prediction */}
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 p-4 translate-y-3 translate-x-3 text-white/5">
            <Layers className="w-16 h-16" />
          </div>
          <div className="flex items-center gap-3 text-slate-400 mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider">Floor Price</span>
          </div>
          <div className="text-3xl font-black text-amber-400">{formatCurrency(data.min_predicted_price)}</div>
          <span className="text-xs text-slate-500 block mt-1">Lowest logged value</span>
        </div>

      </div>

      {/* Visual Chart Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Trend Area Chart */}
        <div className="glass-card p-6 rounded-3xl border border-white/5">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-bold text-white text-base">Valuation vs. Manufacturing Year</h3>
              <p className="text-xs text-slate-500">Average valuation trends by age distribution</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.historical_trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="year" stroke="#475569" fontSize={11} fontWeight={500} />
                <YAxis stroke="#475569" fontSize={11} tickFormatter={(v) => `₹${v/100000}L`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                  formatter={(value) => [formatCurrency(value), 'Avg Price']}
                />
                <Area type="monotone" dataKey="avg_price" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPrice)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Brand Bar Chart */}
        <div className="glass-card p-6 rounded-3xl border border-white/5">
          <div className="flex items-center gap-2 mb-6">
            <Award className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-bold text-white text-base">Query Counts by Car Brand</h3>
              <p className="text-xs text-slate-500">Distribution of evaluated car brands</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brandData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="name" stroke="#475569" fontSize={11} fontWeight={500} />
                <YAxis stroke="#475569" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                  formatter={(value) => [value, 'Queries']}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
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
  );
}
