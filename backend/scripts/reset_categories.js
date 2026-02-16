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

async function resetCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    await Category.deleteMany({});
    
    const categories = DEFAULT_CATEGORIES.map((name, index) => ({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'category-' + index,
      sortOrder: index,
      isActive: true
    }));

    await Category.insertMany(categories);
    console.log(`✅ Reset and seeded ${categories.length} categories`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

resetCategories();
