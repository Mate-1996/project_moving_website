// Booking.js
// import React, { useState } from 'react';
// import { db } from './firebaseConfig'; // Import your Firebase configuration
// import { collection, addDoc } from 'firebase/firestore'; // Import Firestore functions
// import './Booking.css'; // Your custom CSS for styling

// const Booking = () => {
//     const [date, setDate] = useState('');
//     const [furnitureAmount, setFurnitureAmount] = useState('');
//     const [distance, setDistance] = useState('');
//     const [startingLocation, setStartingLocation] = useState('');
//     const [arrivalLocation, setArrivalLocation] = useState('');
//     const [fragile, setFragile] = useState(false);
//     const [message, setMessage] = useState('');

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         // Validate furniture amount
//         if (furnitureAmount < 0 || furnitureAmount > 100) {
//             setMessage('Furniture amount must be between 0 and 100.');
//             return;
//         }

//         try {
//             const bookingRef = collection(db, 'bookings'); // Reference to Firestore collection
//             await addDoc(bookingRef, {
//                 date,
//                 furnitureAmount: Number(furnitureAmount),
//                 distance,
//                 startingLocation,
//                 arrivalLocation,
//                 fragile,
//             });
//             setMessage('Booking created successfully!');
//             // Reset form fields
//             setDate('');
//             setFurnitureAmount('');
//             setDistance('');
//             setStartingLocation('');
//             setArrivalLocation('');
//             setFragile(false);
//         } catch (error) {
//             console.error("Error adding document: ", error);
//             setMessage('Failed to create booking. Please try again.');
//         }
//     };

//     return (
//         <div className="booking-container">
//             <h1>Book Your Move</h1>
//             <form onSubmit={handleSubmit}>
//                 <div className="form-group">
//                     <label>Date:</label>
//                     <input
//                         type="date"
//                         value={date}
//                         onChange={(e) => setDate(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <div className="form-group">
//                     <label>Amount of Furniture:</label>
//                     <input
//                         type="number"
//                         value={furnitureAmount}
//                         onChange={(e) => setFurnitureAmount(e.target.value)}
//                         min="0"
//                         max="100"
//                         required
//                     />
//                 </div>
//                 <div className="form-group">
//                     <label>Distance (in km):</label>
//                     <input
//                         type="text"
//                         value={distance}
//                         onChange={(e) => setDistance(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <div className="form-group">
//                     <label>Starting Location:</label>
//                     <input
//                         type="text"
//                         value={startingLocation}
//                         onChange={(e) => setStartingLocation(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <div className="form-group">
//                     <label>Arrival Location:</label>
//                     <input
//                         type="text"
//                         value={arrivalLocation}
//                         onChange={(e) => setArrivalLocation(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <div className="form-group">
//                     <label>
//                         <input
//                             type="checkbox"
//                             checked={fragile}
//                             onChange={() => setFragile(!fragile)}
//                         />
//                         Fragile Furniture
//                     </label>
//                 </div>
//                 <button type="submit">Submit Booking</button>
//                 {message && <p className="message">{message}</p>}
//             </form>
//         </div>
//     );
// };

// export default Booking;

import React, { useState } from 'react';
import { db } from './firebaseConfig'; // Firebase config
import { collection, addDoc } from 'firebase/firestore'; // Firestore functions
import './Booking.css'; // Custom CSS
import { useAuthState } from 'react-firebase-hooks/auth'; // Hook to get auth state
import { auth } from './firebaseConfig'; // Firebase authentication

const Booking = () => {
    const [date, setDate] = useState('');
    const [furnitureAmount, setFurnitureAmount] = useState('');
    const [distance, setDistance] = useState('');
    const [startingLocation, setStartingLocation] = useState('');
    const [arrivalLocation, setArrivalLocation] = useState('');
    const [fragile, setFragile] = useState(false);
    const [message, setMessage] = useState('');
    const [user] = useAuthState(auth); // Get current user

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate user authentication
        if (!user) {
            setMessage("You must be logged in to create a booking.");
            return;
        }

        // Validate furniture amount
        if (furnitureAmount < 0 || furnitureAmount > 100) {
            setMessage('Furniture amount must be between 0 and 100.');
            return;
        }

        try {
            const bookingRef = collection(db, 'bookings'); // Firestore collection
            await addDoc(bookingRef, {
                userId: user.uid,  // Save user's ID with the booking
                date,
                furnitureAmount: Number(furnitureAmount),
                distance,
                startingLocation,
                arrivalLocation,
                fragile,
                createdAt: new Date(),
            });
            setMessage('Booking created successfully!');
            // Reset form fields
            setDate('');
            setFurnitureAmount('');
            setDistance('');
            setStartingLocation('');
            setArrivalLocation('');
            setFragile(false);
        } catch (error) {
            console.error("Error adding document: ", error);
            setMessage('Failed to create booking. Please try again.');
        }
    };

    return (
        <div className="booking-container">
            <h1>Book Your Move</h1>
            {message && <p className="message">{message}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Date:</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
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
                        Fragile Furniture
                    </label>
                </div>
                <button type="submit">Submit Booking</button>
            </form>
        </div>
    );
};

export default Booking;
