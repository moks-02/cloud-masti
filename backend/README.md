# Expense Tracker - Backend Setup Guide

## Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** (Local installation or MongoDB Atlas)
3. **npm** or **yarn** package manager

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory with the following variables:
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB on your system
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string and update `MONGODB_URI` in `.env`

### 4. Start the Application

#### Development Mode (with auto-restart)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Transactions
- `GET /api/transactions` - Get all user transactions
- `POST /api/transactions` - Create new transaction
- `GET /api/transactions/:id` - Get specific transaction
- `PATCH /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/summary/balance` - Get user balance summary

### Analytics
- `GET /api/analytics/categories` - Category breakdown
- `GET /api/analytics/monthly-trends` - Monthly spending trends
- `GET /api/analytics/summary` - Overall summary

### Categories
- `GET /api/categories` - Get all available categories

## Features

### Backend Features
✅ **User Authentication** - JWT-based auth with secure password hashing
✅ **Transaction Management** - Full CRUD operations
✅ **Data Analytics** - Category breakdown and spending trends
✅ **Security** - Helmet, CORS, rate limiting
✅ **Error Handling** - Comprehensive error management
✅ **Validation** - Data validation with Mongoose
✅ **Database Indexing** - Optimized queries

### Frontend Features
✅ **Hybrid Mode** - Works online with backend API and offline with localStorage
✅ **Authentication UI** - Login/Register modal
✅ **Real-time Sync** - Data synchronization when online
✅ **Offline Support** - Full functionality without internet
✅ **Professional Design** - Modern, clean interface

## File Structure
```
expense-tracker/
├── config/
│   └── database.js
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
├── models/
│   ├── User.js
│   └── Transaction.js
├── routes/
│   ├── auth.js
│   ├── transactions.js
│   ├── categories.js
│   └── analytics.js
├── public/ (optional - for serving static files)
├── server.js
├── package.json
├── .env
└── README.md
```

## Usage Examples

### Register a new user
```javascript
const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
    })
});
```

### Create a transaction
```javascript
const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        description: 'Grocery Shopping',
        amount: -85.50,
        category: 'food',
        type: 'expense'
    })
});
```

## Deployment

### Option 1: Heroku
1. Install Heroku CLI
2. Create Heroku app: `heroku create your-app-name`
3. Set environment variables: `heroku config:set KEY=value`
4. Deploy: `git push heroku main`

### Option 2: Railway
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

### Option 3: DigitalOcean App Platform
1. Connect your repository
2. Configure environment variables
3. Deploy with one click

## Security Considerations

1. **JWT Secret** - Use a strong, random secret key in production
2. **HTTPS** - Always use HTTPS in production
3. **Environment Variables** - Never commit `.env` file to version control
4. **Rate Limiting** - API includes rate limiting to prevent abuse
5. **Input Validation** - All inputs are validated and sanitized

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if MongoDB is running
   - Verify connection string in `.env`
   - Check network access for MongoDB Atlas

2. **JWT Token Issues**
   - Verify JWT_SECRET is set correctly
   - Check token expiration settings

3. **CORS Errors**
   - Update FRONTEND_URL in `.env`
   - Check CORS configuration in server.js

## Support

For issues and questions:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure MongoDB is running and accessible
4. Check network connectivity for API calls