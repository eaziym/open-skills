const { sendEmail } = require('../config/email');

const sendAnEmail = async (req, res) => {
    try {
        await sendEmail('lilhorehimanshu@gmail.com', 'First email ever', 'This was the first email ever sent in my career through a nodejs program.');
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (err) {
        console.error('Error sending email:', err);
        res.status(500).json({ message: 'Failed to send email', error: err.message });
    }
};

module.exports = { sendAnEmail };
