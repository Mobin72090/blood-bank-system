import express from 'express';
import cors from 'cors';
import { setupDb } from './src/database.js';

import authRoutes from './src/routes/auth.js';
import donorRoutes from './src/routes/donors.js';
import inventoryRoutes from './src/routes/inventory.js';
import requestRoutes from './src/routes/requests.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/requests', requestRoutes);

// Database initialization & Server start
setupDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("Failed to set up database:", err);
});
