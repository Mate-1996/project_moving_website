import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { Link } from 'react-router-dom';
import 'mapbox-gl/dist/mapbox-gl.css';
import { auth, db } from './FirebaseConfig'; 
import { ref, push, set, onValue } from 'firebase/database';
import { useAuthState } from 'react-firebase-hooks/auth';
import { loadStripe } from '@stripe/stripe-js';
import './Booking.css';

const stripePromise = loadStripe('pk_test_51QClMKG3xeoTL0dZZfCkdfTHuATPGjJ5eF6dW9Cg2Y5KmOL78cqMXlMiTeOSYMuHRsnwGval4VtZkUF0ItHgShye00VgnTnlAt');

const BookingPage = () => {
    const mapContainerRef = useRef(null);
    const [viewport] = useState({
        latitude: 45.5017, // Montreal Latitude
        longitude: -73.5673, // Montreal Longitude
        zoom: 12,
    });
    const [map,setMap] = useState(null);
    const [date, setDate] = useState('');
    const [furnitureAmount, setFurnitureAmount] = useState('');
    const [distance, setDistance] = useState('');
    const [bookings, setBookings] = useState([]);
    const [fragile, setFragile] = useState(false);
    const [startingLocation, setStartingLocation] = useState('');
    const [arrivalLocation, setArrivalLocation] = useState('');
    const [isSelectingStarting, setIsSelectingStarting] = useState(true);
    const [message, setMessage] = useState('');
    const [user] = useAuthState(auth);
    const [price, setPrice] = useState(0);
    const today = new Date().toISOString().split('T')[0];

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

    // Initialize Mapbox Map
    useEffect(() => {
        mapboxgl.accessToken = 'pk.eyJ1IjoibWF0ZS0xOTk2IiwiYSI6ImNtNDFpNmxqZDFidmsyanE0cnliNHcxazkifQ.6VNhFhaGgb1ZZY7RsN_LHw';

        const mapInstance = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [viewport.longitude, viewport.latitude],
            zoom: viewport.zoom,
        });

        // Add navigation controls
        mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Listen for map clicks
        mapInstance.on('click', (event) => {
            const lngLat = event.lngLat;

            if (isSelectingStarting) {
                setStartingLocation(`Lat: ${lngLat.lat}, Lng: ${lngLat.lng}`);
            } else {
                setArrivalLocation(`Lat: ${lngLat.lat}, Lng: ${lngLat.lng}`);
            }
        });

        // Set the map instance
        setMap(mapInstance);

        return () => mapInstance.remove(); // Cleanup on unmount
    }, [viewport, isSelectingStarting]);

    // Calculate total price based on furniture and distance
    useEffect(() => {
        const furniturePrice = Number(furnitureAmount) * 10; 
        const distancePrice = Number(distance) * 5;          
        setPrice(furniturePrice + distancePrice);
    }, [furnitureAmount, distance]);

    // Handle form submission
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

    // const saveBooking = async () => {
    //     try {
    //         const bookingData = {
    //             date,
    //             furnitureAmount: Number(furnitureAmount),
    //             distance,
    //             startingLocation,
    //             arrivalLocation,
    //             userId: user.uid,
    //             price,
    //             createdAt: new Date().toISOString(),
    //         };

    //         const bookingRef = ref(db, `bookings/${user.uid}`);
    //         const newBookingRef = push(bookingRef);
    //         await set(newBookingRef, bookingData);

    //         setMessage('Booking created successfully!');
    //         resetForm();
    //     } catch (error) {
    //         console.error("Error saving booking: ", error);
    //         setMessage('Failed to save booking. Please try again.');
    //     }
    // };

    // Reset the form fields
    const resetForm = () => {
        setDate('');
        setFurnitureAmount('');
        setDistance('');
        setStartingLocation('');
        setArrivalLocation('');
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
                        min={today}
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
                        readOnly
                        placeholder="Select on the map"
                    />
                </div>
                <div className="form-group">
                    <label>Arrival Location:</label>
                    <input
                        type="text"
                        value={arrivalLocation}
                        readOnly
                        placeholder="Select on the map"
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
                    <button type="button" onClick={() => setIsSelectingStarting(true)}>
                        Select Starting Location
                    </button>
                    <button type="button" onClick={() => setIsSelectingStarting(false)}>
                        Select Arrival Location
                    </button>
                </div>
                <div className="form-group">
                    <label>Total Price: ${price}</label>
                </div>
                <button type="submit">Submit Booking & Pay</button>
            </form>

            <h2>Select Locations on the Map</h2>
            <div
                ref={mapContainerRef}
                style={{ width: '100%', height: '400px' }}
            />
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

export default BookingPage;
