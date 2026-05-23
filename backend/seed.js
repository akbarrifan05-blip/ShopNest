const dotenv = require('dotenv');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Product = require('./model/Product');
const User = require('./model/user');
const Order = require('./model/Order');
const Review = require('./model/Review');

dotenv.config();

const products = [
  {
    name: 'Wireless Noise Cancelling Headphones',
    description: 'Comfortable over-ear headphones with deep bass, active noise cancellation, and 30 hours of battery life.',
    price: 4999,
    category: 'Electronics',
    stock: 24,
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&auto=format&fit=crop',
    rating: 4.5,
    numReviews: 2
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Track steps, heart rate, sleep, workouts, and notifications with a bright touch display.',
    price: 2999,
    category: 'Wearables',
    stock: 38,
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&auto=format&fit=crop',
    rating: 4.2,
    numReviews: 1
  },
  {
    name: 'Minimal Cotton T-Shirt',
    description: 'Soft breathable cotton t-shirt with a clean everyday fit for casual wear.',
    price: 799,
    category: 'Fashion',
    stock: 80,
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&auto=format&fit=crop',
    rating: 4.1,
    numReviews: 1
  },
  {
    name: 'Ergonomic Office Chair',
    description: 'Adjustable chair with lumbar support, breathable mesh back, and smooth rolling wheels.',
    price: 8499,
    category: 'Furniture',
    stock: 12,
    imageUrl: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=900&auto=format&fit=crop',
    rating: 4.7,
    numReviews: 2
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated bottle that keeps drinks hot or cold for hours, perfect for office, gym, and travel.',
    price: 699,
    category: 'Lifestyle',
    stock: 100,
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=900&auto=format&fit=crop',
    rating: 4.4,
    numReviews: 1
  },
  {
    name: 'Mechanical Gaming Keyboard',
    description: 'RGB backlit keyboard with tactile switches, anti-ghosting, and a compact layout.',
    price: 3499,
    category: 'Electronics',
    stock: 18,
    imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=900&auto=format&fit=crop',
    rating: 4.6,
    numReviews: 2
  }
];

const users = [
  {
    name: 'Admin User',
    email: 'admin@shopzone.com',
    password: 'admin123',
    role: 'admin',
    verified: true
  },
  {
    name: 'Demo Customer',
    email: 'customer@shopzone.com',
    password: 'customer123',
    role: 'user',
    verified: true
  }
];

const seedData = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing. Add it to backend/.env before running the seed.');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');

    const seedEmails = users.map((user) => user.email);
    const seedProductNames = products.map((product) => product.name);

    const oldUsers = await User.find({ email: { $in: seedEmails } }).select('_id');
    const oldProducts = await Product.find({ name: { $in: seedProductNames } }).select('_id');

    await Order.deleteMany({ user: { $in: oldUsers.map((user) => user._id) } });
    await Review.deleteMany({
      $or: [
        { userId: { $in: oldUsers.map((user) => user._id) } },
        { productId: { $in: oldProducts.map((product) => product._id) } }
      ]
    });
    await User.deleteMany({ email: { $in: seedEmails } });
    await Product.deleteMany({ name: { $in: seedProductNames } });

    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );

    const createdUsers = await User.insertMany(hashedUsers);
    const createdProducts = await Product.insertMany(products);

    const adminUser = createdUsers.find((user) => user.role === 'admin');
    const demoCustomer = createdUsers.find((user) => user.email === 'customer@shopzone.com');

    await Review.insertMany([
      {
        productId: createdProducts[0]._id,
        userId: demoCustomer._id,
        name: demoCustomer.name,
        rating: 5,
        comment: 'Great sound quality and very comfortable for long use.'
      },
      {
        productId: createdProducts[3]._id,
        userId: adminUser._id,
        name: adminUser.name,
        rating: 5,
        comment: 'Excellent build quality and support for daily work.'
      },
      {
        productId: createdProducts[5]._id,
        userId: demoCustomer._id,
        name: demoCustomer.name,
        rating: 4,
        comment: 'Keys feel nice and the lighting looks clean.'
      }
    ]);

    await Order.insertMany([
      {
        user: demoCustomer._id,
        items: [
          {
            productId: createdProducts[0]._id,
            qty: 1,
            price: createdProducts[0].price
          },
          {
            productId: createdProducts[4]._id,
            qty: 2,
            price: createdProducts[4].price
          }
        ],
        totalAmount: createdProducts[0].price + createdProducts[4].price * 2,
        address: {
          fullName: 'Demo Customer',
          street: '42 Market Road',
          city: 'Mumbai',
          postalCode: '400001',
          country: 'India'
        },
        paymentId: 'seed_payment_001',
        status: 'delivered'
      },
      {
        user: demoCustomer._id,
        items: [
          {
            productId: createdProducts[5]._id,
            qty: 1,
            price: createdProducts[5].price
          }
        ],
        totalAmount: createdProducts[5].price,
        address: {
          fullName: 'Demo Customer',
          street: '42 Market Road',
          city: 'Mumbai',
          postalCode: '400001',
          country: 'India'
        },
        paymentId: 'seed_payment_002',
        status: 'pending'
      }
    ]);

    console.log('Seed data inserted successfully');
    console.log('Admin login: admin@shopzone.com / admin123');
    console.log('Customer login: customer@shopzone.com / customer123');
    process.exit(0);
  } catch (error) {
    console.error(`Seed failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
