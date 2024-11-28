import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const SuccessPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const finalizeBooking = async () => {
            const query = new URLSearchParams(location.search);
            const sessionId = query.get('session_id'); // Retrieve session ID from URL

            if (!sessionId) {
                console.error("No session ID found in URL.");
                navigate('/'); // Redirect to home or another page if no session ID
                return;
            }

            try {
                // Call backend to get session details and finalize the booking
                const response = await fetch('http://localhost:5000/finalize-booking', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ sessionId }),
                });

                if (!response.ok) {
                    throw new Error('Failed to finalize booking');
                }

                const result = await response.json();
                console.log("Booking finalized successfully:", result);

                alert("Booking finalized and receipt sent to your email!");
                navigate('/'); // Redirect to a confirmation or dashboard page
            } catch (error) {
                console.error("Error finalizing booking:", error);
                alert("Failed to finalize booking. Please contact support.");
            }
        };

        finalizeBooking();
    }, [location, navigate]);

    return <h1>Finalizing your booking...</h1>;
};

export default SuccessPage;
