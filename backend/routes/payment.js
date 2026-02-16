import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

let razorpayInstance = null;

const getRazorpay = () => {
    if (!razorpayInstance) {
        if (!process.env.RAZORPAY_KEY_ID) {
            throw new Error("RAZORPAY_KEY_ID is missing from environment variables");
        }
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpayInstance;
};

// @route   GET /api/payment/key
// @desc    Get Razorpay Key ID
// @access  Private
router.get('/key', protect, (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// @route   POST /api/payment/create-order
// @desc    Create Razorpay Order
// @access  Private
router.post('/create-order', protect, async (req, res) => {
    try {
        const { shippingAddressId, billingAddressId } = req.body;

        // Get cart
        const cart = await Cart.findOne({ user: req.user._id })
            .populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        // Calculate totals
        const subtotal = cart.calculateTotal();
        const deliveryCharges = subtotal > 50000 ? 0 : 500;
        const total = subtotal + deliveryCharges;

        const options = {
            amount: Math.round(total * 100), // amount in smallest currency unit (paise)
            currency: "INR",
            receipt: `receipt_${Date.now()}_${req.user._id.toString().substring(0, 5)}`
        };

        const order = await getRazorpay().orders.create(options);

        res.json({
            success: true,
            order,
            amount: total, // sending regular amount for UI
            shippingAddressId, // Echo back
            billingAddressId  // Echo back
        });

    } catch (error) {
        console.error('Razorpay Create Order Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment order'
        });
    }
});

// @route   POST /api/payment/verify
// @desc    Verify Payment and Create Order
// @access  Private
router.post('/verify', protect, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            shippingAddressId,
            billingAddressId
        } = req.body;

        if (!shippingAddressId) {
            return res.status(400).json({ success: false, message: 'Shipping address ID is required during verification' });
        }

        // Verify signature
        const text = razorpay_order_id + "|" + razorpay_payment_id;
        const generated_signature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(text)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            });
        }

        // Payment Verified - Create Order in DB
        // (Logic copied/adapted from orders.js)

        // Get cart again
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
            // Handle case if product was deleted but still in cart? 
            // Assuming product exists as populated.
            if (!product) return null;

            return {
                product: product._id,
                name: product.name,
                image: product.image,
                quantity: item.quantity,
                price: item.price,
                originalPrice: product.originalPrice || product.price
            };
        }).filter(item => item !== null);

        if (orderItems.length === 0) {
            return res.status(400).json({ success: false, message: 'Invalid cart items' });
        }

        // Calculate totals again to be safe
        const subtotal = cart.calculateTotal();
        const calculateDiscount = (items) => {
            return items.reduce((sum, item) => {
                if (item.originalPrice > item.price) {
                    return sum + ((item.originalPrice - item.price) * item.quantity);
                }
                return sum;
            }, 0);
        };
        const discount = calculateDiscount(orderItems);
        const deliveryCharges = subtotal > 50000 ? 0 : 500;
        const total = subtotal + deliveryCharges;

        // Create order
        // Generate order number manually
        const count = await Order.countDocuments();
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const orderNumber = `ORD-${year}-${month}${day}-${String(count + 1).padStart(3, '0')}`;

        const order = await Order.create({
            user: req.user._id,
            orderNumber, // Validated as required
            items: orderItems,
            shippingAddress: shippingAddressId,
            billingAddress: billingAddressId || shippingAddressId,
            subtotal,
            discount,
            deliveryCharges,
            total,
            paymentMethod: 'Online',
            paymentInfo: {
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                status: 'Paid'
            },
            paymentStatus: 'paid',
            paidAt: Date.now(),
            estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        });

        // Clear cart
        cart.items = [];
        await cart.save();

        res.status(201).json({
            success: true,
            data: order,
            message: 'Payment successful and order placed'
        });

    } catch (error) {
        console.error('Payment Verification Error (Full Stack):', error);
        res.status(500).json({
            success: false,
            message: `Server error processing payment: ${error.message}`,
            error: error.toString()
        });
    }
});

export default router;
