// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import Router components
import App from './App'; // Your login and sign-up component
import Home from './home'; // Your homepage component
import './index.css'; // Import your CSS

ReactDOM.render(
  <React.StrictMode>
    <Router> {/* This wraps your app in a router */}
      <Routes>
        <Route path="/" element={<App />} /> {/* Login and sign-up page */}
        <Route path="/home" element={<Home />} /> {/* Redirect to homepage after login */}
      </Routes>
    </Router>,
  </React.StrictMode>,
  document.getElementById('root')
);

