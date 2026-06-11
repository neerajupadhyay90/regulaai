import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import App from './pages/App';
import Report from './pages/Report';
import History from './pages/History';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<App />} />
        <Route path="/report/:id" element={<Report />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
