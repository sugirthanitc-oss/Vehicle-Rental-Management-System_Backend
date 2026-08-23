const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Booking = require('../models/Booking');

const seedData = async () => {
  try {
    await connectDB();

    console.log('🧹 Purging existing collection data...');
    await User.deleteMany();
    await Vehicle.deleteMany();
    await Booking.deleteMany();

    console.log('👤 Seeding default demo user account...');
    const demoUser = await User.create({
      name: 'Alex Vance Major',
      email: 'user@drivepulse.com',
      password: 'password123',
      phone: '+1 (555) 890-2143',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
      role: 'user'
    });

    console.log('🚗 Seeding premium startup fleet database...');
    const vehiclesData = [
      {
        title: 'Tesla Model S Plaid (2025)',
        brand: 'Tesla',
        category: 'Electric',
        image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000',
        gallery: [
          'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1536700503339-1e4b06520771?auto=format&fit=crop&q=80&w=1000'
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
        features: ['Autopilot FSD', 'Tri-Motor AWD', 'Yoke Steering', '22-Speaker Audio', 'Gaming Rig Screen'],
        host: {
          name: 'HyperDrive Mobility',
          phone: '+1 (415) 880-9911',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
          rating: 4.99
        }
      },
      {
        title: 'Porsche 911 GT3 RS',
        brand: 'Porsche',
        category: 'Supercar',
        image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1000',
        gallery: [
          'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000'
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
        features: ['DRS Active Aero', 'Carbon Ceramic Brakes', 'PDK 7-Speed', 'Weissach Package', 'Telemetry Logger'],
        host: {
          name: 'Apex Luxury Rentals',
          phone: '+1 (310) 555-0128',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
          rating: 4.98
        }
      },
      {
        title: 'Range Rover Autobiography LWB',
        brand: 'Land Rover',
        category: 'Luxury SUV',
        image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=1000',
        gallery: [
          'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1000'
        ],
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
        features: ['Executive Class Rear Seats', 'Meridian Signature Sound', 'All-Wheel Steering', 'Air Suspension'],
        host: {
          name: 'Empire Prestige Cars',
          phone: '+1 (212) 555-9011',
          avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200',
          rating: 4.92
        }
      },
      {
        title: 'Ducati Panigale V4 S',
        brand: 'Ducati',
        category: 'Sports Bike',
        image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1000',
        gallery: [
          'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=1000'
        ],
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
        features: ['Öhlins Electronic Suspension', 'Akrapovič Titanium Exhaust', 'Cornering ABS EVO', 'Quickshifter'],
        host: {
          name: 'Velocity Moto Vault',
          phone: '+1 (305) 443-8090',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
          rating: 5.0
        }
      },
      {
        title: 'BMW M4 Competition xDrive',
        brand: 'BMW',
        category: 'Sedan',
        image: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=1000',
        gallery: [
          'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=1000'
        ],
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
        features: ['M Carbon Bucket Seats', 'Harmon Kardon Audio', 'Heads-Up Display', 'M Drift Analyzer'],
        host: {
          name: 'Windy City Exotics',
          phone: '+1 (312) 789-0123',
          avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
          rating: 4.94
        }
      },
      {
        title: 'Lucid Air Sapphire Edition',
        brand: 'Lucid',
        category: 'Electric',
        image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1000',
        gallery: [
          'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1000'
        ],
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
        features: ['Torque Vectoring Tri-Motor', 'Massage Executive Seats', 'Glass Canopy Roof', '34-Inch Curved Display'],
        host: {
          name: 'Silicon EV Fleet',
          phone: '+1 (408) 555-7722',
          avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200',
          rating: 4.97
        }
      },
      {
        title: 'Mercedes-AMG G63 Edition 55',
        brand: 'Mercedes-Benz',
        category: 'Luxury SUV',
        image: 'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&q=80&w=1000',
        gallery: [
          'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?auto=format&fit=crop&q=80&w=1000'
        ],
        dailyRate: 310,
        location: 'Beverly Hills, LA',
        city: 'Los Angeles',
        transmission: 'Automatic',
        seating: 5,
        fuelType: 'Petrol',
        horsepower: 577,
        zeroToSixty: '4.5s',
        topSpeed: '149 mph',
        rating: 4.96,
        reviewsCount: 50,
        isAvailable: true,
        isFeatured: false,
        features: ['Burmester 3D Surround', 'AMG Performance Exhaust', 'Designo Nappa Leather', '3 Lockable Differentials'],
        host: {
          name: 'Apex Luxury Rentals',
          phone: '+1 (310) 555-0128',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
          rating: 4.98
        }
      },
      {
        title: 'Ford Mustang Shelby GT500',
        brand: 'Ford',
        category: 'Convertible',
        image: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&q=80&w=1000',
        gallery: [
          'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&q=80&w=1000'
        ],
        dailyRate: 159,
        location: 'Downtown Austin, TX',
        city: 'Austin',
        transmission: 'Automatic',
        seating: 4,
        fuelType: 'Petrol',
        horsepower: 760,
        zeroToSixty: '3.3s',
        topSpeed: '180 mph',
        rating: 4.88,
        reviewsCount: 22,
        isAvailable: true,
        isFeatured: false,
        features: ['TREMEC 7-Speed Dual Clutch', 'Carbon Fiber Track Pack', 'Launch Control', 'Brembo Brakes'],
        host: {
          name: 'Lone Star Performance',
          phone: '+1 (512) 890-4411',
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
          rating: 4.89
        }
      }
    ];

    const seededVehicles = await Vehicle.insertMany(vehiclesData);

    console.log('📌 Creating sample initial booking record for demo user...');
    await Booking.create({
      user: demoUser._id,
      vehicle: seededVehicles[0]._id,
      startDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
      endDate: new Date(Date.now() + 86400000 * 5),   // 5 days from now
      totalDays: 3,
      dailyRate: seededVehicles[0].dailyRate,
      subtotal: seededVehicles[0].dailyRate * 3,
      serviceFee: 45,
      insuranceFee: 75,
      totalPrice: seededVehicles[0].dailyRate * 3 + 45 + 75,
      pickupLocation: seededVehicles[0].location,
      status: 'Confirmed',
      paymentStatus: 'Paid',
      paymentMethod: 'Credit Card (Visa ending 4242)'
    });

    console.log('🎉 Seed completed successfully!');
    console.log('🔑 Demo User Login: user@drivepulse.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
