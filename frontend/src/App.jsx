import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PredictPricePage from './pages/PredictPricePage';
import PredictionHistoryPage from './pages/PredictionHistoryPage';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          
          {/* Public Predict and dashboard routes directly accessible */}
          <Route path="/predict" element={<PredictPricePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<PredictionHistoryPage />} />

          {/* Root Wildcard redirects straight to predictor page */}
          <Route path="/" element={<Navigate to="/predict" replace />} />
          <Route path="*" element={<Navigate to="/predict" replace />} />

        </Routes>
      </Layout>
    </Router>
  );
}
