const express = require('express');
const Stripe = require('stripe');
const cors = require('cors');

const app = express();
const stripe = Stripe('sk_test_51QClMKG3xeoTL0dZatyJg9e2V9JeMjzMMipzRzo0yIPCFsriCHxLhRy2O06jNXcGIzrjQCWnnY4tRG5v0RR9W7ln00LwRjF6bo'); // Replace with your Stripe secret key

app.use(cors());
app.use(express.json());

// Route to create a Payment Intent
app.post('/api/payment', async (req, res) => {
  try {
    const { amount, paymentMethodId } = req.body;

    // Create a PaymentIntent with the provided amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // amount in cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
    });

    // Send the client secret for confirmation
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




