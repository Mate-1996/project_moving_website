
const express = require('express');
const Stripe = require('stripe'); 
const cors = require('cors'); 
const sgMail = require('@sendgrid/mail');


const stripe = Stripe(Stripe.apiKey = 'sk_test_51QClMKG3xeoTL0dZatyJg9e2V9JeMjzMMipzRzo0yIPCFsriCHxLhRy2O06jNXcGIzrjQCWnnY4tRG5v0RR9W7ln00LwRjF6bo');



sgMail.setApiKey('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');

const app = express();

app.use(cors({ origin: '*' })); 
app.use(express.json()); 


app.post('/create-checkout-session', async (req, res) => {
  const { amount } = req.body; // Retrieve amount from the request body

  try {
    // Create a new Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], 
      line_items: [
        {
          price_data: {
            currency: 'cad', 
            product_data: {
              name: 'Centori Moving Service Payment', 
            },
            unit_amount: amount, 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`, 
      cancel_url: `${req.headers.origin}/cancel`, 
    });

    // Return the session ID to the client
    res.json({ id: session.id });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});



//Email Receipt Endpoint
app.post('/send-receipt', async (req, res) => {
  const { email, bookingDetails } = req.body;

  if (!email || !bookingDetails) {
    return res.status(400).json({ error: 'Email and booking details are required.' });
  }

  try {
    const msg = {
      to: email,
      from: 'matechachkiani@gmail.com', // Use your verified sender email
      subject: 'Your Booking Receipt - Centori Moving',
      html: `
        <p>Thank you for your booking with Centori Moving!</p>
        <p>Here are your booking details:</p>
        <ul>
          <li><strong>Date:</strong> ${bookingDetails.date}</li>
          <li><strong>Furniture Amount:</strong> ${bookingDetails.furnitureAmount}</li>
          <li><strong>Distance:</strong> ${bookingDetails.distance} km</li>
          <li><strong>Starting Location:</strong> ${bookingDetails.startingLocation}</li>
          <li><strong>Arrival Location:</strong> ${bookingDetails.arrivalLocation}</li>
          <li><strong>Total Price:</strong> $${bookingDetails.price}</li>
        </ul>
      `,
    };

    await sgMail.send(msg);
    res.status(200).json({ message: 'Receipt sent successfully!' });
  } catch (error) {
    console.error('Error sending receipt:', error);
    res.status(500).json({ error: 'Failed to send receipt.' });
  }
});




const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
