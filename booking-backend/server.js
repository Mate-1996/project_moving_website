const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(require('./serviceAccountKey.json')),
    databaseURL: "https://centori-moving-default-rtdb.firebaseio.com/"
});

const app = express();
app.use(bodyParser.json());

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'matechachkiani@gmail.com', // your email
        pass: 'matematemate123'   // your email password or app-specific password
    }
});

app.post('/createBooking', async (req, res) => {
    const { userId, bookingDetails } = req.body;  // Extract user ID and booking details from request body

    try {
        // Store booking in Firebase Realtime Database
        const bookingRef = admin.database().ref(`bookings/${userId}`).push();
        await bookingRef.set({
            ...bookingDetails,
            createdAt: new Date().toISOString(),
        });

        // Retrieve user's email from Firebase Authentication
        const userRecord = await admin.auth().getUser(userId);
        const userEmail = userRecord.email;

        // Email content
        const mailOptions = {
            from: 'matechachkiani@gmail.com',
            to: userEmail,
            subject: 'Booking Confirmation',
            text: `
                Hello,

                Your booking has been successfully created. Here are the details:

                Date: ${bookingDetails.date}
                Furniture Amount: ${bookingDetails.furnitureAmount}
                Distance: ${bookingDetails.distance} km
                Starting Location: ${bookingDetails.startingLocation}
                Arrival Location: ${bookingDetails.arrivalLocation}
                Fragile: ${bookingDetails.fragile ? 'Yes' : 'No'}

                Thank you for choosing our service!

                Best regards,
                Centori Moving
            `
        };

        // Send the confirmation email
        await transporter.sendMail(mailOptions);

        // Send a success response back to the frontend
        res.status(200).json({ message: 'Booking created and email sent!' });
    } catch (error) {
        console.error('Error creating booking or sending email:', error);
        res.status(500).json({ error: 'Failed to create booking or send email.' });
    }
});

// Start the server on port 3000
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});