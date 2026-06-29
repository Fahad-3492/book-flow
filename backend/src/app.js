const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/index');
const { handleWebhook } = require('./controllers/paymentController');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Only allow requests from the configured frontend origin, not any website.
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Stripe webhook MUST be registered before express.json(). Stripe signs the
// raw request bytes, so by the time express.json() has parsed and
// re-serialized the body, the signature no longer matches and verification
// fails. express.raw() here preserves the exact bytes Stripe signed.
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleWebhook);

app.use(express.json());

// Simple liveness check — useful for deployment platforms (Railway) and
// for confirming the API is reachable before wiring up the frontend.
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
