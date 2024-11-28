import React, { useState, useEffect } from 'react';
import { db, auth } from './FirebaseConfig'; // Import Firebase configuration and auth
import { ref, onValue, remove } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import './MoversDashboard.css';

const MoverDashboard = () => {
    const [assignedBookings, setAssignedBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Get the current user's email
    const currentUser = auth.currentUser;

    useEffect(() => {
        if (currentUser) {
            const sanitizedEmail = currentUser.email.replace('.', '_'); // Firebase-safe key
            const assignedBookingsRef = ref(db, `movers/${sanitizedEmail}/assignedBookings`);

            const unsubscribe = onValue(assignedBookingsRef, (snapshot) => {
                const fetchedBookings = [];
                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        fetchedBookings.push({
                            id: childSnapshot.key,
                            ...childSnapshot.val(),
                        });
                    });
                }
                setAssignedBookings(fetchedBookings);
                setLoading(false);
            });

            return () => unsubscribe(); // Cleanup on unmount
        }
    }, [currentUser]);

    // Handle booking removal
    const handleRemoveBooking = async (bookingId) => {
        const confirmRemove = window.confirm("Are you sure you want to remove this booking?");
        if (!confirmRemove) return;

        if (currentUser) {
            try {
                const sanitizedEmail = currentUser.email.replace('.', '_');
                const bookingRef = ref(db, `movers/${sanitizedEmail}/assignedBookings/${bookingId}`);
                await remove(bookingRef);
                alert("Booking removed successfully.");
            } catch (error) {
                console.error("Error removing booking:", error);
                alert("Failed to remove booking. Please try again.");
            }
        }
    };

    return (
        <div className="mover-dashboard">
            <h1>Mover Dashboard</h1>
            {currentUser && <p>Welcome, {currentUser.email}! Below are your assigned bookings:</p>}

            {loading ? (
                <p>Loading bookings...</p>
            ) : assignedBookings.length > 0 ? (
                <table className="assigned-bookings-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Furniture Amount</th>
                            <th>Distance</th>
                            <th>Starting Location</th>
                            <th>Arrival Location</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assignedBookings.map((booking) => (
                            <tr key={booking.id}>
                                <td>{booking.date}</td>
                                <td>{booking.furnitureAmount}</td>
                                <td>{booking.distance} km</td>
                                <td>{booking.startingLocation}</td>
                                <td>{booking.arrivalLocation}</td>
                                <td>
                                    <button
                                        onClick={() => handleRemoveBooking(booking.id)}
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No bookings assigned yet.</p>
            )}

            {/* Back to Login Button */}
            <button className="back-to-login" onClick={() => navigate('/login')}>
                Back to Login
            </button>
        </div>
    );
};

export default MoverDashboard;






