const express = require('express');
const router = express.Router();
const { getVehicles, getVehicleById, getMetaData } = require('../controllers/vehicleController');

router.get('/', getVehicles);
router.get('/meta/options', getMetaData);
router.get('/:id', getVehicleById);

module.exports = router;
