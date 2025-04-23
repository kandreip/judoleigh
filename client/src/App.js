import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Navigation from './components/Navigation';
import Members from './pages/Members';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Routes>
          <Route path="/" element={<div className="container mt-4"><h1>Welcome to Leigh Judo Club</h1></div>} />
          <Route path="/members" element={<Members />} />
          <Route path="/sessions" element={<div className="container mt-4"><h1>Training Sessions</h1></div>} />
          <Route path="/attendance" element={<div className="container mt-4"><h1>Attendance</h1></div>} />
          <Route path="/payments" element={<div className="container mt-4"><h1>Payments</h1></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 