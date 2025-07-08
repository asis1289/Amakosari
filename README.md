# आमाको Saaरी - Nepali Traditional Fashion E-commerce

A modern, full-stack e-commerce platform for authentic Nepali traditional dresses and fashion items.

## 🌟 Features

### Frontend (Next.js 15 + TypeScript)
- **Modern UI/UX**: Beautiful, responsive design with glassmorphism effects
- **Advanced Animations**: Micro-interactions, confetti effects, and smooth transitions
- **Product Management**: Complete product catalog with categories and collections
- **Shopping Cart**: Persistent cart with guest and authenticated user support
- **Wishlist**: Save and manage favorite products
- **User Authentication**: Secure login/register with JWT tokens
- **Checkout Process**: Complete checkout flow with multiple payment options
- **Admin Dashboard**: Comprehensive admin panel for store management
- **SEO Optimized**: Meta tags, structured data, and performance optimized

### Backend (Node.js + Express + Prisma)
- **RESTful API**: Complete API for all e-commerce functionality
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based authentication with middleware
- **File Upload**: Image upload and management system
- **Order Management**: Complete order processing and tracking
- **Payment Integration**: Multiple payment method support
- **Email Notifications**: Order confirmations and updates

### Key Pages
- ✅ Homepage with hero sections and featured products
- ✅ Product catalog with filtering and search
- ✅ Product detail pages with image galleries
- ✅ Shopping cart and wishlist
- ✅ Checkout process
- ✅ User authentication (login/register)
- ✅ Admin dashboard
- ✅ About, Contact, FAQ pages
- ✅ Shipping, Returns, Privacy, Terms pages
- ✅ Size guide and product information

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Myproject
```

2. **Install dependencies**
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

3. **Environment Setup**
```bash
# Copy environment file
cp .env.example .env

# Update .env with your database credentials
DATABASE_URL="postgresql://username:password@localhost:5432/aamakosarri"
JWT_SECRET="your-secret-key"
```

4. **Database Setup**
```bash
# Run database migrations
npx prisma migrate dev

# Seed the database with sample data
npm run seed
```

5. **Start the development servers**
```bash
# Start backend server (port 3001)
npm run dev

# In another terminal, start frontend (port 3000)
cd frontend
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Admin Dashboard: http://localhost:3000/admin

## 📁 Project Structure

```
Myproject/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # Reusable components
│   │   └── UserContext.tsx  # User authentication context
│   ├── public/              # Static assets
│   └── package.json
├── routes/                  # Express API routes
├── middleware/              # Authentication middleware
├── prisma/                  # Database schema and migrations
├── scripts/                 # Database scripts and utilities
├── server.js               # Express server entry point
└── package.json
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + useState
- **Animations**: Framer Motion + Custom CSS
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **File Upload**: Multer
- **Validation**: Express Validator

### Database
- **Database**: PostgreSQL
- **Migrations**: Prisma Migrate
- **Seeding**: Custom seed scripts

## 🎨 Design Features

### Visual Design
- **Glassmorphism**: Modern glass-like UI elements
- **Gradient Backgrounds**: Beautiful color transitions
- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Theme support
- **Custom Animations**: Smooth micro-interactions

### User Experience
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages
- **Success Feedback**: Confetti effects and notifications
- **Accessibility**: ARIA labels and keyboard navigation
- **Performance**: Optimized images and lazy loading

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/aamakosarri"

# JWT
JWT_SECRET="your-secret-key"

# Server
PORT=3001
NODE_ENV=development

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Database Schema
The database includes tables for:
- Users (customers and admins)
- Products and categories
- Orders and order items
- Cart and wishlist items
- Collections and sales
- Site settings and configurations

## 🚀 Deployment

### Backend Deployment
1. Set up a PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Deploy to your preferred hosting service

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred hosting service
3. Configure environment variables

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktop (1024px+)
- Large screens (1440px+)

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting
- Secure file uploads
- HTTPS enforcement in production

## 📊 Performance

- Image optimization with Next.js
- Code splitting and lazy loading
- Database query optimization
- Caching strategies
- CDN integration ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Email: support@aamakosarri.com
- Phone: +61 2 1234 5678
- Website: https://aamakosarri.com

## 🙏 Acknowledgments

- Nepali artisans and craftspeople
- Open source community
- Design inspiration from traditional Nepali culture

---

**आमाको Saaरी** - Celebrating Nepali heritage through authentic traditional fashion.
