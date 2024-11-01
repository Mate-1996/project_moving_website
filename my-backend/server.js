// Import required modules
const express = require('express');
const Stripe = require('stripe'); // Import Stripe for payment processing
const cors = require('cors'); // Import CORS to allow cross-origin requests

// Configure Stripe
Stripe.apiKey = 'sk_test_51QClMKG3xeoTL0dZatyJg9e2V9JeMjzMMipzRzo0yIPCFsriCHxLhRy2O06jNXcGIzrjQCWnnY4tRG5v0RR9W7ln00LwRjF6bo';



// Initialize the Express app
const app = express();

// Middleware
app.use(cors({ origin: '*' })); // Allow all origins
app.use(express.json()); // Parse incoming JSON request bodies

// Initialize Stripe with your secret key
// Replace with your actual secret key from the Stripe dashboard
const stripe = Stripe('sk_test_51QClMKG3xeoTL0dZatyJg9e2V9JeMjzMMipzRzo0yIPCFsriCHxLhRy2O06jNXcGIzrjQCWnnY4tRG5v0RR9W7ln00LwRjF6bo');

// Basic route to test the server
app.get('/', (req, res) => {
  res.send('Hello, welcome to the backend server!');
});

// Route to fetch bookings by user ID
app.get('/api/bookings/:userId', (req, res) => {
  const { userId } = req.params;
  // In a real application, you would fetch bookings from a database
  // For demonstration, let's assume some hardcoded data
  const sampleBookings = [
    {
      id: 1,
      date: '2024-11-10',
      furnitureAmount: 20,
      distance: 10,
      startingLocation: '123 Start St',
      arrivalLocation: '456 End Ave',
      fragile: true,
    },
    {
      id: 2,
      date: '2024-12-05',
      furnitureAmount: 30,
      distance: 5,
      startingLocation: '789 Start Blvd',
      arrivalLocation: '1011 End St',
      fragile: false,
    },
  ];
  // Respond with JSON data
  res.json(sampleBookings); // Replace with your actual database fetch
});

// Create a POST route for creating a Stripe Checkout session
app.post('/create-checkout-session', async (req, res) => {
  const { amount } = req.body; // Retrieve amount from the request body

  try {
    // Create a new Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // Only accept card payments
      line_items: [
        {
          price_data: {
            currency: 'usd', // Currency type
            product_data: {
              name: 'Centori Moving Service Payment', // Name of the product/service
            },
            unit_amount: amount, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`, // Redirect URL for successful payment
      cancel_url: `${req.headers.origin}/cancel`, // Redirect URL for canceled payment
    });

    // Return the session ID to the client
    res.json({ id: session.id });
  } catch (error) {
    // Handle errors gracefully
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Define a port to listen to
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
