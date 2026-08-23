const Vehicle = require('../models/Vehicle');

// @desc    Get all vehicles with optional filters
// @route   GET /api/vehicles
// @access  Public
const getVehicles = async (req, res) => {
  try {
    const { category, search, city, sort, minPrice, maxPrice } = req.query;

    let query = { isAvailable: true };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
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

    let sortOptions = { rating: -1 }; // Default highest rated
    if (sort === 'price-low') sortOptions = { dailyRate: 1 };
    if (sort === 'price-high') sortOptions = { dailyRate: -1 };
    if (sort === 'rating') sortOptions = { rating: -1 };

    const vehicles = await Vehicle.find(query).sort(sortOptions);

    res.json({
      success: true,
      count: vehicles.length,
      vehicles
    });
  } catch (error) {
    console.error('Get Vehicles Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single vehicle details
// @route   GET /api/vehicles/:id
// @access  Public
const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // Get similar vehicles in same category
    const similarVehicles = await Vehicle.find({
      category: vehicle.category,
      _id: { $ne: vehicle._id }
    }).limit(3);

    res.json({
      success: true,
      vehicle,
      similarVehicles
    });
  } catch (error) {
    console.error('Get Vehicle By ID Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get available vehicle categories & locations list
// @route   GET /api/vehicles/meta/options
// @access  Public
const getMetaData = async (req, res) => {
  try {
    const categories = ['All', 'Electric', 'Luxury SUV', 'Sports Bike', 'Supercar', 'Sedan', 'Convertible'];
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
  getMetaData
};
