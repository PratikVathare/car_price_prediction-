import React, { useState } from 'react';
import { DollarSign, Cpu, Loader2, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import apiService from '../utils/api';

const AUTOCOMPLETE_BRANDS = [
  "Maruti Swift", "Maruti Baleno", "Maruti Alto", "Maruti Dzire", "Maruti WagonR",
  "Hyundai i10", "Hyundai i20", "Hyundai Creta", "Hyundai Verna", "Hyundai Venue",
  "Honda City", "Honda Civic", "Honda Amaze", "Honda Jazz",
  "Toyota Fortuner", "Toyota Innova", "Toyota Corolla", "Toyota Glanza",
  "Ford EcoSport", "Ford Figo", "Ford Endeavour",
  "Mahindra Thar", "Mahindra Scorpio", "Mahindra XUV700", "Mahindra Bolero",
  "Tata Nexon", "Tata Harrier", "Tata Tiago", "Tata Safari",
  "BMW 3 Series", "BMW 5 Series", "BMW X1", "BMW X5"
];

export default function PriceCalculator({ onPredictionSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    year: 2018,
    km_driven: 50000,
    fuel: 'Petrol',
    seller_type: 'Individual',
    transmission: 'Manual',
    owner: 'First Owner'
  });

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  // Name suggestions logic
  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData({ ...formData, name: val });
    
    if (val.trim().length > 1) {
      const filtered = AUTOCOMPLETE_BRANDS.filter(b => 
        b.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (brand) => {
    setFormData({ ...formData, name: brand });
    setSuggestions([]);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      year: 2018,
      km_driven: 50000,
      fuel: 'Petrol',
      seller_type: 'Individual',
      transmission: 'Manual',
      owner: 'First Owner'
    });
    setPrediction(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Please enter a valid car brand and model name.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setPrediction(null);
    
    try {
      const res = await apiService.predictPrice(formData);
      setPrediction(res);
      if (onPredictionSuccess) {
        onPredictionSuccess(); // refresh history list and stats
      }
    } catch (err) {
      setError(err || "Failed to contact deep learning API.");
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto px-4 md:px-6">
      
      {/* Input Form Module */}
      <div className="lg:col-span-7 glass-card p-6 md:p-8 rounded-3xl relative overflow-visible">
        <div className="absolute top-0 right-0 p-4 text-slate-700 pointer-events-none">
          <Cpu className="w-24 h-24 stroke-[0.3] opacity-20" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          AI Price Calculator
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Provide technical specifications of the vehicle to query the TensorFlow/Keras ANN model.
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Car Brand & Model */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Car Brand & Model</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={handleNameChange}
              placeholder="e.g. Maruti Swift, Hyundai Creta"
              className="w-full px-4 py-3 input-premium focus:ring-2 focus:ring-indigo-500"
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-10 w-full mt-1.5 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden divide-y divide-white/5">
                {suggestions.map((s, idx) => (
                  <li 
                    key={idx}
                    onClick={() => selectSuggestion(s)}
                    className="px-4 py-3 hover:bg-indigo-600/25 hover:text-indigo-200 cursor-pointer text-sm transition-colors text-slate-300"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Manufacturing Year */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Year of Manufacture</label>
              <select
                value={formData.year}
                onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                className="w-full px-4 py-3 input-premium focus:ring-2"
              >
                {Array.from({ length: 27 }, (_, i) => 2026 - i).map(y => (
                  <option key={y} value={y} className="bg-slate-900">{y}</option>
                ))}
              </select>
            </div>

            {/* Kilometers Driven */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Kilometers Driven</label>
              <input
                type="number"
                required
                min="100"
                max="1000000"
                value={formData.km_driven}
                onChange={e => setFormData({ ...formData, km_driven: parseInt(e.target.value) })}
                className="w-full px-4 py-3 input-premium focus:ring-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fuel Type */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Fuel Type</label>
              <select
                value={formData.fuel}
                onChange={e => setFormData({ ...formData, fuel: e.target.value })}
                className="w-full px-4 py-3 input-premium focus:ring-2"
              >
                {["Petrol", "Diesel", "CNG", "LPG"].map(f => (
                  <option key={f} value={f} className="bg-slate-900">{f}</option>
                ))}
              </select>
            </div>

            {/* Transmission */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Transmission</label>
              <select
                value={formData.transmission}
                onChange={e => setFormData({ ...formData, transmission: e.target.value })}
                className="w-full px-4 py-3 input-premium focus:ring-2"
              >
                {["Manual", "Automatic"].map(t => (
                  <option key={t} value={t} className="bg-slate-900">{t}</option>
                ))}
              </select>
            </div>

            {/* Seller Type */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Seller Type</label>
              <select
                value={formData.seller_type}
                onChange={e => setFormData({ ...formData, seller_type: e.target.value })}
                className="w-full px-4 py-3 input-premium focus:ring-2"
              >
                {["Individual", "Dealer", "Trustmark Dealer"].map(s => (
                  <option key={s} value={s} className="bg-slate-900">{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Owner Details */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Owner Status</label>
            <select
              value={formData.owner}
              onChange={e => setFormData({ ...formData, owner: e.target.value })}
              className="w-full px-4 py-3 input-premium focus:ring-2"
            >
              {["First Owner", "Second Owner", "Third Owner", "Fourth & Above Owner", "Test Drive Car"].map(o => (
                <option key={o} value={o} className="bg-slate-900">{o}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 px-6 text-white font-bold tracking-wider btn-premium flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Features...
                </>
              ) : (
                <>
                  <Cpu className="w-5 h-5" />
                  Evaluate Price
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleReset}
              className="p-4 rounded-xl border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Output Results Module */}
      <div className="lg:col-span-5 h-full">
        {prediction ? (
          <div className="glass-card p-8 rounded-3xl border-cyan-500/20 bg-gradient-to-b from-indigo-950/20 to-slate-950/40 relative overflow-hidden h-full flex flex-col justify-between animate-float">
            
            <div className="absolute top-0 right-0 translate-x-12 -translate-y-12 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

            <div>
              <div className="inline-flex p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 mb-6">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 block mb-1">
                Evaluation Complete
              </span>
              <h3 className="text-3xl font-extrabold text-white tracking-tight mb-2">
                {prediction.car_brand} <span className="font-light text-slate-300">{prediction.car_model_name}</span>
              </h3>
              <p className="text-xs text-slate-400 mb-8 font-semibold uppercase tracking-wider">
                Manufactured in {prediction.year_manufactured} &middot; {prediction.fuel_type}
              </p>

              <div className="bg-slate-950/45 p-6 rounded-2xl border border-white/5 mb-8">
                <span className="text-slate-400 font-medium text-sm block mb-1">Estimated Selling Price</span>
                <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  {formatCurrency(prediction.predicted_price)}
                </span>
              </div>

              {/* Data parameters list */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-bold tracking-widest uppercase text-slate-500 border-b border-white/5 pb-2 mb-3">Model Parameters</h4>
                
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Kilometer Driven</span>
                  <span className="text-slate-200 font-bold">{prediction.km_driven.toLocaleString()} km</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Transmission Mode</span>
                  <span className="text-slate-200 font-bold">{prediction.transmission}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Seller Category</span>
                  <span className="text-slate-200 font-bold">{prediction.seller_type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Ownership Tier</span>
                  <span className="text-slate-200 font-bold">{prediction.owner_type}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 text-xs text-slate-400 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Deep Learning Prediction Engine v1.0.0 (Log regression)</span>
            </div>

          </div>
        ) : (
          <div className="glass-card p-8 rounded-3xl border-dashed border-white/10 flex flex-col items-center justify-center text-center h-[520px]">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6 animate-pulse">
              <DollarSign className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-2">Awaiting Parameters</h3>
            <p className="text-sm text-slate-500 max-w-[280px]">
              Fill in the vehicle parameters on the left and trigger evaluation to calculate the predicted AI valuation.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
