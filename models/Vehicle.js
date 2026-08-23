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
    enum: ['Electric', 'Luxury SUV', 'Sports Bike', 'Supercar', 'Sedan', 'Convertible'],
    required: true
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
    required: true
  },
  zeroToSixty: {
    type: String,
    default: '3.5s'
  },
  topSpeed: {
    type: String,
    default: '155 mph'
  },
  rating: {
    type: Number,
    default: 4.9
  },
  reviewsCount: {
    type: Number,
    default: 24
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  features: [{
    type: String
  }],
  host: {
    name: { type: String, default: 'DrivePulse Premier Fleet' },
    phone: { type: String, default: '+1 (800) 555-0199' },
    avatar: { type: String, default: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200' },
    rating: { type: Number, default: 4.95 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
