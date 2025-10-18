# Full-Stack Expense Tracker

A modern expense tracker application with a professional frontend and robust Express.js backend.

## 📁 Project Structure

```
expense-tracker/
├── 📁 frontend/                 # Client-side application
│   ├── index.html              # Main HTML file
│   ├── style.css               # Professional styling
│   └── script.js               # Frontend JavaScript with API integration
├── 📁 backend/                  # Server-side application
│   ├── 📁 config/              # Database configuration
│   ├── 📁 middleware/          # Authentication & error handling
│   ├── 📁 models/              # MongoDB schemas
│   ├── 📁 routes/              # API endpoints
│   ├── .env                    # Environment variables
│   ├── package.json            # Backend dependencies
│   └── README.md               # Backend documentation
├── server.js                   # Main server file (serves frontend + API)
├── package.json                # Root package configuration
└── setup-fullstack.bat        # Automated setup script
```

## 🚀 Quick Start

### 1. Automated Setup (Recommended)
```bash
# Run the setup script
./setup-fullstack.bat
```

### 2. Manual Setup
```bash
# Install backend dependencies
cd backend
npm install

# Install root dependencies
cd ..
npm install

# Configure environment
# Copy backend/.env.example to backend/.env and update values
```

### 3. Start the Application
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The application will be available at: `http://localhost:3000`

## 🔌 Frontend-Backend Connection

### How It Works
1. **Server.js** serves the frontend static files from `/frontend` folder
2. **API Routes** are available at `/api/*` endpoints
3. **Frontend JavaScript** makes API calls to the same domain
4. **Fallback Mode** uses localStorage when backend is unavailable

### API Base URL
- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

### Key Connection Points

#### 1. Static File Serving
```javascript
// server.js
app.use(express.static(path.join(__dirname, 'frontend')));
```

#### 2. API Route Mounting
```javascript
// server.js
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
```

#### 3. Frontend API Integration
```javascript
// frontend/script.js
const API_BASE_URL = 'http://localhost:3000/api';
```

## 🔧 Development Workflow

### Frontend Development
- Edit files in `/frontend` folder
- Changes are served immediately (no build step required)
- Browser automatically uses latest files

### Backend Development
- Edit files in `/backend` folder
- Server restarts automatically with nodemon
- API changes are immediately available

### Database Changes
- Update models in `/backend/models`
- Run server to apply schema changes
- MongoDB will automatically adapt to new schemas

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create transaction
- `PATCH /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/summary/balance` - Get balance summary

### Analytics
- `GET /api/analytics/categories` - Category breakdown
- `GET /api/analytics/monthly-trends` - Monthly trends
- `GET /api/analytics/summary` - Overall summary

## 🔐 Authentication Flow

1. **Registration/Login** → JWT token generated
2. **Token Storage** → Stored in localStorage
3. **API Requests** → Token sent in Authorization header
4. **Backend Validation** → Middleware verifies token
5. **User Access** → Protected routes accessible

## 💾 Data Flow

### Online Mode (Full Features)
```
Frontend → API Call → Backend → MongoDB → Response → Frontend Update
```

### Offline Mode (Limited Features)
```
Frontend → localStorage → Local State → Frontend Update
```

## 🌐 Deployment Options

### Option 1: Single Server Deployment
```bash
# Deploy entire project to one server
# Frontend served as static files
# Backend handles API requests
```

### Option 2: Separate Deployment
```bash
# Frontend: Deploy to Netlify/Vercel
# Backend: Deploy to Heroku/Railway
# Update API_BASE_URL in frontend
```

### Option 3: Docker Deployment
```dockerfile
# Use provided Dockerfile
# Both frontend and backend in one container
```

## 🔧 Configuration

### Backend Configuration (`backend/.env`)
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

### Frontend Configuration (`frontend/script.js`)
```javascript
const API_BASE_URL = 'http://localhost:3000/api';
```

## 🐛 Troubleshooting

### Common Issues

1. **Backend not starting**
   - Check MongoDB is running
   - Verify `.env` file exists in `/backend`
   - Check port 3000 is available

2. **Frontend can't connect to API**
   - Verify `API_BASE_URL` in `frontend/script.js`
   - Check CORS settings in `server.js`
   - Ensure backend is running

3. **Database connection errors**
   - Verify MongoDB is running
   - Check `MONGODB_URI` in `.env`
   - For MongoDB Atlas, check network access

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev
```

## 📈 Features

### ✅ Implemented
- User authentication (register/login)
- Transaction management (CRUD)
- Category-based organization
- Real-time balance calculation
- Offline mode support
- Professional UI design
- Responsive layout
- Data analytics
- Secure API with JWT

### 🔄 Coming Soon
- File attachments
- Recurring transactions
- Budget planning
- Export/import features
- Multi-currency support
- Advanced charts

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes in appropriate folder
4. Test both frontend and backend
5. Submit pull request

## 📞 Support

For issues or questions:
1. Check console for errors
2. Verify API connectivity
3. Check database connection
4. Review authentication status