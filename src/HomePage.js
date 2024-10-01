import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth'; // Import signOut and onAuthStateChanged
import { auth } from './firebaseConfig'; // Import your Firebase config
import './Home.css'; // Import your custom CSS

const HomePage = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false); // Track if user is logged in
    const navigate = useNavigate();

    // Monitor authentication state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsLoggedIn(true);  // User is logged in
            } else {
                setIsLoggedIn(false); // User is logged out
            }
        });

        return () => unsubscribe(); // Cleanup on component unmount
    }, []);

    // Handle logout functionality
    const handleLogout = async () => {
        try {
            await signOut(auth); // Firebase sign-out
            navigate('/login'); // Redirect to login page after logout
        } catch (error) {
            console.error("Error logging out: ", error);
        }
    };

    return (
        <div className="homepage-container">
            <header className="hero-section">
                <h1>Welcome to Centori Moving</h1>
                <p>Your trusted moving service in Montreal</p>

                <div className="button-group">
                    {/* Navigate using useNavigate hook */}
                    <button onClick={() => navigate('/booking')} className="action-button">Book a Move</button>

                    {/* Conditional Rendering: Show Login/Sign Up if not logged in, Logout if logged in */}
                    {isLoggedIn ? (
                        <button onClick={handleLogout} className="action-button">Logout</button>
                    ) : (
                        <button onClick={() => navigate('/login')} className="action-button">Login / Sign Up</button>
                    )}
                </div>
            </header>

            <section className="about-section">
                <h2>About Centori Moving</h2>
                <p>
                    Centori Moving is a professional moving company based in Montreal, specializing in both residential and commercial moves.
                    Whether you're relocating to a new neighborhood or moving across the city, we ensure your belongings are moved safely and efficiently.
                </p>
            </section>

            <section className="services-section">
                <h2>Our Services</h2>
                <div className="service-cards">
                    <div className="service-card">
                        <img src="truck.png" alt="Moving Truck" className="service-image" />
                        <h3>Residential Moves</h3>
                        <p>We handle local moves in Montreal with care and professionalism.</p>
                    </div>
                    <div className="service-card">
                        <img src="montreal.jpg" alt="Commercial Moving" className="service-image" />
                        <h3>Commercial Moves</h3>
                        <p>We provide specialized services for office and equipment relocations.</p>
                    </div>
                    <div className="service-card">
                        <img src="fragile.jpg" alt="Fragile Items" className="service-image" />
                        <h3>Fragile & Specialty Items</h3>
                        <p>We ensure safe packing and transport of fragile or delicate items.</p>
                    </div>
                </div>
            </section>

            <section className="why-choose-us-section">
                <h2>Why Choose Us?</h2>
                <ul>
                    <li>Experienced and professional team</li>
                    <li>Affordable pricing with no hidden fees</li>
                    <li>Safe handling of fragile and heavy items</li>
                    <li>Flexible scheduling</li>
                </ul>
            </section>

            <footer>
                <p>&copy; 2024 Centori Moving. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default HomePage;





