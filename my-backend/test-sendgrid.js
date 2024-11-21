const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');

const msg = {
  to: 'matechachkiani@gmail.com', // Replace with your email
  from: 'matechachkiani@gmail.com', // Replace with your verified sender email
  subject: 'Test Email',
  text: 'This is a test email from SendGrid.',
};

sgMail.send(msg)
  .then(() => {
    console.log('Test email sent successfully!');
  })
  .catch((error) => {
    console.error('Error sending test email:', error.response.body);
  });