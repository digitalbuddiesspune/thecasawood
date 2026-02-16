# Backend Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Setup Environment Variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your configuration.

3. **Start MongoDB**
   - Make sure MongoDB is installed and running
   - Default connection: `mongodb://localhost:27017/casawood`

4. **Seed Database**
   ```bash
   npm run seed
   ```
   This will create:
   - Sample products
   - Admin user: admin@casawood.com / admin123
   - Test user: user@casawood.com / user123

5. **Start Server**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000`

## API Testing

You can test the API using:
- Postman
- curl
- Frontend application

### Example: Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+91 9876543210"
  }'
```

### Example: Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@casawood.com",
    "password": "user123"
  }'
```

### Example: Get Products (with token)
```bash
curl -X GET http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Database Structure

### Collections
- `users` - User accounts
- `products` - Product catalog
- `carts` - Shopping carts
- `wishlists` - User wishlists
- `orders` - Order history
- `addresses` - User addresses

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod` or `brew services start mongodb-community`
- Check connection string in `.env`

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill the process using port 5000

### JWT Errors
- Ensure `JWT_SECRET` is set in `.env`
- Token expires after 7 days (configurable)

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a strong `JWT_SECRET`
3. Use MongoDB Atlas or production MongoDB instance
4. Configure proper CORS settings
5. Use environment variables for all sensitive data
6. Enable HTTPS
7. Set up proper logging and monitoring
