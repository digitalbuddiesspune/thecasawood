import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';

dotenv.config();

async function fixSlugs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const categories = await Category.find({ $or: [{ slug: null }, { slug: '' }] });
    
    for (const cat of categories) {
      cat.slug = cat.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'category-' + cat._id;
      await cat.save();
    }
    
    console.log(`Fixed ${categories.length} category slugs`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixSlugs();
