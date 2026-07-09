require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Book = require('./models/Book');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the public directory (for index.html, css, images)
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB (Serverless optimized)
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000 // 5 second timeout
    });
    console.log('✅ Connected to MongoDB');
    cachedDb = db;
    
    // Seed initial data if empty
    const count = await Book.countDocuments();
    if (count === 0) {
      console.log('Seeding initial books to MongoDB...');
      const initialBooks = [
        {id:1, title:"The Silent Orchard", author:"Meera Kapoor", category:"Fiction", copies:5, available:5},
        {id:2, title:"Letters from Monsoon", author:"Arjun Dev", category:"Fiction", copies:5, available:3},
        {id:3, title:"The Clockmaker's Daughter", author:"Elena Voss", category:"Fiction", copies:5, available:5},
        {id:4, title:"Paper Boats at Midnight", author:"Farah Iqbal", category:"Fiction", copies:5, available:0},
        {id:5, title:"The Last Lighthouse", author:"Tom Hardgrave", category:"Fiction", copies:5, available:4},
        {id:6, title:"A Brief History of Everything", author:"Dr. S. Rao", category:"Science", copies:5, available:5},
        {id:7, title:"The Quantum Garden", author:"Nina Petrov", category:"Science", copies:5, available:2},
        {id:8, title:"Wired for Wonder", author:"Kabir Malhotra", category:"Science", copies:5, available:5},
        {id:9, title:"Beneath the Microscope", author:"Grace Lin", category:"Science", copies:5, available:1},
        {id:10, title:"The Physics of Everyday Things", author:"J. Fernsby", category:"Science", copies:5, available:5},
        {id:11, title:"Empires of Sand", author:"Rahul Sen", category:"History", copies:5, available:5},
        {id:12, title:"The Forgotten Treaty", author:"Clara Winters", category:"History", copies:5, available:3},
        {id:13, title:"Voices of the Old City", author:"Imran Qureshi", category:"History", copies:5, available:0},
        {id:14, title:"Kings, Coins & Chronicles", author:"Alison Brook", category:"History", copies:5, available:5},
        {id:15, title:"The Long March Home", author:"Devika Nair", category:"History", copies:5, available:4},
        {id:16, title:"Code & Clay", author:"Wei Zhang", category:"Technology", copies:5, available:5},
        {id:17, title:"Machines That Dream", author:"Priya Menon", category:"Technology", copies:5, available:2},
        {id:18, title:"The Circuit Whisperer", author:"Oscar Bell", category:"Technology", copies:5, available:5},
        {id:19, title:"Silicon Roots", author:"Ananya Bose", category:"Technology", copies:5, available:0},
        {id:20, title:"Building Tomorrow, Byte by Byte", author:"Leo Fontaine", category:"Technology", copies:5, available:5},
        {id:21, title:"Ponniyin Selvan", author:"Kalki Krishnamurthy", category:"Tamil Stories", copies:5, available:5},
        {id:22, title:"Sivagamiyin Sabatham", author:"Kalki Krishnamurthy", category:"Tamil Stories", copies:5, available:3},
        {id:23, title:"Parthiban Kanavu", author:"Kalki Krishnamurthy", category:"Tamil Stories", copies:5, available:5},
        {id:24, title:"Kadal Pura", author:"Sandilyan", category:"Tamil Stories", copies:5, available:1},
        {id:25, title:"Velpari", author:"Su. Venkatesan", category:"Tamil Stories", copies:5, available:5}
      ];
      await Book.insertMany(initialBooks);
      console.log('✅ Seeding complete!');
    }
    return db;
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    throw err;
  }
}

// Middleware to ensure DB connection before handling requests
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    try {
      await connectToDatabase();
    } catch (err) {
      return res.status(500).json({ error: 'Database connection failed: ' + err.message });
    }
  }
  next();
});

// ================= AUTH ROUTES =================
const bcrypt = require('bcryptjs');
const User = require('./models/User');

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, isAdmin } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Default to 'user' role, but if they provide the secret key, make them 'admin'
    const role = (isAdmin === true) ? 'admin' : 'user';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({ username, password: hashedPassword, role });
    await user.save();
    
    res.status(201).json({ message: 'User created', role: user.role, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    
    res.json({ message: 'Login successful', role: user.role, username: user.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= BOOK API ROUTES =================

// GET all books
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find().sort({ id: 1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new book
app.post('/api/books', async (req, res) => {
  try {
    // Generate a new ID based on the highest existing ID
    const lastBook = await Book.findOne().sort({ id: -1 });
    const newId = lastBook ? lastBook.id + 1 : 1;
    
    const newBook = new Book({
      id: newId,
      ...req.body
    });
    
    await newBook.save();
    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT (update) a book
app.put('/api/books/:id', async (req, res) => {
  try {
    const updatedBook = await Book.findOneAndUpdate(
      { id: req.params.id }, 
      req.body, 
      { new: true }
    );
    if (!updatedBook) return res.status(404).json({ error: 'Book not found' });
    res.json(updatedBook);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a book
app.delete('/api/books/:id', async (req, res) => {
  try {
    const deletedBook = await Book.findOneAndDelete({ id: req.params.id });
    if (!deletedBook) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback for any other route (returns index.html)
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ================= START SERVER =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
