import express from 'express';
import { openDb } from '../database.js';

const router = express.Router();

// Get all donors with optional filtering
router.get('/', async (req, res) => {
  try {
    const { blood_group, location } = req.query;
    const db = await openDb();

    let query = "SELECT id, name, age, gender, blood_group, phone, location, is_available, last_donated_date FROM users WHERE role = 'donor'";
    const params = [];

    if (blood_group) {
      query += " AND blood_group = ?";
      params.push(blood_group);
    }
    if (location) {
      query += " AND location LIKE ?";
      params.push(`%${location}%`);
    }

    const donors = await db.all(query, params);
    
    // Calculate Eligibility logic: 90 days cooldown
    const ninetyDays = 90 * 24 * 60 * 60 * 1000;
    const now = new Date().getTime();

    const donorsWithEligibility = donors.map(d => {
      let isEligible = true;
      if (d.last_donated_date) {
        // Parse SQLite date which might be "YYYY-MM-DD HH:MM:SS" back to timestamp
        const lastDonated = new Date(d.last_donated_date + "Z").getTime();
        // Fallback to standard parse if it's already an ISO string
        const parsedTime = isNaN(lastDonated) ? new Date(d.last_donated_date).getTime() : lastDonated;
        
        if (now - parsedTime < ninetyDays) {
          isEligible = false;
        }
      }
      return { ...d, is_eligible: isEligible && d.is_available === 1 };
    });

    res.json(donorsWithEligibility);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donors' });
  }
});

// Update donor availability
router.put('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_available } = req.body;
    const db = await openDb();

    await db.run('UPDATE users SET is_available = ? WHERE id = ? AND role = "donor"', [is_available ? 1 : 0, id]);
    
    res.json({ message: 'Availability updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating availability' });
  }
});

// Update donor profile
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, age, gender, blood_group, phone, location } = req.body;
    const db = await openDb();

    await db.run(
      'UPDATE users SET name = ?, age = ?, gender = ?, blood_group = ?, phone = ?, location = ? WHERE id = ?',
      [name, age, gender, blood_group, phone, location, id]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Mark donor as donated to trigger cooldown
router.post('/:id/donate', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await openDb();

    await db.run('UPDATE users SET last_donated_date = CURRENT_TIMESTAMP WHERE id = ? AND role = "donor"', [id]);
    
    res.json({ message: 'Donation recorded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking donation' });
  }
});

export default router;
