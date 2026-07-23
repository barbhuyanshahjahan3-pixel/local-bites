const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = (process.env.CLIENT_URLS || '').split(',').map((s) => s.trim());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '5mb' })); // generous limit to allow base64 image payloads
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(
  '/api/',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 500, standardHeaders: true, legacyHeaders: false })
);

app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok' }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));
app.use('/api/customer', require('./routes/customerRoutes'));
app.use('/api/restaurant', require('./routes/restaurantRoutes'));
app.use('/api/delivery', require('./routes/deliveryRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/superadmin', require('./routes/superAdminRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
