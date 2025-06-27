# Expenza Backend API

A comprehensive backend API for the Expenza expense tracking and digital committee management application.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Password hashing with bcrypt
  - Password reset functionality
  - Email verification
  - CNIC and face verification

- **Expense Management**
  - CRUD operations for expenses and income
  - Category-based expense tracking
  - Recurring expenses support
  - Expense statistics and analytics

- **Digital Committee System**
  - Create and join committees
  - Slot-based committee management
  - Payment tracking
  - Committee ratings and reviews
  - Private committees with invite codes

- **Financial Goals**
  - Set and track financial goals
  - Progress monitoring
  - Milestone tracking

- **AI Chatbot Integration**
  - Personalized financial advice
  - Expense insights
  - Smart recommendations

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Joi** - Input validation
- **Cloudinary** - Image storage
- **Nodemailer** - Email service

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd server
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`

5. Start the server
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `PUT /api/auth/change-password` - Change password

### Users
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/cnic-verification` - Upload CNIC verification
- `POST /api/users/face-verification` - Face verification
- `GET /api/users/stats` - Get user statistics
- `DELETE /api/users/account` - Delete user account

### Expenses
- `GET /api/expenses` - Get user expenses
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/:id` - Get single expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/stats/summary` - Get expense statistics

### Committees
- `GET /api/committees` - Get all committees
- `POST /api/committees` - Create new committee
- `GET /api/committees/:id` - Get single committee
- `POST /api/committees/:id/join` - Join committee
- `POST /api/committees/:id/leave` - Leave committee
- `GET /api/committees/my/committees` - Get user's committees
- `PUT /api/committees/:id/payment` - Update payment status
- `POST /api/committees/:id/rate` - Rate committee

### Goals
- `GET /api/goals` - Get user goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:id/progress` - Update goal progress
- `DELETE /api/goals/:id` - Delete goal

### Chatbot
- `POST /api/chatbot/message` - Send message to AI chatbot
- `GET /api/chatbot/insights` - Get financial insights

## Database Models

### User
- Personal information
- Authentication data
- Verification status
- Financial totals
- Preferences

### Expense
- Transaction details
- Categories and tags
- Recurring expenses
- Receipt attachments

### Committee
- Committee information
- Slot management
- Payment tracking
- Ratings and reviews

### Goal
- Financial goals
- Progress tracking
- Milestones

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- Input validation with Joi
- CORS protection
- Helmet security headers

## Error Handling

The API uses consistent error response format:
```json
{
  "status": "error",
  "message": "Error description",
  "details": ["Validation errors if any"]
}
```

## Success Response Format

```json
{
  "status": "success",
  "message": "Operation description",
  "data": {}
}
```

## Environment Variables

See `.env.example` for required environment variables.

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License