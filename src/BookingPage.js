import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth'; // Hook to get auth state
import { auth } from './firebaseConfig'; // Firebase authentication
import { loadStripe } from '@stripe/stripe-js';  // Import Stripe
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';  // Stripe elements
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
    const stripe = useStripe();
    const elements = useElements();

    // Set min date to today's date
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        // Fetch bookings from the backend when the user logs in
        if (user) {
            fetch(`/api/bookings/${user.uid}`)
                .then(response => response.json())
                .then(data => setBookings(data))
                .catch(error => console.error("Error fetching bookings: ", error));
        }
    }, [user]);

    const calculatePrice = () => {
        const furniturePrice = Number(furnitureAmount) * 10;  // $10 per furniture
        const distancePrice = Number(distance) * 5;           // $5 per km
        setPrice(furniturePrice + distancePrice);
    };

    useEffect(() => {
        calculatePrice();  // Recalculate price when furniture amount or distance changes
    }, [furnitureAmount, distance]);

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
                price,  // Include the price in the booking data
                createdAt: new Date().toISOString(),
            };
    
            // Step 1: Create Payment Method
            const cardElement = elements.getElement(CardElement);
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });
    
            if (error) {
                console.error(error);
                setMessage('Payment failed. Please try again.');
                return;
            }
    
            // Step 2: Call your backend payment endpoint
            const paymentResponse = await fetch('/api/payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: price * 100, // Amount in cents
                    paymentMethodId: paymentMethod.id,
                }),
            });
    
            const paymentData = await paymentResponse.json();
    
            if (!paymentData.success) {
                throw new Error('Payment failed');
            }
    
            // Step 3: Save booking to your backend
            const bookingResponse = await fetch(`/api/bookings/${selectedBookingId || ''}`, {
                method: selectedBookingId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...bookingData, paymentMethodId: paymentMethod.id }),
            });
    
            if (!bookingResponse.ok) {
                throw new Error('Failed to save booking');
            }
    
            setMessage(selectedBookingId ? 'Booking updated successfully!' : 'Booking created successfully!');
            resetForm();
        } catch (error) {
            console.error("Error processing payment:", error);
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
            const response = await fetch(`/api/bookings/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to cancel booking');
            }

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

// Wrap your booking component with Stripe's Elements provider
const App = () => (
    <Elements stripe={stripePromise}>
        <Booking />
    </Elements>
);

export default App;


