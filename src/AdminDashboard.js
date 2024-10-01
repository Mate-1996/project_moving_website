import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';  // Ensure this path is correct
import { ref, onValue, update, remove } from 'firebase/database';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editing, setEditing] = useState(null);
    const [modifiedBooking, setModifiedBooking] = useState({});

    // Fetch bookings from Firebase
    useEffect(() => {
        const bookingsRef = ref(db, 'bookings/');
        onValue(bookingsRef, (snapshot) => {
            const data = snapshot.val();
            console.log('Fetched data:', data); // Log fetched data for debugging
            const bookingsList = data ? Object.entries(data).map(([id, booking]) => ({ id, ...booking })) : [];
            console.log('Processed bookings list:', bookingsList); // Log processed bookings list
            setBookings(bookingsList);
        });
    }, []);

    // Delete booking
    const handleDelete = (id) => {
        const bookingRef = ref(db, `bookings/${id}`);
        remove(bookingRef)
            .then(() => {
                console.log(`Booking ${id} deleted successfully.`);
            })
            .catch((error) => {
                console.error('Error deleting booking:', error);
            });
    };

    // Modify booking
    const handleModify = (id) => {
        const bookingRef = ref(db, `bookings/${id}`);
        update(bookingRef, modifiedBooking)
            .then(() => {
                console.log(`Booking ${id} updated successfully.`);
                setEditing(null); // Exit editing mode
            })
            .catch((error) => {
                console.error('Error updating booking:', error);
            });
    };

    // Start editing a booking
    const startEditing = (booking) => {
        setEditing(booking.id);
        setModifiedBooking(booking);
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditing(null);
        setModifiedBooking({});
    };

    // Filter bookings based on search term
    const filteredBookings = bookings.filter((booking) => {
        const email = booking.email || '';  // Default to empty string if undefined
        const date = booking.date || '';    // Default to empty string if undefined
        return (
            email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            date.includes(searchTerm)
        );
    });

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            <input
                type="text"
                placeholder="Search by email or date"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <table className="bookings-table">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Date</th>
                        <th>Furniture Amount</th>
                        <th>Distance</th>
                        <th>Starting Location</th>
                        <th>Arrival Location</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBookings.length > 0 ? (
                        filteredBookings.map((booking) => (
                            <tr key={booking.id}>
                                <td>
                                    {editing === booking.id ? (
                                        <input
                                            type="text"
                                            value={modifiedBooking.email || ''}
                                            onChange={(e) => setModifiedBooking({ ...modifiedBooking, email: e.target.value })}
                                        />
                                    ) : (
                                        booking.email
                                    )}
                                </td>
                                <td>
                                    {editing === booking.id ? (
                                        <input
                                            type="date"
                                            value={modifiedBooking.date || ''}
                                            onChange={(e) => setModifiedBooking({ ...modifiedBooking, date: e.target.value })}
                                        />
                                    ) : (
                                        booking.date
                                    )}
                                </td>
                                <td>
                                    {editing === booking.id ? (
                                        <input
                                            type="number"
                                            value={modifiedBooking.furnitureAmount || ''}
                                            onChange={(e) => setModifiedBooking({ ...modifiedBooking, furnitureAmount: e.target.value })}
                                        />
                                    ) : (
                                        booking.furnitureAmount
                                    )}
                                </td>
                                <td>
                                    {editing === booking.id ? (
                                        <input
                                            type="text"
                                            value={modifiedBooking.distance || ''}
                                            onChange={(e) => setModifiedBooking({ ...modifiedBooking, distance: e.target.value })}
                                        />
                                    ) : (
                                        booking.distance
                                    )}
                                </td>
                                <td>
                                    {editing === booking.id ? (
                                        <input
                                            type="text"
                                            value={modifiedBooking.startingLocation || ''}
                                            onChange={(e) => setModifiedBooking({ ...modifiedBooking, startingLocation: e.target.value })}
                                        />
                                    ) : (
                                        booking.startingLocation
                                    )}
                                </td>
                                <td>
                                    {editing === booking.id ? (
                                        <input
                                            type="text"
                                            value={modifiedBooking.arrivalLocation || ''}
                                            onChange={(e) => setModifiedBooking({ ...modifiedBooking, arrivalLocation: e.target.value })}
                                        />
                                    ) : (
                                        booking.arrivalLocation
                                    )}
                                </td>
                                <td>
                                    {editing === booking.id ? (
                                        <>
                                            <button onClick={() => handleModify(booking.id)}>Save</button>
                                            <button onClick={cancelEditing}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => startEditing(booking)}>Edit</button>
                                            <button onClick={() => handleDelete(booking.id)}>Delete</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7">No bookings found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;


