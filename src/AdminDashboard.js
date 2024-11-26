import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { ref, onValue, update, remove } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editing, setEditing] = useState(null);
    const [modifiedBooking, setModifiedBooking] = useState({});
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const navigate = useNavigate();

    // Fetch bookings from Firebase
    useEffect(() => {
        const bookingsRef = ref(db, 'bookings');
        
        const unsubscribe = onValue(bookingsRef, (snapshot) => {
            const fetchedBookings = [];
            if (snapshot.exists()) {
                snapshot.forEach((userSnapshot) => {
                    const userId = userSnapshot.key;
                    const userBookings = userSnapshot.val();
                    if (typeof userBookings === 'object') {
                        Object.entries(userBookings).forEach(([id, booking]) => {
                            fetchedBookings.push({
                                id,
                                userId,
                                ...booking,
                            });
                        });
                    }
                });
            }
            // Filter out any incomplete or undefined bookings
            setBookings(fetchedBookings.filter(booking => booking && booking.date));
        });

        // Clear bookings on unmount
        return () => {
            unsubscribe();
            setBookings([]);
        };
    }, []);

    // Fetch reviews from Firebase
    useEffect(() => {
        const reviewsRef = ref(db, 'reviews');
        onValue(reviewsRef, (snapshot) => {
            const fetchedReviews = [];
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const review = {
                        id: childSnapshot.key,
                        ...childSnapshot.val(),
                    };
                    fetchedReviews.push(review);
                });
                setReviews(fetchedReviews);
            } else {
                setReviews([]);
            }
            setLoadingReviews(false);
        });
    }, []);

    // Delete booking with confirmation
    const handleDelete = (userId, id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this booking?");
        if (confirmDelete) {
            const bookingRef = ref(db, `bookings/${userId}/${id}`);
            remove(bookingRef)
                .then(() => {
                    console.log(`Booking ${id} deleted successfully.`);
                })
                .catch((error) => {
                    console.error('Error deleting booking:', error);
                });
        }
    };

    // Delete review with confirmation
    const handleDeleteReview = (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this review?");
        if (confirmDelete) {
            const reviewRef = ref(db, `reviews/${id}`);
            remove(reviewRef)
                .then(() => {
                    console.log(`Review ${id} deleted successfully.`);
                })
                .catch((error) => {
                    console.error('Error deleting review:', error);
                });
        }
    };

    // Modify booking and keep the nested structure
    const handleModify = (userId, id) => {
        const bookingRef = ref(db, `bookings/${userId}/${id}`);
        update(bookingRef, modifiedBooking)
            .then(() => {
                console.log(`Booking ${id} updated successfully.`);
                setEditing(null);

                // Update local state without re-fetching from Firebase
                setBookings((prevBookings) =>
                    prevBookings.map((booking) =>
                        booking.id === id && booking.userId === userId
                            ? { ...booking, ...modifiedBooking }
                            : booking
                    )
                );
            })
            .catch((error) => {
                console.error('Error updating booking:', error);
            });
    };

    // Start editing a booking
    const startEditing = (booking) => {
        setEditing(booking.id);
        setModifiedBooking(booking); // Populate modifiedBooking with current booking data
    };

    // Cancel editing
    const cancelEditing = () => {
        setEditing(null);
        setModifiedBooking({});
    };

    // Filter bookings based on search term
    const filteredBookings = bookings.filter((booking) => {
        const email = booking.email ? booking.email.toLowerCase() : '';
        const date = booking.date || '';

        if (!searchTerm) return true;

        return (
            email.includes(searchTerm.toLowerCase()) ||
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
                                        booking.email || 'N/A'
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
                                        booking.date || 'N/A'
                                    )}
                                </td>
                                <td>
                                    {editing === booking.id ? (
                                        <input
                                            type="number"
                                            value={modifiedBooking.furnitureAmount || 0}
                                            onChange={(e) => setModifiedBooking({ ...modifiedBooking, furnitureAmount: e.target.value })}
                                        />
                                    ) : (
                                        booking.furnitureAmount || 0
                                    )}
                                </td>
                                <td>
                                    {editing === booking.id ? (
                                        <input
                                            type="text"
                                            value={modifiedBooking.distance || 0}
                                            onChange={(e) => setModifiedBooking({ ...modifiedBooking, distance: e.target.value })}
                                        />
                                    ) : (
                                        booking.distance || 0
                                    )}
                                </td>
                                <td>
                                    {editing === booking.id ? (
                                        <input
                                            type="text"
                                            value={modifiedBooking.startingLocation || 'N/A'}
                                            onChange={(e) => setModifiedBooking({ ...modifiedBooking, startingLocation: e.target.value })}
                                        />
                                    ) : (
                                        booking.startingLocation || 'N/A'
                                    )}
                                </td>
                                <td>
                                    {editing === booking.id ? (
                                        <input
                                            type="text"
                                            value={modifiedBooking.arrivalLocation || 'N/A'}
                                            onChange={(e) => setModifiedBooking({ ...modifiedBooking, arrivalLocation: e.target.value })}
                                        />
                                    ) : (
                                        booking.arrivalLocation || 'N/A'
                                    )}
                                </td>
                                <td>
                                    {editing === booking.id ? (
                                        <>
                                            <button onClick={() => handleModify(booking.userId, booking.id)}>Save</button>
                                            <button onClick={cancelEditing}>Cancel</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => startEditing(booking)}>Edit</button>
                                            <button onClick={() => handleDelete(booking.userId, booking.id)}>Delete</button>
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

            <h2>Reviews</h2>
            {loadingReviews ? (
                <p>Loading reviews...</p>
            ) : reviews.length > 0 ? (
                <table className="reviews-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Review</th>
                            <th>Stars</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map((review) => (
                            <tr key={review.id}>
                                <td>{review.user}</td>
                                <td>{review.text}</td>
                                <td>{review.stars}</td>
                                <td>
                                    <button onClick={() => handleDeleteReview(review.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No reviews found.</p>
            )}

            <button onClick={() => navigate('/login')}>Back to Login</button>
        </div>
    );
};

export default AdminDashboard;









