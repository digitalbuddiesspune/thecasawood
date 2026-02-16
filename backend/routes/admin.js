import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Fabric from '../models/Fabric.js';
import Category from '../models/Category.js';

const router = express.Router();

// Apply admin middleware to all routes
router.use(protect);
router.use(admin);

// ==================== DASHBOARD ====================

// Get dashboard stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const [
      totalOrders,
      totalProducts,
      totalCustomers,
      pendingOrders,
      todayOrders,
      revenueResult
    ] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Order.countDocuments({ orderStatus: 'pending' }),
      Order.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999))
        }
      }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);

    // Today's sales
    const todaySalesResult = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
            $lt: new Date(new Date().setHours(23, 59, 59, 999))
          },
          paymentStatus: 'paid'
        }
      },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalProducts,
        totalCustomers,
        totalRevenue: revenueResult[0]?.total || 0,
        todaySales: todaySalesResult[0]?.total || 0,
        pendingOrders
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get recent orders for dashboard
router.get('/dashboard/recent-orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get sales chart data
router.get('/dashboard/sales-chart', async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    let groupBy, dateFormat;
    let startDate = new Date();

    if (period === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
      groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    } else if (period === 'monthly') {
      startDate.setMonth(startDate.getMonth() - 1);
      groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    } else {
      startDate.setFullYear(startDate.getFullYear() - 1);
      groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
    }

    const salesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: groupBy,
          value: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const formattedData = salesData.map(item => ({
      label: item._id,
      value: item.value,
      orders: item.orders
    }));

    res.json({ success: true, data: formattedData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== PRODUCTS ====================

// Get all products (admin)
router.get('/products', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) query.category = category;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single product
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create product
router.post('/products', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    const message = error.name === 'ValidationError' && error.errors
      ? Object.values(error.errors).map((e) => e.message).join(', ')
      : error.message;
    res.status(400).json({ success: false, message });
  }
});

// Update product
router.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    const message = error.name === 'ValidationError' && error.errors
      ? Object.values(error.errors).map((e) => e.message).join(', ')
      : error.message;
    res.status(400).json({ success: false, message });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update product status
router.patch('/products/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status, isActive: status === 'active' },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk delete products
router.post('/products/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    await Product.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, message: `${ids.length} products deleted` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== CATEGORIES ====================

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

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    await ensureCategoriesSeeded();

    const categories = await Category.find().sort({ sortOrder: 1 });
    const categoryNames = categories.map(c => c.name);

    const categoryCounts = await Product.aggregate([
      { $match: { category: { $in: categoryNames } } },
      { $group: { _id: '$category', productCount: { $sum: 1 } } }
    ]);

    const countsMap = categoryCounts.reduce((acc, item) => {
      acc[item._id] = item.productCount;
      return acc;
    }, {});

    const allCategories = categories.map(c => ({
      _id: c._id,
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      image: c.image || '',
      sortOrder: c.sortOrder ?? 0,
      isActive: c.isActive !== false,
      productCount: countsMap[c.name] || 0,
      status: c.isActive ? 'active' : 'inactive'
    }));

    res.json({ success: true, data: allCategories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create category
router.post('/categories', async (req, res) => {
  try {
    const { name, description, image, status, sortOrder } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || '',
      image: image || '',
      sortOrder: sortOrder !== undefined && sortOrder !== '' ? Number(sortOrder) : 0,
      isActive: status !== 'inactive'
    });

    res.status(201).json({
      success: true,
      data: {
        _id: category._id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
        productCount: 0,
        status: category.isActive ? 'active' : 'inactive'
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update category
router.put('/categories/:id', async (req, res) => {
  try {
    const { name, description, image, status, sortOrder } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (name && name.trim() && name.trim() !== category.name) {
      const existing = await Category.findOne({ name: name.trim() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Category name already exists' });
      }
      const oldName = category.name;
      category.name = name.trim();
      await Product.updateMany({ category: oldName }, { category: category.name });
    }

    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (status !== undefined) category.isActive = status !== 'inactive';
    if (sortOrder !== undefined && sortOrder !== '') category.sortOrder = Number(sortOrder);

    await category.save();

    const productCount = await Product.countDocuments({ category: category.name });

    res.json({
      success: true,
      data: {
        _id: category._id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
        productCount,
        status: category.isActive ? 'active' : 'inactive'
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const productCount = await Product.countDocuments({ category: category.name });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${productCount} products. Reassign products first.`
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update category status
router.patch('/categories/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: status !== 'inactive' },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const productCount = await Product.countDocuments({ category: category.name });

    res.json({
      success: true,
      data: {
        _id: category._id,
        name: category.name,
        productCount,
        status: category.isActive ? 'active' : 'inactive'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== USERS ====================

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (status === 'active') query.isActive = true;
    if (status === 'blocked') query.isActive = false;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    // Add order stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orderStats = await Order.aggregate([
          { $match: { user: user._id } },
          {
            $group: {
              _id: null,
              orderCount: { $sum: 1 },
              totalSpent: { $sum: '$total' }
            }
          }
        ]);

        return {
          ...user.toObject(),
          orderCount: orderStats[0]?.orderCount || 0,
          totalSpent: orderStats[0]?.totalSpent || 0
        };
      })
    );

    res.json({
      success: true,
      data: {
        users: usersWithStats,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single user
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const orderStats = await Order.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$total' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        orderCount: orderStats[0]?.orderCount || 0,
        totalSpent: orderStats[0]?.totalSpent || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle user status (block/unblock)
router.patch('/users/:id/toggle-status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent blocking admins
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot block admin users' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user orders
router.get('/users/:id/orders', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const orders = await Order.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ORDERS ====================

// Get all orders
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, paymentStatus, search, fromDate, toDate } = req.query;
    const query = {};

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } }
      ];
    }
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate + 'T23:59:59.999Z');
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single order
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update order status
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updateData = { orderStatus: status };

    // Set deliveredOn date if delivered
    if (status === 'delivered') {
      updateData.deliveredOn = new Date();
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update payment status
router.patch('/orders/:id/payment-status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'paid', 'failed', 'refunded'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== PAYMENTS ====================

// Get payment transactions (from orders)
router.get('/payments/transactions', async (req, res) => {
  try {
    const { page = 1, limit = 10, method, status } = req.query;
    const query = {};

    if (method) query.paymentMethod = method;
    if (status) query.paymentStatus = status;

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .select('orderNumber total paymentMethod paymentStatus razorpayPaymentId createdAt user')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        transactions: orders,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== REPORTS ====================

// Sales report
router.get('/reports/sales', async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const startDate = fromDate ? new Date(fromDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = toDate ? new Date(toDate + 'T23:59:59.999Z') : new Date();

    const dailySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sales: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', sales: 1, orders: 1, _id: 0 } }
    ]);

    const summary = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' }
        }
      }
    ]);

    const totalCustomers = await Order.distinct('user', {
      createdAt: { $gte: startDate, $lte: endDate }
    });

    res.json({
      success: true,
      data: {
        dailySales,
        summary: {
          ...summary[0],
          totalCustomers: totalCustomers.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Product report
router.get('/reports/products', async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const startDate = fromDate ? new Date(fromDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = toDate ? new Date(toDate + 'T23:59:59.999Z') : new Date();

    const productSales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          sales: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
      {
        $project: {
          name: '$_id',
          sales: 1,
          revenue: 1,
          _id: 0
        }
      }
    ]);

    res.json({ success: true, data: productSales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// User activity report
router.get('/reports/users', async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    const startDate = fromDate ? new Date(fromDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = toDate ? new Date(toDate + 'T23:59:59.999Z') : new Date();

    const userActivity = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 },
      { $project: { date: '$_id', newUsers: 1, _id: 0 } }
    ]);

    // Add order counts per day
    const ordersByDay = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 }
        }
      }
    ]);

    const ordersMap = ordersByDay.reduce((acc, item) => {
      acc[item._id] = item.orders;
      return acc;
    }, {});

    const result = userActivity.map(item => ({
      ...item,
      orders: ordersMap[item.date] || 0,
      activeUsers: Math.floor(Math.random() * 50) + 20 // Placeholder - would need session tracking
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== FABRICS ====================

// Get all fabrics
router.get('/fabrics', async (req, res) => {
  try {
    const fabrics = await Fabric.find().sort({ name: 1 });
    res.json({ success: true, data: fabrics });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create fabric
router.post('/fabrics', async (req, res) => {
  try {
    const fabric = await Fabric.create(req.body);
    res.status(201).json({ success: true, data: fabric });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update fabric
router.put('/fabrics/:id', async (req, res) => {
  try {
    const fabric = await Fabric.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!fabric) {
      return res.status(404).json({ success: false, message: 'Fabric not found' });
    }
    res.json({ success: true, data: fabric });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete fabric
router.delete('/fabrics/:id', async (req, res) => {
  try {
    const fabric = await Fabric.findByIdAndDelete(req.params.id);
    if (!fabric) {
      return res.status(404).json({ success: false, message: 'Fabric not found' });
    }
    res.json({ success: true, message: 'Fabric deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
