import React, { useState, useEffect } from 'react';
import { db } from './FirebaseConfig'; // Firebase configuration
import { auth } from './FirebaseConfig'; // Firebase authentication
import { ref, onValue } from 'firebase/database';
import './MoversDashboard.css';

const MoverDashboard = () => {
    const [assignedBookings, setAssignedBookings] = useState([]);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="mover-dashboard">
            <h1>Mover Dashboard</h1>
            <p>Welcome, {currentUser?.email}! Below are your assigned bookings:</p>

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
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No bookings assigned yet.</p>
            )}
        </div>
    );
};

export default MoverDashboard;





