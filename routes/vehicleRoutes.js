const express = require('express');
const router = express.Router();
const { getVehicles, getVehicleById, getProviderFleet, registerVehicle, getMetaData } = require('../controllers/vehicleController');
const { protect } = require('../middleware/auth');

router.get('/', getVehicles);
router.get('/meta/options', getMetaData);
router.get('/provider-fleet', protect, getProviderFleet);
router.post('/register', protect, registerVehicle);
router.get('/:id', getVehicleById);

module.exports = router;
