# Casawood Backend API

Fully functional REST API backend for Casawood Furniture E-commerce platform.

## Features

- ✅ User Authentication (Register, Login, JWT)
- ✅ Product Management (List, Detail, Search, Filter)
- ✅ Shopping Cart Management
- ✅ Wishlist Management
- ✅ Order Management & Tracking
- ✅ Address Management
- ✅ User Profile Management

## Tech Stack

- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/casawood
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
```

3. Make sure MongoDB is running on your system

4. Seed the database with initial data:
```bash
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Products
- `GET /api/products` - Get all products (with filters, sorting, pagination)
- `GET /api/products/:id` - Get single product
- `GET /api/products/categories/list` - Get all categories

### Cart (Protected)
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item quantity
- `DELETE /api/cart/:itemId` - Remove item from cart
- `POST /api/cart/save-for-later/:itemId` - Move to saved for later
- `POST /api/cart/move-to-cart/:itemId` - Move from saved to cart
- `DELETE /api/cart/clear` - Clear entire cart

### Wishlist (Protected)
- `GET /api/wishlist` - Get user's wishlist
- `POST /api/wishlist` - Add product to wishlist
- `DELETE /api/wishlist/:productId` - Remove from wishlist
- `POST /api/wishlist/check/:productId` - Check if product is in wishlist

### Orders (Protected)
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order from cart
- `GET /api/orders/track/:orderNumber` - Track order

### Addresses (Protected)
- `GET /api/addresses` - Get user's addresses
- `GET /api/addresses/:id` - Get single address
- `POST /api/addresses` - Create new address
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address

### Users (Protected)
- `GET /api/users/profile` - Get user profile with stats
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/orders` - Get user's orders with statistics

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Response Format

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": {...},
  "message": "Optional message"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": [...]
}
```

## Test Credentials

After running the seed script:
- **Admin**: admin@casawood.com / admin123
- **User**: user@casawood.com / user123

## Database Models

- **User**: User accounts and profiles
- **Product**: Product catalog
- **Cart**: Shopping cart with items and saved for later
- **Wishlist**: User wishlists
- **Order**: Orders with items and tracking
- **Address**: User shipping/billing addresses

## Development

- Use `npm run dev` for development with auto-reload
- Use `npm start` for production
- Use `npm run seed` to populate database with sample data

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRE` - JWT token expiration (default: 7d)
- `FRONTEND_URL` - Frontend URL for CORS
