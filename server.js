require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const userRoutes = require('./routes/userRoutes');
const roleRoutes = require('./routes/roleRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'User & Role Management API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      roles: '/api/roles'
    }
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Có lỗi xảy ra trên server',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint không tồn tại'
  });
});

app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}`);
});