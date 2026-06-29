const {
  findActiveServices,
  findAllServices,
  findServiceById,
  createService,
  updateService,
  deactivateService,
} = require('../models/serviceModel');

// GET /api/services  (public — only active services)
async function listServices(req, res, next) {
  try {
    const services = await findActiveServices();
    res.json({ services });
  } catch (err) {
    next(err);
  }
}

// GET /api/services/:id  (public — single service detail page)
async function getService(req, res, next) {
  try {
    const service = await findServiceById(req.params.id);
    if (!service || !service.is_active) {
      return res.status(404).json({ error: 'Service not found.' });
    }
    res.json({ service });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/services  (admin — includes inactive services)
async function listAllServicesAdmin(req, res, next) {
  try {
    const services = await findAllServices();
    res.json({ services });
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/services  (admin only)
async function createServiceAdmin(req, res, next) {
  try {
    const { name, description, price, durationMinutes } = req.body;
    const service = await createService({
      name,
      description,
      price,
      durationMinutes,
    });
    res.status(201).json({ service });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/services/:id  (admin only)
async function updateServiceAdmin(req, res, next) {
  try {
    const existing = await findServiceById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    // Map camelCase API fields to snake_case DB columns.
    const fields = {};
    if (req.body.name !== undefined) fields.name = req.body.name;
    if (req.body.description !== undefined) fields.description = req.body.description;
    if (req.body.price !== undefined) fields.price = req.body.price;
    if (req.body.durationMinutes !== undefined) fields.duration_minutes = req.body.durationMinutes;
    if (req.body.isActive !== undefined) fields.is_active = req.body.isActive;

    const service = await updateService(req.params.id, fields);
    res.json({ service });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/services/:id  (admin only — soft delete)
async function deleteServiceAdmin(req, res, next) {
  try {
    const existing = await findServiceById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Service not found.' });
    }
    const service = await deactivateService(req.params.id);
    res.json({ service, message: 'Service deactivated.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listServices,
  getService,
  listAllServicesAdmin,
  createServiceAdmin,
  updateServiceAdmin,
  deleteServiceAdmin,
};
