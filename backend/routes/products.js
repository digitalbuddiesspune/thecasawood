import express from 'express';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit,
      tag,
      inStock
    } = req.query;

    // Build query
    const query = { isActive: true };

    const normalizedCategory = typeof category === 'string' ? category.trim() : category;
    const normalizedCategoryKey =
      typeof normalizedCategory === 'string' ? normalizedCategory.toLowerCase() : '';

    if (normalizedCategory && normalizedCategoryKey !== 'all') {
      // Special-case: "Sofas" should include any sofa-like category naming
      // (e.g., "Leatherette Sofa/Sofas", "Polyester Fabric Sofas", etc.)
      if (normalizedCategoryKey === 'sofas' || normalizedCategoryKey === 'sofa') {
        query.category = { $regex: 'sofa', $options: 'i' };
      } else {
        query.category = normalizedCategory;
      }
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (tag) {
      query.tag = tag;
    }

    if (inStock !== undefined) {
      query.inStock = inStock === 'true';
    }

    // Build sort
    const sort = {};
    if (sortBy === 'price') {
      sort.price = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'rating') {
      sort.rating = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'popular') {
      sort.reviews = -1;
    } else {
      sort.createdAt = sortOrder === 'asc' ? 1 : -1;
    }

    // Pagination (optional: omit limit to get all products)
    const pageNum = parseInt(page) || 1;
    const limitNum = limit === undefined || limit === '' || limit === '0' || String(limit).toLowerCase() === 'all'
      ? 0
      : parseInt(limit);
    const usePagination = limitNum > 0;
    const skip = usePagination ? (pageNum - 1) * limitNum : 0;

    let queryChain = Product.find(query).sort(sort);
    if (usePagination) {
      queryChain = queryChain.skip(skip).limit(limitNum);
    }
    const products = await queryChain.lean();

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: usePagination ? limitNum : total,
        total,
        pages: usePagination ? Math.ceil(total / limitNum) : 1
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviewList.user', 'name');

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/products/:id/reviews
// @desc    Add or update product review
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Review comment is required'
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const existingReviewIndex = product.reviewList.findIndex(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingReviewIndex !== -1) {
      product.reviewList[existingReviewIndex].rating = Number(rating);
      product.reviewList[existingReviewIndex].comment = comment.trim();
      product.reviewList[existingReviewIndex].name = req.user.name;
    } else {
      product.reviewList.push({
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment: comment.trim()
      });
    }

    const reviewCount = product.reviewList.length;
    const avgRating = reviewCount
      ? product.reviewList.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;

    product.reviews = reviewCount;
    product.rating = Number(avgRating.toFixed(1));

    await product.save();

    const updatedProduct = await Product.findById(req.params.id)
      .populate('reviewList.user', 'name');

    res.json({
      success: true,
      data: updatedProduct,
      message: existingReviewIndex !== -1 ? 'Review updated successfully' : 'Review added successfully'
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/products/categories/list
// @desc    Get all categories
// @access  Public
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
