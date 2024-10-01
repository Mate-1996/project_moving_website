import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from './firebaseConfig'; // Firebase config
import { ref, set, push, onValue, update, remove } from 'firebase/database'; // Realtime Database functions
import { useAuthState } from 'react-firebase-hooks/auth'; // Hook to get auth state
import { auth } from './firebaseConfig'; // Firebase authentication
import './Booking.css';

const Booking = () => {
    const [date, setDate] = useState('');
    const [furnitureAmount, setFurnitureAmount] = useState('');
    const [distance, setDistance] = useState('');
    const [startingLocation, setStartingLocation] = useState('');
    const [arrivalLocation, setArrivalLocation] = useState('');
    const [fragile, setFragile] = useState(false);
    const [message, setMessage] = useState('');
    const [user] = useAuthState(auth); // Get current user
    const [bookings, setBookings] = useState([]); // For storing user's bookings
    const [selectedBookingId, setSelectedBookingId] = useState(null); // Track selected booking

    // Set min date to today's date
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (user) {
            const bookingsRef = ref(db, `bookings/${user.uid}`);
            onValue(bookingsRef, (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setBookings(Object.entries(data)); // Convert object to array
                }
            });
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            setMessage("You must be logged in to create a booking.");
            return;
        }

        if (furnitureAmount < 0 || furnitureAmount > 100) {
            setMessage('Furniture amount must be between 0 and 100.');
            return;
        }

        if (distance < 0 || distance > 25) {
            setMessage('Distance cannot exceed 25 km and must be above 0');
            return;
        }

        try {
            const bookingRef = selectedBookingId
                ? ref(db, `bookings/${user.uid}/${selectedBookingId}`)
                : push(ref(db, `bookings/${user.uid}`)); // Create a unique booking if not updating

            await set(bookingRef, {
                date,
                furnitureAmount: Number(furnitureAmount),
                distance,
                startingLocation,
                arrivalLocation,
                fragile,
                createdAt: new Date().toISOString(),
            });

            setMessage(selectedBookingId ? 'Booking updated successfully!' : 'Booking created successfully!');
            // Reset form fields
            resetForm();
        } catch (error) {
            console.error("Error saving booking: ", error);
            setMessage('Failed to save booking. Please try again.');
        }
    };

    const resetForm = () => {
        setDate('');
        setFurnitureAmount('');
        setDistance('');
        setStartingLocation('');
        setArrivalLocation('');
        setFragile(false);
        setSelectedBookingId(null); // Reset selected booking ID
    };

    const handleUpdate = (id, booking) => {
        setSelectedBookingId(id); // Set the ID of the booking to update
        setDate(booking.date);
        setFurnitureAmount(booking.furnitureAmount);
        setDistance(booking.distance);
        setStartingLocation(booking.startingLocation);
        setArrivalLocation(booking.arrivalLocation);
        setFragile(booking.fragile);
    };

    const handleDelete = async (id) => {
        try {
            const bookingRef = ref(db, `bookings/${user.uid}/${id}`);
            await remove(bookingRef);
            setMessage('Booking canceled successfully!');
        } catch (error) {
            console.error("Error deleting booking: ", error);
            setMessage('Failed to cancel booking. Please try again.');
        }
    };

    return (
        <div className="booking-container">
            <h1>Book Your Move</h1>
            {message && <p className="message">{message}</p>}

            <form onSubmit={handleSubmit} className="booking-form">
                <div className="form-group">
                    <label>Date:</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        min={today} // Prevent selecting past dates
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Amount of Furniture:</label>
                    <input
                        type="number"
                        value={furnitureAmount}
                        onChange={(e) => setFurnitureAmount(e.target.value)}
                        min="0"
                        max="100"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Distance (in km):</label>
                    <input
                        type="text"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Starting Location:</label>
                    <input
                        type="text"
                        value={startingLocation}
                        onChange={(e) => setStartingLocation(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Arrival Location:</label>
                    <input
                        type="text"
                        value={arrivalLocation}
                        onChange={(e) => setArrivalLocation(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={fragile}
                            onChange={() => setFragile(!fragile)}
                        />
                        Are there any fragile furnitures ?
                    </label>
                </div>
                <button type="submit">{selectedBookingId ? 'Update Booking' : 'Submit Booking'}</button>
            </form>

            <h2>Your Bookings</h2>
            {bookings.length > 0 ? (
                <ul>
                    {bookings.map(([id, booking]) => (
                        <li key={id} className="booking-item">
                            <p>Date: {booking.date}</p>
                            <p>Furniture: {booking.furnitureAmount}</p>
                            <p>Distance: {booking.distance}</p>
                            <p>Starting Location: {booking.startingLocation}</p>
                            <p>Arrival Location: {booking.arrivalLocation}</p>
                            <p>Fragile: {booking.fragile ? 'Yes' : 'No'}</p>
                            <button onClick={() => handleUpdate(id, booking)}>Edit</button>
                            <button onClick={() => handleDelete(id)}>Cancel</button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No bookings found.</p>
            )}
            {/* Home Button */}
            <Link to="/" className="home-button">
                <button>Home</button>
            </Link>
        </div>
    );
};

export default Booking;
