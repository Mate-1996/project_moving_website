// import React, { useState, useEffect } from 'react';
// import { db } from './firebaseConfig';  // Ensure this path is correct
// import { ref, onValue, remove } from 'firebase/database';
// import './AdminDashboard.css';

// const AdminDashboard = () => {
//     const [bookings, setBookings] = useState([]);
//     const [reviews, setReviews] = useState([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [loadingReviews, setLoadingReviews] = useState(true);

//     // Fetch bookings from Firebase
//     useEffect(() => {
//         const bookingsRef = ref(db, 'bookings/');
//         onValue(bookingsRef, (snapshot) => {
//             const data = snapshot.val();
//             const bookingsList = data ? Object.entries(data).map(([id, booking]) => ({ id, ...booking })) : [];
//             setBookings(bookingsList);
//         });
//     }, []);

//     // Fetch reviews from Firebase
//     useEffect(() => {
//         const reviewsRef = ref(db, 'reviews'); // Reference to the 'reviews' node
//         onValue(reviewsRef, (snapshot) => {
//             if (snapshot.exists()) {
//                 const fetchedReviews = [];
//                 snapshot.forEach((childSnapshot) => {
//                     const review = {
//                         id: childSnapshot.key,  // The unique ID for each review
//                         ...childSnapshot.val(), // The actual review data
//                     };
//                     fetchedReviews.push(review);
//                 });
//                 setReviews(fetchedReviews); // Update the state with fetched reviews
//             } else {
//                 setReviews([]); // Clear reviews if there are no reviews
//             }
//             setLoadingReviews(false); // Set loading to false once data is fetched
//         });
//     }, []);

//     // Delete review
//     const handleDeleteReview = (id) => {
//         const reviewRef = ref(db, `reviews/${id}`);
//         remove(reviewRef)
//             .then(() => {
//                 console.log(`Review ${id} deleted successfully.`);
//             })
//             .catch((error) => {
//                 console.error('Error deleting review:', error);
//             });
//     };

//     return (
//         <div className="admin-dashboard">
//             <h1>Admin Dashboard</h1>
            
//             <h2>Bookings</h2>
//             {/* Your booking table and search functionality here... */}

//             <h2>Reviews</h2>
//             {loadingReviews ? (
//                 <p>Loading reviews...</p>
//             ) : reviews.length > 0 ? (
//                 <table className="reviews-table">
//                     <thead>
//                         <tr>
//                             <th>User</th>
//                             <th>Review</th>
//                             <th>Stars</th>
//                             <th>Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {reviews.map((review) => (
//                             <tr key={review.id}>
//                                 <td>{review.user}</td>
//                                 <td>{review.text}</td>
//                                 <td>{review.stars}</td>
//                                 <td>
//                                     <button onClick={() => handleDeleteReview(review.id)}>Delete</button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             ) : (
//                 <p>No reviews found.</p>
//             )}
//         </div>
//     );
// };

// export default AdminDashboard;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { ref, push, set, onValue } from 'firebase/database'; // Import Realtime Database methods
import { auth, db } from './firebaseConfig'; // Import Realtime Database instance
import './home.css';

const HomePage = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [reviewText, setReviewText] = useState('');
    const [starRating, setStarRating] = useState(5); // Default star rating to 5
    const [loadingReviews, setLoadingReviews] = useState(true);
    const navigate = useNavigate();

    // Monitor authentication state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
            }
        });
        return () => unsubscribe();
    }, []);

    
    // Fetch reviews from Firebase Realtime Database
useEffect(() => {
    const reviewsRef = ref(db, 'reviews'); // Reference to the 'reviews' node
    const unsubscribe = onValue(reviewsRef, (snapshot) => {
        if (snapshot.exists()) {
            const fetchedReviews = [];
            snapshot.forEach((childSnapshot) => {
                const review = {
                    id: childSnapshot.key,  // The unique ID for each review
                    ...childSnapshot.val(), // The actual review data
                };
                fetchedReviews.push(review);
            });
            setReviews(fetchedReviews); // Update the state with fetched reviews
        } else {
            setReviews([]); // Clear the reviews if there are no reviews
        }
        setLoadingReviews(false); // Set loading to false once data is fetched
    });

    return () => unsubscribe(); // Unsubscribe from listener on component unmount
}, []);

    // Handle review submission
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (reviewText.trim()) {
            const reviewsRef = ref(db, 'reviews'); // Reference to the 'reviews' node
            const newReviewRef = push(reviewsRef); // Create a new child under 'reviews'
            try {
                // Use set() on the newReviewRef to add the data
                await set(newReviewRef, {
                    text: reviewText,
                    stars: starRating, // Add the star rating to the review data
                    createdAt: new Date().toISOString(),
                    user: auth.currentUser ? auth.currentUser.email : 'Anonymous', // User email or 'Anonymous'
                });
                setReviewText(''); // Clear the text area after submission
                setStarRating(5);  // Reset star rating to 5
                console.log('Review added successfully');
            } catch (error) {
                console.error('Error adding review: ', error);
            }
        } else {
            alert('Please write a review before submitting.');
        }
    };
    

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Error logging out: ', error);
        }
    };

    return (
        <div className="homepage-container">
            <header className="hero-section">
                <h1>Welcome to Centori Moving</h1>
                <p>Your trusted moving service in Montreal</p>

                <div className="button-group">
                    {/* Conditional navigation or alert based on login status */}
                    <button 
                        onClick={() => {
                            if (isLoggedIn) {
                                navigate('/booking');  // If logged in, navigate to booking
                            } else {
                                alert('You must be logged in to book a move!');  // If not logged in, show alert
                            }
                        }} 
                        className="action-button"
                    >
                        Book a Move
                    </button>

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

            <section className="reviews-section">
                <h2>Customer Reviews</h2>
                {loadingReviews ? (
                    <p>Loading reviews...</p>
                ) : (
                    <ul className="reviews-list">
                        {reviews.map((review) => (
                            <li key={review.id} className="review-item">
                                <p><strong>{review.user}:</strong> {review.text} - <strong>{review.stars} ★</strong></p>
                            </li>
                        ))}
                    </ul>
                )}

                {isLoggedIn && (
                    <div className="review-form">
                        <h3>Leave a Review</h3>
                        <form onSubmit={handleReviewSubmit}>
                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                placeholder="Write your review here..."
                                rows="4"
                                required
                            />
                            <div>
                                <label htmlFor="starRating">Rate your experience:</label>
                                <select
                                    id="starRating"
                                    value={starRating}
                                    onChange={(e) => setStarRating(Number(e.target.value))}
                                    required
                                >
                                    <option value={5}>5 Stars</option>
                                    <option value={4}>4 Stars</option>
                                    <option value={3}>3 Stars</option>
                                    <option value={2}>2 Stars</option>
                                    <option value={1}>1 Star</option>
                                </select>
                            </div>
                            <button type="submit" className="action-button">Submit Review</button>
                        </form>
                    </div>
                )}
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






