const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['EV', 'Electric', 'Luxury SUV', 'SUV', 'Sedan', 'Hatchback', 'Sports Bike', 'Supercar', 'Convertible'],
    required: true
  },
  vehicleType: {
    type: String,
    enum: ['EV', 'SUV', 'Sedan', 'Hatchback', 'Supercar', 'Sports Bike', 'Convertible'],
    default: 'EV'
  },
  image: {
    type: String,
    required: true
  },
  gallery: [{
    type: String
  }],
  dailyRate: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  transmission: {
    type: String,
    enum: ['Automatic', 'Manual', 'Direct Drive'],
    default: 'Automatic'
  },
  seating: {
    type: Number,
    required: true
  },
  fuelType: {
    type: String,
    enum: ['Electric', 'Petrol', 'Hybrid', 'Diesel'],
    default: 'Petrol'
  },
  horsepower: {
    type: Number,
    default: 300
  },
  zeroToSixty: {
    type: String,
    default: '4.0s'
  },
  topSpeed: {
    type: String,
    default: '150 mph'
  },
  // Provider Owner Link
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Vehicle Official Documentation (Full records stored privately)
  engineNumber: {
    type: String,
    required: [true, 'Engine Number is required']
  },
  chassisNumber: {
    type: String,
    required: [true, 'Chassis Number is required']
  },
  rcBookNumber: {
    type: String,
    required: [true, 'RC Book Number is required']
  },
  odometerReading: {
    type: Number,
    default: 15000 // Kilometers driven
  },
  status: {
    type: String,
    enum: ['Available', 'Rented', 'Maintenance'],
    default: 'Available'
  },
  rating: {
    type: Number,
    default: 4.9
  },
  reviewsCount: {
    type: Number,
    default: 18
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  features: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Security & Privacy Helper: Mask details to last 4 digits
vehicleSchema.methods.toMaskedJSON = function () {
  const obj = this.toObject();
  
  const mask = (str) => {
    if (!str) return '••••••••';
    const clean = str.trim();
    if (clean.length <= 4) return clean;
    return '••••••••' + clean.slice(-4);
  };

  obj.maskedEngineNumber = mask(obj.engineNumber);
  obj.maskedChassisNumber = mask(obj.chassisNumber);
  obj.maskedRcNumber = mask(obj.rcBookNumber);

  // Remove full sensitive numbers from customer payloads
  delete obj.engineNumber;
  delete obj.chassisNumber;
  delete obj.rcBookNumber;

  return obj;
};

module.exports = mongoose.model('Vehicle', vehicleSchema);
