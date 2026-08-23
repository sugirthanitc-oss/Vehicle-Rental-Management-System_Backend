const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const Vehicle = require('./models/Vehicle');
const User = require('./models/User');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'DrivePulse Vehicle Rental REST API',
    timestamp: new Date()
  });
});

// Seed helper auto-checker
const autoSeed = async () => {
  try {
    const vehicleCount = await Vehicle.countDocuments();
    if (vehicleCount === 0) {
      console.log('⚡ Initializing database with seed data...');
      const demoUser = await User.create({
        name: 'Alex Vance Major',
        email: 'user@drivepulse.com',
        password: 'password123',
        phone: '+1 (555) 890-2143',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        role: 'user'
      });

      await Vehicle.insertMany([
        {
          title: 'Tesla Model S Plaid (2025)',
          brand: 'Tesla',
          category: 'Electric',
          image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000',
          gallery: [
            'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000',
            'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1000'
          ],
          dailyRate: 189,
          location: 'Downtown Silicon Hub, SF',
          city: 'San Francisco',
          transmission: 'Direct Drive',
          seating: 5,
          fuelType: 'Electric',
          horsepower: 1020,
          zeroToSixty: '1.99s',
          topSpeed: '200 mph',
          rating: 4.98,
          reviewsCount: 42,
          isAvailable: true,
          isFeatured: true,
          features: ['Autopilot FSD', 'Tri-Motor AWD', 'Yoke Steering', '22-Speaker Audio']
        },
        {
          title: 'Porsche 911 GT3 RS',
          brand: 'Porsche',
          category: 'Supercar',
          image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1000',
          gallery: [
            'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1000'
          ],
          dailyRate: 349,
          location: 'Beverly Hills Boulevard, LA',
          city: 'Los Angeles',
          transmission: 'Automatic',
          seating: 2,
          fuelType: 'Petrol',
          horsepower: 518,
          zeroToSixty: '3.0s',
          topSpeed: '184 mph',
          rating: 4.99,
          reviewsCount: 38,
          isAvailable: true,
          isFeatured: true,
          features: ['DRS Active Aero', 'Carbon Ceramic Brakes', 'PDK 7-Speed']
        },
        {
          title: 'Range Rover Autobiography LWB',
          brand: 'Land Rover',
          category: 'Luxury SUV',
          image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=1000',
          dailyRate: 249,
          location: 'Midtown Manhattan, NYC',
          city: 'New York',
          transmission: 'Automatic',
          seating: 5,
          fuelType: 'Hybrid',
          horsepower: 523,
          zeroToSixty: '4.4s',
          topSpeed: '155 mph',
          rating: 4.95,
          reviewsCount: 29,
          isAvailable: true,
          isFeatured: true,
          features: ['Executive Class Seats', 'Meridian Sound', 'All-Wheel Steering']
        },
        {
          title: 'Ducati Panigale V4 S',
          brand: 'Ducati',
          category: 'Sports Bike',
          image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1000',
          dailyRate: 145,
          location: 'Ocean Drive, Miami Beach',
          city: 'Miami',
          transmission: 'Manual',
          seating: 1,
          fuelType: 'Petrol',
          horsepower: 215,
          zeroToSixty: '2.7s',
          topSpeed: '186 mph',
          rating: 4.97,
          reviewsCount: 19,
          isAvailable: true,
          isFeatured: false,
          features: ['Öhlins Suspension', 'Akrapovič Exhaust', 'Cornering ABS']
        },
        {
          title: 'BMW M4 Competition xDrive',
          brand: 'BMW',
          category: 'Sedan',
          image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=1000',
          dailyRate: 175,
          location: 'Downtown Chicago, IL',
          city: 'Chicago',
          transmission: 'Automatic',
          seating: 4,
          fuelType: 'Petrol',
          horsepower: 503,
          zeroToSixty: '3.4s',
          topSpeed: '180 mph',
          rating: 4.92,
          reviewsCount: 31,
          isAvailable: true,
          isFeatured: false,
          features: ['Carbon Bucket Seats', 'Harmon Kardon Audio', 'Heads-Up Display']
        },
        {
          title: 'Lucid Air Sapphire Edition',
          brand: 'Lucid',
          category: 'Electric',
          image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1000',
          dailyRate: 279,
          location: 'Silicon Valley South, San Jose',
          city: 'San Francisco',
          transmission: 'Direct Drive',
          seating: 5,
          fuelType: 'Electric',
          horsepower: 1234,
          zeroToSixty: '1.89s',
          topSpeed: '205 mph',
          rating: 4.99,
          reviewsCount: 15,
          isAvailable: true,
          isFeatured: true,
          features: ['Torque Vectoring Tri-Motor', 'Massage Seats', 'Glass Canopy Roof']
        }
      ]);
      console.log('✅ Auto-seed completed!');
    }
  } catch (err) {
    console.error('Auto seed warning:', err.message);
  }
};

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  autoSeed();
  app.listen(PORT, () => {
    console.log(`🌐 Server running on http://localhost:${PORT}`);
  });
});
