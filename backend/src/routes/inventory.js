import express from 'express';
import { openDb } from '../database.js';

const router = express.Router();

// Get all inventory stock
router.get('/', async (req, res) => {
  try {
    const db = await openDb();
    const inventory = await db.all('SELECT * FROM inventory');
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching inventory' });
  }
});

// Update inventory for a blood group
router.put('/:bloodGroup', async (req, res) => {
  try {
    const { bloodGroup } = req.params;
    const { units, operation } = req.body; // operation: 'add' or 'subtract'
    
    // Ensure properly formatted e.g. AB+ not AB
    const formattedGroup = decodeURIComponent(bloodGroup);

    const db = await openDb();
    
    const stock = await db.get('SELECT * FROM inventory WHERE blood_group = ?', [formattedGroup]);
    
    if (!stock) {
      if (operation === 'add') {
         await db.run('INSERT INTO inventory (blood_group, units_available) VALUES (?, ?)', [formattedGroup, units]);
         return res.json({ message: 'Inventory added' });
      }
      return res.status(404).json({ message: 'Blood group not found in inventory' });
    }

    let newUnits = stock.units_available;
    if (operation === 'add') newUnits += parseInt(units);
    if (operation === 'subtract') newUnits -= parseInt(units);
    
    if (newUnits < 0) newUnits = 0;

    await db.run('UPDATE inventory SET units_available = ? WHERE blood_group = ?', [newUnits, formattedGroup]);
    
    res.json({ message: 'Inventory updated successfully', newUnits });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating inventory' });
  }
});

export default router;
