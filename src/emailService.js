import emailjs from '@emailjs/browser';
import axios from 'axios';


export const fetchUserEmail = async (userId) => {
    try {
        const response = await axios.post('http://localhost:5000/get-user-email', { userId });
        return response.data.email; // Extract email from the response
    } catch (error) {
        console.error('Error fetching user email:', error);
        return null;
    }
};


export const sendReceiptEmail = async (email, receiptDetails) => {
    try {
        const templateParams = {
            user_email: email, // Recipient's email
            receipt_details: receiptDetails, // Receipt details
        };

        await emailjs.send(
            'service_n5krcvb', 
            'template_84p3irb', 
            templateParams,
            'HSyq4TN_VEpefRQ3W' 
        );

        console.log('Receipt email sent successfully!');
        alert('Receipt sent to the user.');
    } catch (error) {
        console.error('Error sending receipt email:', error);
        alert('Failed to send receipt. Please try again.');
    }
};
