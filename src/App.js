import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import HomePage from './HomePage';
import BookingPage from './BookingPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route goes to home */}
        <Route path="/" element={<HomePage />} />

        {/* Login route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Booking route */}
        <Route path="/booking" element={<BookingPage />} />

        {/* Redirect any unknown paths to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;


