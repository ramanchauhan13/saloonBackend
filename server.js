import express from 'express';
import connectDB from './config/db.js';
import cors from 'cors';
import 'dotenv/config';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import salonAdminRoutes from './routes/salonAdminRoutes.js';
import superAdminRoutes from './routes/superAdminRoutes.js';
import userRoutes from './routes/userRoutes.js';


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.error('Error connecting to the database:', error);
    process.exit(1);
});

// Default Route
app.get('/', (req, res) => {
    res.send('Hello From Server');
});

// Route Usage
app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/salon-admin', salonAdminRoutes);
app.use('/api/user', userRoutes);

app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});
