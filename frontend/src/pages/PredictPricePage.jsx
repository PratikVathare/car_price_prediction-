import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../utils/api';
import { Cpu, RotateCcw, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';

const AUTOCOMPLETE_BRANDS = [
  "Maruti Swift", "Maruti Alto", "Maruti Baleno", "Maruti Dzire", "Maruti WagonR",
  "Hyundai i10", "Hyundai i20", "Hyundai Creta", "Hyundai Verna",
  "Honda City", "Honda Amaze", "Honda Civic",
  "Toyota Innova", "Toyota Fortuner", "Toyota Glanza",
  "Ford EcoSport", "Ford Figo", "Ford Endeavour",
  "Mahindra Thar", "Mahindra Scorpio", "Mahindra XUV700",
  "Tata Nexon", "Tata Harrier", "Tata Tiago",
  "BMW 3 Series", "BMW X1", "BMW X5"
];

export default function PredictPricePage() {
  const navigate = useNavigate();

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
    setError(null);
    setPrediction(null);

    // Client-side Validation
    if (!formData.name.trim()) {
      setError("Please input a valid Brand or Model Name.");
      return;
    }
    if (formData.km_driven < 100) {
      setError("Mileage (KM Driven) must be at least 100 km.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.predictPrice(formData);
      setPrediction(res);
    } catch (err) {
      setError(err);
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
    <div className="row g-4">
      
      {/* Form Card Input Grid */}
      <div className="col-12 col-lg-7">
        <div className="card shadow-sm border-0 rounded-4 p-4 position-relative overflow-visible">
          <div className="card-body">
            
            <h3 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <Sparkles className="text-primary" size={24} />
              AI Value Predictor
            </h3>
            <p className="text-secondary small mb-4">
              Enter the vehicle specifications to query the pre-trained TensorFlow/Keras ANN model.
            </p>

            {error && (
              <div className="alert alert-danger border-0 rounded-3 small py-3 mb-4 d-flex align-items-center gap-2">
                <AlertTriangle size={16} />
                <strong>Error: </strong> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              
              {/* Brand and Model with Autocomplete */}
              <div className="mb-3 position-relative">
                <label className="form-label fw-semibold text-secondary small uppercase">Car Brand & Model</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maruti Swift, Hyundai Creta"
                  className="form-control form-control-lg border-secondary-subtle"
                  value={formData.name}
                  onChange={handleNameChange}
                  autoComplete="off"
                />
                {suggestions.length > 0 && (
                  <ul className="list-group position-absolute w-100 z-3 shadow-lg rounded-3 border-secondary-subtle mt-1 overflow-hidden">
                    {suggestions.map((s, idx) => (
                      <li
                        key={idx}
                        onClick={() => selectSuggestion(s)}
                        className="list-group-item list-group-item-action cursor-pointer px-3 py-2 text-dark small"
                        style={{ cursor: 'pointer' }}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="row g-3 mb-3">
                {/* Manufacturing Year */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-secondary small uppercase">Manufacturing Year</label>
                  <select
                    className="form-select border-secondary-subtle"
                    value={formData.year}
                    onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  >
                    {Array.from({ length: 27 }, (_, i) => 2026 - i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                {/* KM Driven */}
                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold text-secondary small uppercase">Kilometers Driven</label>
                  <input
                    type="number"
                    required
                    min="100"
                    placeholder="e.g. 45000"
                    className="form-control border-secondary-subtle"
                    value={formData.km_driven}
                    onChange={e => setFormData({ ...formData, km_driven: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                {/* Fuel Type */}
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold text-secondary small uppercase">Fuel Type</label>
                  <select
                    className="form-select border-secondary-subtle"
                    value={formData.fuel}
                    onChange={e => setFormData({ ...formData, fuel: e.target.value })}
                  >
                    {["Petrol", "Diesel", "CNG", "LPG"].map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                {/* Transmission */}
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold text-secondary small uppercase">Transmission</label>
                  <select
                    className="form-select border-secondary-subtle"
                    value={formData.transmission}
                    onChange={e => setFormData({ ...formData, transmission: e.target.value })}
                  >
                    {["Manual", "Automatic"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Seller Type */}
                <div className="col-12 col-md-4">
                  <label className="form-label fw-semibold text-secondary small uppercase">Seller Type</label>
                  <select
                    className="form-select border-secondary-subtle"
                    value={formData.seller_type}
                    onChange={e => setFormData({ ...formData, seller_type: e.target.value })}
                  >
                    {["Individual", "Dealer", "Trustmark Dealer"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Owner Status */}
              <div className="mb-4">
                <label className="form-label fw-semibold text-secondary small uppercase">Owner Status</label>
                <select
                  className="form-select border-secondary-subtle"
                  value={formData.owner}
                  onChange={e => setFormData({ ...formData, owner: e.target.value })}
                >
                  {["First Owner", "Second Owner", "Third Owner", "Fourth & Above Owner", "Test Drive Car"].map(o => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              {/* Actions Button */}
              <div className="d-flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg flex-grow-1 py-3 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Evaluating features...
                    </>
                  ) : (
                    <>
                      <Cpu size={18} />
                      Evaluate Car Price
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn-outline-secondary px-4 d-flex align-items-center justify-content-center rounded-3"
                >
                  <RotateCcw size={18} />
                </button>
              </div>

            </form>

          </div>
        </div>
      </div>

      {/* Output Results Card */}
      <div className="col-12 col-lg-5">
        {prediction ? (
          <div className="card shadow-lg border-success bg-success bg-opacity-10 rounded-4 p-4 h-100 d-flex flex-column justify-content-between">
            <div className="card-body">
              
              <div className="d-inline-flex p-3 bg-success bg-opacity-25 text-success rounded-circle mb-4">
                <CheckCircle2 size={32} />
              </div>
              
              <span className="text-success small fw-bold text-uppercase tracking-wider block mb-1">
                Prediction Completed
              </span>
              <h2 className="fw-black text-dark tracking-tight mb-2">
                {prediction.car_name}
              </h2>
              <p className="text-secondary small mb-4">
                Year: <strong>{prediction.year}</strong> &middot; Fuel: <strong>{prediction.fuel}</strong>
              </p>

              {/* Price Callout */}
              <div className="bg-white border rounded-3 p-4 shadow-sm mb-4">
                <span className="text-secondary small block mb-1">Estimated Market Valuation</span>
                <h1 className="fw-black text-success display-6 mb-0">
                  {formatCurrency(prediction.predicted_price)}
                </h1>
              </div>

              {/* Data specifications */}
              <div className="space-y-2 text-secondary small border-top border-light-subtle pt-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>KM Driven:</span>
                  <span className="text-dark fw-bold">{prediction.km_driven.toLocaleString()} km</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Transmission:</span>
                  <span className="text-dark fw-bold">{prediction.transmission}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Seller Category:</span>
                  <span className="text-dark fw-bold">{prediction.seller_type}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Ownership Tier:</span>
                  <span className="text-dark fw-bold">{prediction.owner}</span>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="card shadow-sm border-0 border-dashed rounded-4 p-5 d-flex flex-column align-items-center justify-content-center text-center h-100" style={{ border: '2px dashed #cbd5e1', minHeight: '380px' }}>
            <div className="card-body py-5 d-flex flex-column align-items-center justify-content-center">
              <div className="p-3 bg-light rounded-circle text-secondary mb-3">
                <Cpu size={32} />
              </div>
              <h5 className="fw-bold text-dark mb-1">Awaiting Valuation</h5>
              <p className="text-secondary small mx-auto" style={{ maxWidth: '240px' }}>
                Fill in the specifications on the left and submit to trigger model predictions.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
