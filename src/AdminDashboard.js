import React, { useState, useEffect } from 'react';
import { db } from './FirebaseConfig';
import {  ref, onValue, update, remove, set  } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './FirebaseConfig';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editing, setEditing] = useState(null);
    const [modifiedBooking, setModifiedBooking] = useState({});
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [movers, setMovers] = useState([]);
    const [newMover, setNewMover] = useState({ email: '', password: '' });
    const navigate = useNavigate();
    const [ setErrorMessage] = useState('');
    const [ setSuccessMessage] = useState('');

    useEffect(() => {
        
        setNewMover({ email: '', password: '' });
    }, []);

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

    // Fetch movers from Firebase
    useEffect(() => {
        const moversRef = ref(db, 'movers');
        onValue(moversRef, (snapshot) => {
            const fetchedMovers = [];
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const mover = {
                        email: childSnapshot.key.replace('_', '.'), // Replace sanitized key back to email format
                        ...childSnapshot.val(),
                    };
                    fetchedMovers.push(mover);
                });
            }
            setMovers(fetchedMovers);
        });
    }, []);

    // Create a new mover
    const handleCreateMover = async (e) => {
        e.preventDefault();
    
        try {
            if (!newMover.email.endsWith('@centorimoving.com')) {
                setErrorMessage("Mover's email must end with '@centorimoving.com'.");
                return;
            }
    
            const { email, password } = newMover;
    
            // Create a new mover user in Firebase Authentication
            await createUserWithEmailAndPassword(auth, email, password);
    
            // Save the mover to the Realtime Database
            const sanitizedEmail = email.replace('.', '_');
            const moverRef = ref(db, `movers/${sanitizedEmail}`);
            await set(moverRef, { email, role: 'mover' });
    
            setSuccessMessage(`Mover account for ${email} created successfully.`);
            setErrorMessage('');
            setNewMover({ email: '', password: '' }); // Clear the form fields after success
        } catch (error) {
            console.error("Error creating mover account:", error);
            setErrorMessage("Failed to create mover account. " + error.message);
            setSuccessMessage('');
        }
    };

    const handleAssignMover = async (booking, moverEmail) => {
        if (!moverEmail) {
            alert("Please select a mover.");
            return;
        }
    
        const sanitizedEmail = moverEmail.replace('.', '_'); // Firebase-safe key
        const moverRef = ref(db, `movers/${sanitizedEmail}/assignedBookings/${booking.id}`);
    
        try {
            await set(moverRef, booking); // Add the booking to the mover's assignedBookings
            alert(`Booking successfully assigned to ${moverEmail}.`);
        } catch (error) {
            console.error("Error assigning booking:", error);
            alert("Failed to assign booking. Please try again.");
        }
    };

    const handleUnassignMover = async (booking, moverEmail) => {
        if (!moverEmail) return;
    
        const sanitizedEmail = moverEmail.replace('.', '_'); // Firebase-safe key
        const moverRef = ref(db, `movers/${sanitizedEmail}/assignedBookings/${booking.id}`);
        const bookingRef = ref(db, `bookings/${booking.userId}/${booking.id}/assignedTo`);
    
        try {
            await remove(moverRef); // Remove from mover's assignedBookings
            await remove(bookingRef); // Remove assignment tracking from the booking node
            alert(`Booking successfully unassigned from ${moverEmail}.`);
        } catch (error) {
            console.error("Error unassigning booking:", error);
            alert("Failed to unassign booking. Please try again.");
        }
    };

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

    const handleDeleteMover = (id) => {
        console.log("Deleting mover with ID:", id);
        const confirmDelete = window.confirm("Are you sure you want to delete this mover account?");
        if (confirmDelete) {
            const moverRef = ref(db, `movers/${id}`);
            remove(moverRef)
                .then(() => {
                    console.log(`Mover ${id} deleted successfully.`);
                })
                .catch((error) => {
                    console.error('Error deleting mover:', error);
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

    {/* Search bar for filtering bookings */}
    <input
        type="text"
        placeholder="Search by email or date"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
    />

    {/* Table for displaying and managing bookings */}
    <h2>Bookings</h2>
<table className="bookings-table">
    <thead>
        <tr>
            <th>Email</th>
            <th>Date</th>
            <th>Furniture Amount</th>
            <th>Distance in km</th>
            <th>Starting Location</th>
            <th>Arrival Location</th>
            <th>Assign to Mover</th>
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
                            onChange={(e) =>
                                setModifiedBooking({
                                    ...modifiedBooking,
                                    email: e.target.value,
                                })
                            }
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
                            onChange={(e) =>
                                setModifiedBooking({
                                    ...modifiedBooking,
                                    date: e.target.value,
                                })
                            }
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
                            onChange={(e) =>
                                setModifiedBooking({
                                    ...modifiedBooking,
                                    furnitureAmount: e.target.value,
                                })
                            }
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
                            onChange={(e) =>
                                setModifiedBooking({
                                    ...modifiedBooking,
                                    distance: e.target.value,
                                })
                            }
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
                            onChange={(e) =>
                                setModifiedBooking({
                                    ...modifiedBooking,
                                    startingLocation: e.target.value,
                                })
                            }
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
                            onChange={(e) =>
                                setModifiedBooking({
                                    ...modifiedBooking,
                                    arrivalLocation: e.target.value,
                                })
                            }
                        />
                    ) : (
                        booking.arrivalLocation || 'N/A'
                    )}
                </td>
                <td>
                    <select
                        onChange={(e) =>
                            handleAssignMover(booking, e.target.value)
                        }
                        defaultValue=""
                    >
                        <option value="" disabled>
                            Select Mover
                        </option>
                        {movers.map((mover) => (
                            <option key={mover.email} value={mover.email}>
                                {mover.email}
                            </option>
                        ))}
                    </select>
                    {booking.assignedTo && (
                        <p>Assigned to: {booking.assignedTo}</p>
                    )}
                </td>
                <td>
                    {editing === booking.id ? (
                        <>
                            <button
                                onClick={() =>
                                    handleModify(booking.userId, booking.id)
                                }
                            >
                                Save
                            </button>
                            <button onClick={cancelEditing}>Cancel</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => startEditing(booking)}>
                                Edit
                            </button>
                            <button
                                onClick={() =>
                                    handleDelete(booking.userId, booking.id)
                                }
                            >
                                Delete
                            </button>
                            {booking.assignedTo ? (
                                <button
                                    onClick={() =>
                                        handleUnassignMover(
                                            booking,
                                            booking.assignedTo
                                        )
                                    }
                                >
                                    Unassign
                                </button>
                            ) : (
                                <span>Not Assigned</span>
                            )}
                        </>
                    )}
                </td>
            </tr>
        ))
    ) : (
        <tr>
            <td colSpan="8">No bookings found.</td>
        </tr>
    )}
</tbody>

</table>


    {/* Form for creating a movers account */}
    <h2>Create a Movers Account</h2>
    <form onSubmit={handleCreateMover} className="movers-form">
    <input
    type="email"
    placeholder="Mover's Email"
    value={newMover.email}
    onChange={(e) => setNewMover({ ...newMover, email: e.target.value })}
    required
/>
<input
    type="password"
    placeholder="Mover's Password"
    value={newMover.password}
    onChange={(e) => setNewMover({ ...newMover, password: e.target.value })}
    required
/>
        <button type="submit">Create Account</button>
    </form>

    {/* Table for managing movers */}
    <h2>Movers</h2>
    <table className="movers-table">
        <thead>
            <tr>
                <th>Email</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
    {movers.map((mover) => (
        <tr key={mover.email}>
            <td>{mover.email}</td>
            <td>
                <button onClick={() => handleDeleteMover(mover.email.replace('.', '_'))}>
                    Delete
                </button>
            </td>
        </tr>
    ))}
</tbody>
    </table>

    {/* Table for managing reviews */}
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

    {/* Navigation back to login */}
    <button onClick={() => navigate('/login')}>Back to Login</button>
</div>
    );
};

export default AdminDashboard;









