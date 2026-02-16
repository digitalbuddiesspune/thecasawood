import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';

dotenv.config();

const DEFAULT_CATEGORIES = [
  'Beds',
  'Coffee & Center Tables',
  'Dining Tables',
  'Sofas',
  'Lounge chair'
];

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await Category.countDocuments();

    if (count > 0) {
      console.log('Categories already exist. Skipping seed.');
      await mongoose.disconnect();
      process.exit(0);
    }

    const categories = DEFAULT_CATEGORIES.map((name, index) => ({
      name,
      sortOrder: index,
      isActive: true
    }));

    await Category.insertMany(categories);
    console.log(`✅ Seeded ${categories.length} categories`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seedCategories();
