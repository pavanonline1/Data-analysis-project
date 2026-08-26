const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const tourRoutes = require('./routes/tourRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const faqRoutes = require('./routes/faqRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const statsRoutes = require('./routes/statsRoutes');
const contactRoutes = require('./routes/contactRoutes');
const searchRoutes = require('./routes/searchRoutes');
const authRoutes = require('./routes/authRoutes');
const heroRoutes = require('./routes/heroRoutes');

const app = express();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());


// Routes
app.use('/api/tours', tourRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/contacts', contactRoutes);  // alias to match frontend expectation
app.use('/api/search', searchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/hero', heroRoutes);


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date() });
});

// Error handling
app.use(errorHandler);

module.exports = app;
