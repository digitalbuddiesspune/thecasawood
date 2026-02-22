import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    trim: true,
    index: true
    // No enum - any category name from Admin Categories is allowed
  },
  image: {
    type: String,
    required: [true, 'Product image is required']
  },
  images: [{
    type: String
  }],
  tag: {
    type: String,
    enum: ['Best Seller', 'New', 'Sale', 'Featured', 'Premium', 'Trending'],
    default: null
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
  },
  reviewList: [reviewSchema],
  features: [{
    type: String
  }],
  inStock: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: {
      type: String,
      default: 'cm'
    }
  },
  dimensionDetails: [{
    title: { type: String },
    items: [{
      label: { type: String },
      value: { type: String }
    }]
  }],
  weight: { type: Number },
  weightUnit: { type: String, default: 'kg' },
  material: {
    type: String
  },
  color: {
    type: String
  },
  warranty: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sequenceNumber: {
    type: Number,
    default: 0,
    index: true
  },
  // New Fields for Detailed Product Info
  specifications: [{
    key: { type: String, required: true },
    value: { type: String, required: true }
  }],
  colorOptions: [{
    type: String
  }],
  variants: [{
    name: { type: String, required: true }, // e.g., "3 Seater", "1 Seater"
    price: { type: Number, required: true },
    originalPrice: Number,
    dimensions: String,
    image: String
  }],
  // Fabric & Color Selection
  fabricTypes: [{
    type: String // e.g., "KEIBA", "MERRY", "VELVETO", "ABOONE"
  }],
  defaultFabric: {
    type: String // Default fabric type to show
  },
  defaultColor: {
    type: String // Default color code to show
  },
  deliveryCondition: {
    type: String
  },
  policies: {
    shipping: { type: String, default: 'Directly from Factory/ Warehouse, Delivered in multiple boxes' },
    warranty: { type: String, default: '1 year Manufacturing Warranty' },
    cancellations: { type: String, default: 'Cancellations are allowed free of charge only within first 24 hours of placing the order' }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
productSchema.index({ category: 1, price: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function () {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

export default Product;
