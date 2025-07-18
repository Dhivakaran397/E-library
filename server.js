const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// --- IMPORTANT ---
// Replace the following with your actual MongoDB connection string.
// For local MongoDB, it's typically: 'mongodb://localhost:27017/bookvibe'
// For MongoDB Atlas, you'll get a connection string from your cluster dashboard.
const mongoURI = 'mongodb://localhost:27017/';

// Connect to MongoDB
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB Connected...');
}).catch(err => {
    console.error('Connection error', err.message);
});

// Create a schema for the contact form data. [3, 15, 16]
const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    subject: String,
    message: String,
    newsletter: Boolean,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Create a model from the schema. [3, 18]
const Contact = mongoose.model('Contact', contactSchema);

// --- API Routes ---

// @route   POST /api/contact
// @desc    Save contact form submission
// @access  Public
app.post('/api/contact', async (req, res) => {
    try {
        const newContact = new Contact({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            subject: req.body.subject,
            message: req.body.message,
            newsletter: req.body.newsletter
        });

        const savedContact = await newContact.save(); [8]
        res.status(201).json({
            message: 'Contact form submitted successfully!',
            data: savedContact
        });

    } catch (error) {
        console.error('Error saving contact form data:', error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));