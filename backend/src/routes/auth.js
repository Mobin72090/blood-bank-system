import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { openDb } from '../database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { role, name, email, password, age, gender, blood_group, phone, location } = req.body;
    const db = await openDb();

    // Check if user exists
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(400).json({ message: 'User already exists with this email' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.run(
      `INSERT INTO users (role, name, email, password, age, gender, blood_group, phone, location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [role || 'donor', name, email, hashedPassword, age, gender, blood_group, phone, location]
    );

    res.status(201).json({ message: 'Registration successful', userId: result.lastID });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = await openDb();

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect password' });

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1d' });

    // Exclude password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({ token, user: userWithoutPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Get current user (Verify Token)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const db = await openDb();
    
    const user = await db.get('SELECT * FROM users WHERE id = ?', [decoded.id]);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;
