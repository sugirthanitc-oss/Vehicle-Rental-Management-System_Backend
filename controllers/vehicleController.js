const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

// @desc    Get all vehicles with privacy-masked credentials for customers
// @route   GET /api/vehicles
// @access  Public
const getVehicles = async (req, res) => {
  try {
    const { category, search, city, sort, minPrice, maxPrice, fromLocation, toLocation } = req.query;

    let query = { isAvailable: true };

    if (category && category !== 'All') {
      query.$or = [
        { category: category },
        { vehicleType: category }
      ];
    }

    const searchKeyword = search || fromLocation || toLocation;
    if (searchKeyword) {
      query.$or = [
        { title: { $regex: searchKeyword, $options: 'i' } },
        { brand: { $regex: searchKeyword, $options: 'i' } },
        { location: { $regex: searchKeyword, $options: 'i' } },
        { city: { $regex: searchKeyword, $options: 'i' } }
      ];
    }

    if (city && city !== 'All Locations') {
      query.city = city;
    }

    if (minPrice || maxPrice) {
      query.dailyRate = {};
      if (minPrice) query.dailyRate.$gte = Number(minPrice);
      if (maxPrice) query.dailyRate.$lte = Number(maxPrice);
    }

    let sortOptions = { rating: -1 };
    if (sort === 'price-low') sortOptions = { dailyRate: 1 };
    if (sort === 'price-high') sortOptions = { dailyRate: -1 };
    if (sort === 'rating') sortOptions = { rating: -1 };

    const vehicles = await Vehicle.find(query).sort(sortOptions);

    // Apply security privacy masking (showing only last 4 digits of Engine, Chassis, RC Book)
    const maskedVehicles = vehicles.map(v => v.toMaskedJSON());

    res.json({
      success: true,
      count: maskedVehicles.length,
      vehicles: maskedVehicles
    });
  } catch (error) {
    console.error('Get Vehicles Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single vehicle details with privacy-masked credentials
// @route   GET /api/vehicles/:id
// @access  Public
const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const maskedVehicle = vehicle.toMaskedJSON();

    res.json({
      success: true,
      vehicle: maskedVehicle
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Provider's own registered fleet & Live Status metrics
// @route   GET /api/vehicles/provider-fleet
// @access  Private (Provider)
const getProviderFleet = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ provider: req.user._id }).sort({ createdAt: -1 });

    const totalFleet = vehicles.length;
    const availableInGarage = vehicles.filter(v => v.status === 'Available').length;
    const outOnRent = vehicles.filter(v => v.status === 'Rented').length;

    res.json({
      success: true,
      metrics: {
        totalFleet,
        availableInGarage,
        outOnRent
      },
      vehicles
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Provider Register New Vehicle (with Engine, Chassis, RC, Odometer)
// @route   POST /api/vehicles/register
// @access  Private (Provider)
const registerVehicle = async (req, res) => {
  try {
    const {
      title,
      brand,
      category,
      vehicleType,
      image,
      dailyRate,
      location,
      city,
      transmission,
      seating,
      fuelType,
      engineNumber,
      chassisNumber,
      rcBookNumber,
      odometerReading,
      features
    } = req.body;

    if (!title || !brand || !engineNumber || !chassisNumber || !rcBookNumber || !dailyRate) {
      return res.status(400).json({
        success: false,
        message: 'Title, Brand, Engine Number, Chassis Number, RC Book Number, and Daily Rate are mandatory'
      });
    }

    const vehicle = await Vehicle.create({
      provider: req.user._id,
      title,
      brand,
      category: category || 'EV',
      vehicleType: vehicleType || category || 'EV',
      image: image || 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000',
      dailyRate: Number(dailyRate),
      location: location || 'Central Garage Hub',
      city: city || 'San Francisco',
      transmission: transmission || 'Automatic',
      seating: Number(seating) || 5,
      fuelType: fuelType || 'Electric',
      engineNumber: engineNumber.trim(),
      chassisNumber: chassisNumber.trim(),
      rcBookNumber: rcBookNumber.trim(),
      odometerReading: Number(odometerReading) || 12000,
      status: 'Available',
      isAvailable: true,
      features: features || ['GPS Live Tracking', 'Full AC', 'Cleaned & Sanitized']
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle registered successfully in your fleet!',
      vehicle
    });
  } catch (error) {
    console.error('Register Vehicle Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get metadata options
// @route   GET /api/vehicles/meta/options
// @access  Public
const getMetaData = async (req, res) => {
  try {
    const categories = ['All', 'EV', 'SUV', 'Sedan', 'Hatchback', 'Supercar', 'Sports Bike', 'Convertible'];
    const cities = await Vehicle.distinct('city');
    
    res.json({
      success: true,
      categories,
      cities: ['All Locations', ...cities]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
  getProviderFleet,
  registerVehicle,
  getMetaData
};
