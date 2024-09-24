// import React from 'react';
// import { Link } from 'react-router-dom'; // To navigate between pages

// const HomePage = () => {
//     return (
//         <div className="homepage-container">
//             <header>
//                 <h1>Welcome to Centori Moving</h1>
//                 <nav>
//                     <ul>
//                         {/* Add navigation links */}
//                         <li>
//                             <Link to="/booking">Book a Move</Link>
//                         </li>
//                         <li>
//                             <Link to="/login">Login / Sign Up</Link>
//                         </li>
//                     </ul>
//                 </nav>
//             </header>

//             <section className="homepage-content">
//                 <h2>Your trusted moving service</h2>
//                 <p>We offer professional moving services with the utmost care, whether you're moving across the street or across the country.</p>
//             </section>

//             <footer>
//                 <p>&copy; 2024 Centori Moving. All rights reserved.</p>
//             </footer>
//         </div>
//     );
// };

// export default HomePage;


// HomePage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db, auth } from './firebaseConfig'; // Firebase config and authentication
import { collection, query, where, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import './Home.css';

const HomePage = () => {
    const [bookings, setBookings] = useState([]);
    const [newDate, setNewDate] = useState('');
    const [user, loading] = useAuthState(auth); // Get current user and loading state
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            const fetchBookings = async () => {
                const q = query(collection(db, 'bookings'), where('userId', '==', user.uid));
                const querySnapshot = await getDocs(q);
                const userBookings = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                setBookings(userBookings);
            };
            fetchBookings();
        }
    }, [user]);

    const handleReschedule = async (bookingId) => {
        if (!newDate) {
            alert('Please enter a new date.');
            return;
        }
        const bookingRef = doc(db, 'bookings', bookingId);
        await updateDoc(bookingRef, { date: newDate });
        alert('Booking rescheduled!');
        setNewDate('');
        window.location.reload();
    };

    const handleCancel = async (bookingId) => {
        const bookingRef = doc(db, 'bookings', bookingId);
        await deleteDoc(bookingRef);
        alert('Booking cancelled.');
        window.location.reload();
    };

    const handleLogout = async () => {
        await auth.signOut();
        navigate('/login'); // Redirect to login after logging out
    };

    if (loading) {
        return <div>Loading...</div>; // Show a loading state while the auth status is loading
    }

    return (
        <div className="home-container">
            <h1>Welcome to Centori Moving</h1>

            {user ? (
                <>
                    {/* If logged in, show bookings and logout option */}
                    <h2>Your Bookings</h2>
                    {bookings.length > 0 ? (
                        <ul>
                            {bookings.map(booking => (
                                <li key={booking.id}>
                                    <p>Date: {booking.date}</p>
                                    <p>Furniture Amount: {booking.furnitureAmount}</p>
                                    <p>Distance: {booking.distance} km</p>
                                    <p>From: {booking.startingLocation} To: {booking.arrivalLocation}</p>
                                    <p>Fragile: {booking.fragile ? 'Yes' : 'No'}</p>

                                    <div className="reschedule">
                                        <input
                                            type="date"
                                            value={newDate}
                                            onChange={(e) => setNewDate(e.target.value)}
                                            placeholder="New Date"
                                        />
                                        <button onClick={() => handleReschedule(booking.id)}>Reschedule</button>
                                    </div>
                                    <button onClick={() => handleCancel(booking.id)}>Cancel</button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No bookings found. <Link to="/booking">Book now!</Link></p>
                    )}

                    {/* Log Out button */}
                    <button onClick={handleLogout}>Log Out</button>
                </>
            ) : (
                <>
                    {/* If not logged in, show login/sign-up option */}
                    <h2>Please Log In or Sign Up</h2>
                    <div className="auth-buttons">
                        <Link to="/login"><button>Login</button></Link>
                        <Link to="/signup"><button>Sign Up</button></Link>
                    </div>
                </>
            )}

            {/* Book Now Button */}
            <div className="book-now">
                <Link to="/booking"><button>Book Now</button></Link>
            </div>
        </div>
    );
};

export default HomePage;
