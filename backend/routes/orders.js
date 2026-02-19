import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import { protect } from '../middleware/auth.js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Razorpay instance (lazy init so dotenv is loaded first)
const getRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  console.log(keyId, keySecret);
  if (!keyId || !keySecret) {
    throw new Error('Razorpay is not configured');
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

// All routes require authentication
router.use(protect);

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { user: req.user._id };
    if (status) {
      query.orderStatus = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const orders = await Order.find(query)
      .populate('items.product', 'name image')
      .populate('shippingAddress')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/orders/track/:orderNumber
// @desc    Track order by order number (must be before /:id)
// @access  Private
router.get('/track/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({
      orderNumber: req.params.orderNumber,
      user: req.user._id
    })
      .populate('items.product', 'name image')
      .populate('shippingAddress');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    })
      .populate('items.product', 'name image price')
      .populate('shippingAddress')
      .populate('billingAddress');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/orders
// @desc    Create new order from cart
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { shippingAddressId, billingAddressId, paymentMethod = 'COD', notes } = req.body;

    if (!shippingAddressId) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    // Get cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Prepare order items
    const orderItems = cart.items.map(item => {
      const product = item.product;
      return {
        product: product._id,
        name: product.name,
        image: product.image,
        quantity: item.quantity,
        price: item.price,
        originalPrice: product.originalPrice || product.price,
        variantName: item.variantName,
        fabric: item.fabric,
        colorCode: item.colorCode,
        colorData: item.colorData
      };
    });

    // Calculate totals
    const subtotal = cart.calculateTotal();
    const discount = orderItems.reduce((sum, item) => {
      if (item.originalPrice > item.price) {
        return sum + ((item.originalPrice - item.price) * item.quantity);
      }
      return sum;
    }, 0);
    const deliveryCharges = subtotal > 50000 ? 0 : 500;
    const total = subtotal + deliveryCharges;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress: shippingAddressId,
      billingAddress: billingAddressId || shippingAddressId,
      subtotal,
      discount,
      deliveryCharges,
      total,
      paymentMethod,
      notes,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name image price')
      .populate('shippingAddress')
      .populate('billingAddress');

    res.status(201).json({
      success: true,
      data: populatedOrder,
      message: 'Order placed successfully'
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/orders/create-razorpay-order
// @desc    Create order in DB + Razorpay order for online payment
// @access  Private
router.post('/create-razorpay-order', async (req, res) => {
  try {
    const { shippingAddressId, billingAddressId, notes } = req.body;

    if (!shippingAddressId) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required'
      });
    }

    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    const orderItems = cart.items.map(item => {
      const product = item.product;
      return {
        product: product._id,
        name: product.name,
        image: product.image,
        quantity: item.quantity,
        price: item.price,
        originalPrice: product.originalPrice || product.price,
        variantName: item.variantName,
        fabric: item.fabric,
        colorCode: item.colorCode,
        colorData: item.colorData
      };
    });

    const subtotal = cart.calculateTotal();
    const discount = orderItems.reduce((sum, item) => {
      if (item.originalPrice > item.price) {
        return sum + ((item.originalPrice - item.price) * item.quantity);
      }
      return sum;
    }, 0);
    const deliveryCharges = subtotal > 50000 ? 0 : 500;
    const total = subtotal + deliveryCharges;

    // Create order in DB (payment pending)
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress: shippingAddressId,
      billingAddress: billingAddressId || shippingAddressId,
      subtotal,
      discount,
      deliveryCharges,
      total,
      paymentMethod: 'Online',
      paymentStatus: 'pending',
      notes,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    });

    // Create Razorpay order (amount in paise)
    const razorpayOrder = await getRazorpay().orders.create({
      amount: Math.round(total * 100),
      currency: 'INR',
      receipt: order.orderNumber || order._id.toString(),
      notes: {
        orderId: order._id.toString()
      }
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      data: {
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: Math.round(total * 100),
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    const msg = error.error?.description || error.message || 'Failed to create payment order';
    if (error.statusCode === 401) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay authentication failed. Please verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file.'
      });
    }
    res.status(500).json({
      success: false,
      message: msg
    });
  }
});

// @route   POST /api/orders/verify-payment
// @desc    Verify Razorpay payment signature and update order
// @access  Private
router.post('/verify-payment', async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification data'
      });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.paymentStatus === 'paid') {
      return res.json({
        success: true,
        data: await Order.findById(orderId)
          .populate('items.product', 'name image price')
          .populate('shippingAddress')
          .populate('billingAddress'),
        message: 'Payment already verified'
      });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      order.paymentStatus = 'failed';
      await order.save();
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    order.paymentStatus = 'paid';
    order.paymentInfo = {
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'captured'
    };
    order.orderStatus = 'confirmed';
    await order.save();

    const populatedOrder = await Order.findById(orderId)
      .populate('items.product', 'name image price')
      .populate('shippingAddress')
      .populate('billingAddress');

    res.json({
      success: true,
      data: populatedOrder,
      message: 'Payment verified successfully'
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
});

export default router;
