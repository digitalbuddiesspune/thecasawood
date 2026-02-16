import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();

const DEFAULT_CATEGORIES = [
  'Beds',
  'Coffee & Center Tables',
  'Dining Tables',
  'Sofas',
  'Lounge chair'
];

// Seed default categories if collection is empty
async function ensureCategoriesSeeded() {
  const count = await Category.countDocuments();
  if (count === 0) {
    await Category.insertMany(
      DEFAULT_CATEGORIES.map((name, index) => ({
        name,
        sortOrder: index,
        isActive: true
      }))
    );
  }
}

// @route   GET /api/categories
// @desc    Get all active categories (for navbar)
// @access  Public
router.get('/', async (req, res) => {
  try {
    await ensureCategoriesSeeded();

    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1 })
      .select('name slug')
      .lean();

    res.json({
      success: true,
      data: categories.map(c => ({
        name: c.name,
        to: `/products?category=${encodeURIComponent(c.name)}`
      }))
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
