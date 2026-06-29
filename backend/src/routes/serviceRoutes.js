const express = require('express');
const { listServices, getService } = require('../controllers/serviceController');

const router = express.Router();

// Public — anyone can browse services, no login required.
router.get('/', listServices);
router.get('/:id', getService);

module.exports = router;
