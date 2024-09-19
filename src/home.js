import React from 'react';
import './home.css'; // Separate CSS file for home page styling

function Home() {
    return (
        <div className="home-container">
            <h1>Welcome to Centori Moving</h1>
            <p>
                Your trusted partner for safe and efficient moving. Whether you are relocating your home or business, 
                we are here to help you every step of the way.
            </p>
            <div className="services">
                <h2>Our Services</h2>
                <ul>
                    <li>Residential Moving</li>
                    <li>Commercial Moving</li>
                    <li>Packing and Unpacking</li>
                    <li>Storage Solutions</li>
                </ul>
            </div>
        </div>
    );
}

export default Home;
