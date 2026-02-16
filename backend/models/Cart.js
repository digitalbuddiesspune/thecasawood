import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  price: {
    type: Number,
    required: true
  },
  variantName: {
    type: String // e.g., "3 Seater"
  },
  // Fabric & Color Selection
  fabric: {
    type: String // e.g., "KEIBA"
  },
  colorCode: {
    type: String // e.g., "KEIBA 901"
  },
  colorData: {
    code: String,
    name: String,
    color: String,
    image: String
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  guestId: {
    type: String
  },
  items: [cartItemSchema],
  savedForLater: [cartItemSchema]
}, {
  timestamps: true
});

// Calculate total
cartSchema.methods.calculateTotal = function () {
  return this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

// Get item count
cartSchema.methods.getItemCount = function () {
  return this.items.reduce((count, item) => count + item.quantity, 0);
};

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
