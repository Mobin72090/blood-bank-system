import express from 'express';
import { openDb } from '../database.js';

const router = express.Router();

// Get all requests
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const db = await openDb();
    
    let query = 'SELECT * FROM requests';
    const params = [];
    
    if (status) {
       query += ' WHERE status = ?';
       params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';

    const requests = await db.all(query, params);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

// Create a new emergency request
router.post('/', async (req, res) => {
  try {
    const { hospital_name, blood_group_needed, units_needed, urgency, location, contact_phone } = req.body;
    const db = await openDb();
    
    const result = await db.run(
      `INSERT INTO requests (hospital_name, blood_group_needed, units_needed, urgency, location, contact_phone, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [hospital_name, blood_group_needed, units_needed, urgency || 'Urgent', location, contact_phone]
    );

    res.status(201).json({ message: 'Request created successfully', id: result.lastID });
  } catch (error) {
    res.status(500).json({ message: 'Error creating request' });
  }
});

// Update request status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const db = await openDb();

    await db.run('UPDATE requests SET status = ? WHERE id = ?', [status, id]);
    
    res.json({ message: 'Request status updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating request status' });
  }
});

export default router;
