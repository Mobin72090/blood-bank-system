import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';

// Open a database connection
export async function openDb() {
  return open({
    filename: process.env.DB_PATH || './database.db',
    driver: sqlite3.Database
  });
}

// Initialize database schema
export async function setupDb() {
  const db = await openDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL, -- 'donor' or 'admin'
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      blood_group TEXT,
      phone TEXT,
      location TEXT,
      is_available BOOLEAN DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS inventory (
      blood_group TEXT PRIMARY KEY,
      units_available INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hospital_name TEXT NOT NULL,
      blood_group_needed TEXT NOT NULL,
      units_needed INTEGER NOT NULL,
      urgency TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
      location TEXT NOT NULL,
      status TEXT DEFAULT 'active', -- 'active', 'fulfilled', 'cancelled'
      contact_phone TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Apply Database Migrations for V2 smoothly
  try {
    await db.run('ALTER TABLE users ADD COLUMN last_donated_date DATETIME');
  } catch (err) {}
  
  try {
    await db.run("UPDATE requests SET status = 'Pending' WHERE status = 'active'");
    await db.run("UPDATE requests SET status = 'Fulfilled' WHERE status = 'fulfilled'");
  } catch (err) {}

  // Seed inventory if empty
  const inventoryCount = await db.get('SELECT COUNT(*) as count FROM inventory');
  if (inventoryCount.count === 0) {
    const defaultGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    for (const group of defaultGroups) {
      // Random units between 5 and 50 for realistic demo
      const units = Math.floor(Math.random() * 45) + 5;
      await db.run('INSERT INTO inventory (blood_group, units_available) VALUES (?, ?)', [group, units]);
    }
  }

  // Seed an admin user if not exists
  const adminQuery = await db.get('SELECT * FROM users WHERE email = ?', ['admin@hospital.com']);
  if (!adminQuery) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.run(
      `INSERT INTO users (role, name, email, password, phone, location) 
       VALUES ('admin', 'Central Hospital Admin', 'admin@hospital.com', ?, '1234567890', 'Central City')`,
      [hashedPassword]
    );
  }

  // Seed some donors if empty
  const donorCount = await db.get('SELECT COUNT(*) as count FROM users WHERE role = ?', ['donor']);
  if (donorCount.count === 0) {
    const sampleDonors = [
      { name: 'John Doe', email: 'john@example.com', pass: 'password123', age: 28, gender: 'Male', bg: 'O+', phone: '555-0101', loc: 'North District' },
      { name: 'Jane Smith', email: 'jane@example.com', pass: 'password123', age: 34, gender: 'Female', bg: 'A-', phone: '555-0102', loc: 'South District' },
      { name: 'Alex Johnson', email: 'alex@example.com', pass: 'password123', age: 41, gender: 'Male', bg: 'B+', phone: '555-0103', loc: 'East District' },
      { name: 'Maria Garcia', email: 'maria@example.com', pass: 'password123', age: 25, gender: 'Female', bg: 'AB+', phone: '555-0104', loc: 'West District' },
      { name: 'David Lee', email: 'david@example.com', pass: 'password123', age: 30, gender: 'Male', bg: 'O-', phone: '555-0105', loc: 'Central City' }
    ];

    for (const d of sampleDonors) {
      const hp = await bcrypt.hash(d.pass, 10);
      await db.run(
        'INSERT INTO users (role, name, email, password, age, gender, blood_group, phone, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['donor', d.name, d.email, hp, d.age, d.gender, d.bg, d.phone, d.loc]
      );
    }
  }

  // Seed some active requests if empty
  const requestCount = await db.get('SELECT COUNT(*) as count FROM requests');
  if (requestCount.count === 0) {
    await db.run(
      'INSERT INTO requests (hospital_name, blood_group_needed, units_needed, urgency, location, contact_phone, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['City General Hospital', 'O-', 3, 'Critical', 'Central City', '555-9001', 'Pending']
    );
    await db.run(
      'INSERT INTO requests (hospital_name, blood_group_needed, units_needed, urgency, location, contact_phone, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['Northside Clinic', 'AB+', 1, 'Urgent', 'North District', '555-9002', 'Pending']
    );
  }

  console.log("Database setup complete.");
}
