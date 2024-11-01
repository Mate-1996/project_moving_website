import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth'; // Hook to get auth state
import { auth, db } from './firebaseConfig'; // Firebase authentication and Realtime Database
import { ref, onValue, set, push, remove } from 'firebase/database'; // Import Firebase Realtime Database methods
import { loadStripe } from '@stripe/stripe-js';  // Import Stripe
import { Elements, CardElement} from '@stripe/react-stripe-js';  // Stripe elements
import './Booking.css';

const stripePromise = loadStripe('pk_test_51QClMKG3xeoTL0dZZfCkdfTHuATPGjJ5eF6dW9Cg2Y5KmOL78cqMXlMiTeOSYMuHRsnwGval4VtZkUF0ItHgShye00VgnTnlAt');

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
    const [price, setPrice] = useState(0);  // State for total price

    // Set min date to today's date
    const today = new Date().toISOString().split('T')[0];

    // Fetch bookings from Firebase Realtime Database
    useEffect(() => {
        if (user) {
            const bookingsRef = ref(db, `bookings/${user.uid}`); // Reference to the user's bookings

            // Listen for value changes in the bookings node
            onValue(bookingsRef, (snapshot) => {
                if (snapshot.exists()) {
                    const fetchedBookings = [];
                    snapshot.forEach((childSnapshot) => {
                        const booking = {
                            id: childSnapshot.key,  // The unique ID for each booking
                            ...childSnapshot.val(), // The actual booking data
                        };
                        fetchedBookings.push(booking);
                    });
                    setBookings(fetchedBookings); // Update state with fetched bookings
                } else {
                    setBookings([]); // Clear bookings if none are found
                }
            }, (error) => {
                console.error("Error fetching bookings: ", error);
            });
        }
    }, [user]);

    // Calculate total price based on the number of furniture items and distance
    const calculatePrice = useCallback(() => {
        const furniturePrice = Number(furnitureAmount) * 10;  // $10 per furniture
        const distancePrice = Number(distance) * 5;           // $5 per km
        setPrice(furniturePrice + distancePrice);
      }, [furnitureAmount, distance]);
    
      useEffect(() => {
        calculatePrice();  // Recalculate price when furniture amount or distance changes
      }, [furnitureAmount, distance, calculatePrice]);

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
            // Create booking data
            const bookingData = {
                date,
                furnitureAmount: Number(furnitureAmount),
                distance,
                startingLocation,
                arrivalLocation,
                fragile,
                userId: user.uid,
                price,
                createdAt: new Date().toISOString(),
            };

            // Save booking data to Firebase Realtime Database
            const bookingRef = ref(db, `bookings/${user.uid}`);
            const newBookingRef = push(bookingRef); // Create a new unique ID for the booking
            await set(newBookingRef, bookingData); // Save bookingData under the new bookingRef

            // Create a Checkout Session by calling the backend
            const response = await fetch('http://localhost:5000/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount: price * 100 }), // Send amount in cents
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                throw new Error(errorResponse.error);
            }

            const session = await response.json();

            // Redirect to Stripe's Checkout page
            const stripe = await stripePromise;
            const { error } = await stripe.redirectToCheckout({
                sessionId: session.id,
            });

            if (error) {
                console.error(error);
                setMessage('Payment failed. Please try again.');
            }

            // Reset the form
            resetForm();

            setMessage('Booking created successfully!');
        } catch (error) {
            console.error("Error creating checkout session:", error);
            setMessage('Failed to create booking. Please try again.');
        }
    };

    // Function to reset the form fields
    const resetForm = () => {
        setDate('');
        setFurnitureAmount('');
        setDistance('');
        setStartingLocation('');
        setArrivalLocation('');
        setFragile(false);
        setSelectedBookingId(null);
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
            await remove(bookingRef); // Remove the selected booking from Firebase

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
                        type="number"
                        value={distance}
                        onChange={(e) => setDistance(e.target.value)}
                        min="0"
                        max="25"
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
                        Are there any fragile furnitures?
                    </label>
                </div>
                <div className="form-group">
                    <label>Total Price: ${price}</label>
                </div>
                {/* Card Element for Payment */}
                <div className="form-group">
                    <label>Credit Card Information:</label>
                    <CardElement />
                </div>
                <button type="submit">{selectedBookingId ? 'Update Booking & Pay' : 'Submit Booking & Pay'}</button>
            </form>

            <h2>Your Bookings</h2>
            {bookings.length > 0 ? (
                <ul>
                    {bookings.map((booking) => (
                        <li key={booking.id} className="booking-item">
                            <p>Date: {booking.date}</p>
                            <p>Furniture: {booking.furnitureAmount}</p>
                            <p>Distance: {booking.distance}</p>
                            <p>Starting Location: {booking.startingLocation}</p>
                            <p>Arrival Location: {booking.arrivalLocation}</p>
                            <p>Fragile: {booking.fragile ? 'Yes' : 'No'}</p>
                            <button onClick={() => handleUpdate(booking.id, booking)}>Edit</button>
                            <button onClick={() => handleDelete(booking.id)}>Cancel</button>
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

// Wrap your booking component with Stripe's Elements provider
const App = () => (
    <Elements stripe={stripePromise}>
        <Booking />
    </Elements>
);

export default App;