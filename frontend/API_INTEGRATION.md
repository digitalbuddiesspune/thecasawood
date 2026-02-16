# Frontend-Backend Integration Guide

## Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Create `.env` file in frontend directory:**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Start backend server:**
   ```bash
   cd backend
   npm run dev
   ```

4. **Start frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

## API Integration

### Authentication
- **Login**: `POST /api/auth/login`
- **Register**: `POST /api/auth/register`
- **Get Current User**: `GET /api/auth/me`

### Products
- **Get All Products**: `GET /api/products?category=Beds&sortBy=price&page=1`
- **Get Product by ID**: `GET /api/products/:id`
- **Get Categories**: `GET /api/products/categories/list`

### Cart (Protected)
- **Get Cart**: `GET /api/cart`
- **Add to Cart**: `POST /api/cart` (body: `{ productId, quantity }`)
- **Update Quantity**: `PUT /api/cart/:itemId` (body: `{ quantity }`)
- **Remove Item**: `DELETE /api/cart/:itemId`
- **Save for Later**: `POST /api/cart/save-for-later/:itemId`
- **Move to Cart**: `POST /api/cart/move-to-cart/:itemId`

### Wishlist (Protected)
- **Get Wishlist**: `GET /api/wishlist`
- **Add to Wishlist**: `POST /api/wishlist` (body: `{ productId }`)
- **Remove from Wishlist**: `DELETE /api/wishlist/:productId`
- **Check if in Wishlist**: `POST /api/wishlist/check/:productId`

### Orders (Protected)
- **Get Orders**: `GET /api/orders?status=delivered&page=1`
- **Get Order by ID**: `GET /api/orders/:id`
- **Create Order**: `POST /api/orders` (body: `{ shippingAddressId, paymentMethod, notes }`)
- **Track Order**: `GET /api/orders/track/:orderNumber`

### Addresses (Protected)
- **Get Addresses**: `GET /api/addresses`
- **Create Address**: `POST /api/addresses`
- **Update Address**: `PUT /api/addresses/:id`
- **Delete Address**: `DELETE /api/addresses/:id`

### User Profile (Protected)
- **Get Profile**: `GET /api/users/profile`
- **Update Profile**: `PUT /api/users/profile`
- **Get Orders**: `GET /api/users/orders`

## Authentication Flow

1. User registers/logs in
2. JWT token is stored in `localStorage`
3. Token is automatically included in all API requests
4. If token expires (401), user is redirected to home

## Components Updated

- ✅ **ProductList**: Fetches products from API with filtering and pagination
- ✅ **ProductDetail**: Fetches single product, handles add to cart/wishlist
- ✅ **Cart**: Full CRUD operations with API
- ✅ **Wishlist**: Fetches and manages wishlist via API
- ✅ **Profile**: Fetches user profile and orders
- ✅ **Address**: Full address management via API

## Error Handling

All API calls include error handling:
- Network errors show user-friendly messages
- 401 errors automatically log out user
- Validation errors display field-specific messages

## Testing

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Register a new user or use test credentials:
   - Email: `user@casawood.com`
   - Password: `user123`
