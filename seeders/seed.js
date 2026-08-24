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

    console.log('👤 Seeding default Provider (Owner) and Customer demo accounts...');

    // Demo Provider Account
    const providerUser = await User.create({
      name: 'Apex Fleet Mobility (Provider Owner)',
      phone: '9123456789',
      email: 'provider@drivepulse.com',
      password: 'password123',
      role: 'provider',
      shopName: 'Apex Luxury Mobility Vault',
      gstNumber: '22AAAAA0000A1Z5',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'
    });

    // Demo Customer Account
    const customerUser = await User.create({
      name: 'Alex Vance Major (Customer)',
      phone: '9876543210',
      email: 'user@drivepulse.com',
      password: 'password123',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
    });

    console.log('🚗 Seeding vehicle fleet with Engine, Chassis, and RC Book numbers...');
    const vehiclesData = [
      {
        provider: providerUser._id,
        title: 'Tesla Model S Plaid (2025)',
        brand: 'Tesla',
        category: 'EV',
        vehicleType: 'EV',
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
        engineNumber: 'ENG-98472918234',
        chassisNumber: 'CHS-88392019482',
        rcBookNumber: 'RC-77392019482',
        odometerReading: 14500,
        status: 'Available',
        rating: 4.98,
        reviewsCount: 42,
        isAvailable: true,
        features: ['Autopilot FSD', 'Tri-Motor AWD', 'Yoke Steering', '22-Speaker Audio']
      },
      {
        provider: providerUser._id,
        title: 'Porsche 911 GT3 RS',
        brand: 'Porsche',
        category: 'Supercar',
        vehicleType: 'Supercar',
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
        engineNumber: 'ENG-33418291048',
        chassisNumber: 'CHS-44519283746',
        rcBookNumber: 'RC-99812384756',
        odometerReading: 8200,
        status: 'Rented', // Out on rent for provider dashboard test
        rating: 4.99,
        reviewsCount: 38,
        isAvailable: true,
        features: ['DRS Active Aero', 'Carbon Ceramic Brakes', 'PDK 7-Speed']
      },
      {
        provider: providerUser._id,
        title: 'Range Rover Autobiography LWB',
        brand: 'Land Rover',
        category: 'SUV',
        vehicleType: 'SUV',
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
        engineNumber: 'ENG-55619283746',
        chassisNumber: 'CHS-99812374615',
        rcBookNumber: 'RC-11234985764',
        odometerReading: 19800,
        status: 'Available',
        rating: 4.95,
        reviewsCount: 29,
        isAvailable: true,
        features: ['Executive Class Seats', 'Meridian Sound', 'All-Wheel Steering']
      },
      {
        provider: providerUser._id,
        title: 'Ducati Panigale V4 S',
        brand: 'Ducati',
        category: 'Sports Bike',
        vehicleType: 'Sports Bike',
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
        engineNumber: 'ENG-77819238475',
        chassisNumber: 'CHS-11239485764',
        rcBookNumber: 'RC-33419283746',
        odometerReading: 4500,
        status: 'Available',
        rating: 4.97,
        reviewsCount: 19,
        isAvailable: true,
        features: ['Öhlins Suspension', 'Akrapovič Exhaust', 'Cornering ABS']
      },
      {
        provider: providerUser._id,
        title: 'BMW M4 Competition xDrive',
        brand: 'BMW',
        category: 'Sedan',
        vehicleType: 'Sedan',
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
        engineNumber: 'ENG-88912384756',
        chassisNumber: 'CHS-22319485764',
        rcBookNumber: 'RC-55619283746',
        odometerReading: 11200,
        status: 'Available',
        rating: 4.92,
        reviewsCount: 31,
        isAvailable: true,
        features: ['Carbon Bucket Seats', 'Harmon Kardon Audio', 'Heads-Up Display']
      }
    ];

    const seededVehicles = await Vehicle.insertMany(vehiclesData);

    console.log('📌 Creating sample initial booking records with Split Payment & Approval states...');

    // Booking 1: Approved with Pickup Verification Code and Split Payment
    await Booking.create({
      user: customerUser._id,
      provider: providerUser._id,
      vehicle: seededVehicles[1]._id, // Porsche 911 GT3 RS
      drivingLicenseNumber: 'DL-984719283471',
      pickupLocation: 'Beverly Hills Boulevard, LA',
      destinationLocation: 'Malibu Coastline',
      startDate: new Date(Date.now() + 86400000 * 1),
      endDate: new Date(Date.now() + 86400000 * 4),
      totalDays: 3,
      dailyRate: seededVehicles[1].dailyRate,
      subtotal: seededVehicles[1].dailyRate * 3,
      serviceFee: 84,
      insuranceFee: 75,
      totalPrice: seededVehicles[1].dailyRate * 3 + 84 + 75,
      paymentType: 'Split',
      amountPaid: Math.round((seededVehicles[1].dailyRate * 3 + 84 + 75) / 2),
      remainingAmount: Math.round((seededVehicles[1].dailyRate * 3 + 84 + 75) / 2),
      paymentStatus: 'Partial Paid',
      approvalStatus: 'Approved',
      verificationCode: 'PKUP-8921',
      paymentMethod: 'Online Split Payment (50% Upfront)'
    });

    // Booking 2: Waiting for Provider Approval
    await Booking.create({
      user: customerUser._id,
      provider: providerUser._id,
      vehicle: seededVehicles[0]._id, // Tesla Model S Plaid
      drivingLicenseNumber: 'DL-984719283471',
      pickupLocation: 'Downtown Silicon Hub, SF',
      destinationLocation: 'Napa Valley Circuit',
      startDate: new Date(Date.now() + 86400000 * 5),
      endDate: new Date(Date.now() + 86400000 * 7),
      totalDays: 2,
      dailyRate: seededVehicles[0].dailyRate,
      subtotal: seededVehicles[0].dailyRate * 2,
      serviceFee: 30,
      insuranceFee: 50,
      totalPrice: seededVehicles[0].dailyRate * 2 + 30 + 50,
      paymentType: 'Full',
      amountPaid: seededVehicles[0].dailyRate * 2 + 30 + 50,
      remainingAmount: 0,
      paymentStatus: 'Fully Paid',
      approvalStatus: 'Waiting for Approval',
      paymentMethod: 'Full Payment Upfront'
    });

    console.log('🎉 Dual-Role Seed Completed Successfully!');
    console.log('🔑 Customer Login Mobile: 9876543210 / Password: password123 (Demo OTP: 123456)');
    console.log('🔑 Provider Login Mobile: 9123456789 / Password: password123 (Demo OTP: 123456)');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
