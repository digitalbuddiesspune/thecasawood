import express from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { protect, optionalProtect } from '../middleware/auth.js';

const router = express.Router();

// Optional auth check - handled inside routes
// router.use(protect);

// @route   GET /api/cart
// @desc    Get user or guest cart
// @access  Public
router.get('/', optionalProtect, async (req, res) => {
  try {
    const guestId = req.query.guestId;
    let query = {};

    if (req.user) {
      query.user = req.user._id;
    } else if (guestId) {
      query.guestId = guestId;
    } else {
      // Return empty if no ID provided
      return res.json({
        success: true,
        data: { items: [], savedForLater: [] },
        totals: { subtotal: 0, itemCount: 0 }
      });
    }

    let cart = await Cart.findOne(query)
      .populate('items.product', 'name image price originalPrice inStock category')
      .populate('savedForLater.product', 'name image price originalPrice inStock category');

    if (!cart) {
      // Only create if we have a valid identifier
      if (req.user) {
        cart = await Cart.create({ user: req.user._id, items: [], savedForLater: [] });
      } else if (guestId) {
        cart = await Cart.create({ guestId, items: [], savedForLater: [] });
      }
    }

    res.json({
      success: true,
      data: cart,
      totals: {
        subtotal: cart.calculateTotal(),
        itemCount: cart.getItemCount()
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Public
router.post('/', optionalProtect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.inStock) {
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock'
      });
    }

    // Get or create cart
    const guestId = req.body.guestId;
    let query = {};
    if (req.user) {
      query.user = req.user._id;
    } else if (guestId) {
      query.guestId = guestId;
    } else {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    let cart = await Cart.findOne(query);
    if (!cart) {
      if (req.user) {
        cart = await Cart.create({ user: req.user._id, items: [], savedForLater: [] });
      } else {
        cart = await Cart.create({ guestId, items: [], savedForLater: [] });
      }
    }

    // Determine price and variant
    let finalPrice = product.price;
    const { variantName } = req.body;

    if (variantName) {
      const variant = product.variants?.find(v => v.name === variantName);
      if (variant) {
        finalPrice = variant.price;
      } else {
        // If variant name passed but not found in product, safer to error or ignore
        // ignoring for robustness, but ideally should match
      }
    }

    // Check if item already exists in cart matching product AND variant
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId && item.variantName === variantName
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
      // Update price in case it changed in DB
      cart.items[existingItemIndex].price = finalPrice;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price: finalPrice,
        variantName: variantName,
        fabric: req.body.fabric,
        colorCode: req.body.colorCode,
        colorData: req.body.colorData
      });
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name image price originalPrice inStock category')
      .populate('savedForLater.product', 'name image price originalPrice inStock category');

    res.json({
      success: true,
      data: updatedCart,
      message: 'Item added to cart'
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/cart/:itemId
// @desc    Update cart item quantity
// @access  Public
router.put('/:itemId', optionalProtect, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }

    const guestId = req.body.guestId;
    let query = {};
    if (req.user) query.user = req.user._id;
    else if (guestId) query.guestId = guestId;
    else return res.status(401).json({ success: false, message: 'Not authorized' });

    const cart = await Cart.findOne(query);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Get product to update price
    const product = await Product.findById(item.product);
    if (product) {
      item.price = product.price;
    }

    item.quantity = quantity;
    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name image price originalPrice inStock category')
      .populate('savedForLater.product', 'name image price originalPrice inStock category');

    res.json({
      success: true,
      data: updatedCart,
      message: 'Cart updated'
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/cart/:itemId
// @desc    Remove item from cart
// @access  Public
router.delete('/:itemId', optionalProtect, async (req, res) => {
  try {
    const guestId = req.query.guestId; // DELETE requests use query params usually
    let query = {};
    if (req.user) query.user = req.user._id;
    else if (guestId) query.guestId = guestId;
    else return res.status(401).json({ success: false, message: 'Not authorized' });

    const cart = await Cart.findOne(query);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(
      item => item._id.toString() !== req.params.itemId
    );

    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name image price originalPrice inStock category')
      .populate('savedForLater.product', 'name image price originalPrice inStock category');

    res.json({
      success: true,
      data: updatedCart,
      message: 'Item removed from cart'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/cart/save-for-later/:itemId
// @desc    Move item to saved for later
// @access  Public
router.post('/save-for-later/:itemId', optionalProtect, async (req, res) => {
  try {
    const guestId = req.body.guestId;
    let query = {};
    if (req.user) query.user = req.user._id;
    else if (guestId) query.guestId = guestId;
    else return res.status(401).json({ success: false, message: 'Not authorized' });

    const cart = await Cart.findOne(query);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(
      item => item._id.toString() === req.params.itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    cart.savedForLater.push({
      product: item.product,
      quantity: item.quantity,
      price: item.price,
      variantName: item.variantName,
      fabric: item.fabric,
      colorCode: item.colorCode,
      colorData: item.colorData
    });

    cart.items.splice(itemIndex, 1);
    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name image price originalPrice inStock category')
      .populate('savedForLater.product', 'name image price originalPrice inStock category');

    res.json({
      success: true,
      data: updatedCart,
      message: 'Item saved for later'
    });
  } catch (error) {
    console.error('Save for later error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/cart/move-to-cart/:itemId
// @desc    Move item from saved for later to cart
// @access  Public
router.post('/move-to-cart/:itemId', optionalProtect, async (req, res) => {
  try {
    const guestId = req.body.guestId;
    let query = {};
    if (req.user) query.user = req.user._id;
    else if (guestId) query.guestId = guestId;
    else return res.status(401).json({ success: false, message: 'Not authorized' });

    const cart = await Cart.findOne(query);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.savedForLater.findIndex(
      item => item._id.toString() === req.params.itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in saved for later'
      });
    }

    const item = cart.savedForLater[itemIndex];

    // Check if already in cart
    const existingItemIndex = cart.items.findIndex(
      cartItem => cartItem.product.toString() === item.product.toString() && cartItem.variantName === item.variantName
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += item.quantity;
      cart.items[existingItemIndex].price = item.price; // Update price?
    } else {
      cart.items.push({
        product: item.product,
        quantity: item.quantity,
        price: item.price,
        variantName: item.variantName,
        fabric: item.fabric,
        colorCode: item.colorCode,
        colorData: item.colorData
      });
    }

    cart.savedForLater.splice(itemIndex, 1);
    await cart.save();

    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name image price originalPrice inStock category')
      .populate('savedForLater.product', 'name image price originalPrice inStock category');

    res.json({
      success: true,
      data: updatedCart,
      message: 'Item moved to cart'
    });
  } catch (error) {
    console.error('Move to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart
// @access  Public
router.delete('/clear', optionalProtect, async (req, res) => {
  try {
    const guestId = req.query.guestId;
    let query = {};
    if (req.user) query.user = req.user._id;
    else if (guestId) query.guestId = guestId;
    else return res.status(401).json({ success: false, message: 'Not authorized' });

    const cart = await Cart.findOne(query);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
