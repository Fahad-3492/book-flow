// Catches anything passed to next(err) from any controller.
// Keeps error responses consistent and avoids leaking stack traces in production.
function errorHandler(err, req, res, next) {
  console.error(err);

  // MySQL duplicate entry (e.g. race condition on unique email)
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'That record already exists.' });
  }

  const status = err.status || 500;
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'Something went wrong on our end.'
      : err.message || 'Internal server error.';

  res.status(status).json({ error: message });
}

function notFound(req, res) {
  res.status(404).json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
}

module.exports = { errorHandler, notFound };
