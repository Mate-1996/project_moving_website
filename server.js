// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const stripe = require('stripe')('sk_test_51QClMKG3xeoTL0dZatyJg9e2V9JeMjzMMipzRzo0yIPCFsriCHxLhRy2O06jNXcGIzrjQCWnnY4tRG5v0RR9W7ln00LwRjF6bo'); // Replace with your actual Stripe secret key

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Automatically parses JSON requests

// Payment endpoint
app.post('/api/payment', async (req, res) => {
    const { amount, paymentMethodId } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd', // Change currency as needed
            payment_method: paymentMethodId,
            confirm: true,
        });

        res.send({ success: true, paymentIntent });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Payment processing failed' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


