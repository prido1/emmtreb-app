# Payment Bot Admin Panel - React

A modern React.js admin panel for the Payment Bot system, converted from the original HTML/CSS/JS implementation.

## Features

- **Authentication**: Secure login with JWT token management
- **Dashboard**: Overview of orders, revenue, and key metrics
- **Orders Management**: View, filter, activate, and decline orders
- **Products Management**: Manage products, pricing, and availability
- **Customers Management**: View customer details and wallet balances
- **Payments Management**: Track and manage payment transactions
- **Reports & Analytics**: Generate reports for different time periods

## Technology Stack

- **React** 18.2.0 - UI library
- **React Router** 6.20.0 - Client-side routing
- **Vite** 5.0.8 - Build tool and dev server
- **Axios** - HTTP client for API calls
- **Bootstrap** 5.3.2 - UI framework
- **Font Awesome** 6.5.1 - Icons

## Project Structure

```
admin-react/
├── public/
│   └── index.html
├── src/
│   ├── components/        # Reusable components
│   │   ├── Alert.jsx
│   │   ├── Layout.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── Sidebar.jsx
│   │   └── StatsCard.jsx
│   ├── context/          # React context providers
│   │   └── AuthContext.jsx
│   ├── pages/            # Page components
│   │   ├── Customers.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Orders.jsx
│   │   ├── Payments.jsx
│   │   ├── Products.jsx
│   │   └── Reports.jsx
│   ├── services/         # API services
│   │   └── api.js
│   ├── styles/           # CSS files
│   │   ├── admin.css
│   │   └── login.css
│   ├── utils/            # Helper functions
│   │   └── helpers.js
│   ├── App.jsx           # Main app component
│   └── main.jsx          # Entry point
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

## Installation

1. Navigate to the admin-react folder:
```bash
cd admin-react
```

2. Install dependencies:
```bash
npm install
```

## Configuration

The application is configured to proxy API requests to the backend server:

- **Dev Server Port**: 3000
- **API Proxy**: `/api` routes are proxied to `http://localhost:5000`

You can modify these settings in `vite.config.js` if your backend runs on a different port.

## Running the Application

### Development Mode

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

Build the application for production:
```bash
npm run build
```

The build output will be in the `dist` folder.

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

## Default Login Credentials

- **Username**: `admin`
- **Password**: `admin123`

## API Integration

The application communicates with the Node.js backend API. All API calls are handled through the `src/services/api.js` module which includes:

- Automatic token injection
- Error handling
- Response interceptors
- Automatic logout on 401 (unauthorized) responses

### API Endpoints Used

- `POST /api/admin/login` - Admin login
- `GET /api/admin/profile` - Get admin profile
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/orders/admin/all` - Get all orders
- `PATCH /api/orders/admin/:id/activate` - Activate order
- `PATCH /api/orders/admin/:id/decline` - Decline order
- `PATCH /api/orders/admin/:id/wrong-serial` - Report wrong serial number
- `GET /api/products/admin/all` - Get all products
- `PUT /api/products/admin/:id` - Update product
- `GET /api/customers/admin/all` - Get all customers
- `GET /api/payments/admin/all` - Get all payments
- `GET /api/admin/reports` - Get reports

## Features Overview

### Authentication
- JWT-based authentication
- Persistent login with localStorage
- Automatic token refresh and validation
- Protected routes

### Dashboard
- Real-time statistics cards
- Recent orders table
- Quick action buttons for pending orders
- Auto-refresh capability

### Orders Management
- Filter by status (All, Pending, Paid, Activated, Declined)
- Activate/Decline orders
- Report wrong serial numbers
- View order details

### Products Management
- View all products with pricing
- Calculate and display profit margins
- Enable/Disable products
- Edit product details

### Customers Management
- View customer information
- Check wallet balances
- Track order history and spending
- Manage customer status

### Payments Management
- View all payment transactions
- Track payment providers
- Payment status monitoring
- Refund capabilities

### Reports & Analytics
- Time-based reports (Today, Week, Month, All Time)
- Sales summary
- Top products by revenue
- Performance metrics

## Key Components

### AuthContext
Manages authentication state, login/logout functionality, and user session.

### ProtectedRoute
Wraps routes that require authentication, redirects to login if not authenticated.

### Layout
Main layout component with Navbar and Sidebar, used for all authenticated pages.

### API Service
Centralized API client with axios interceptors for authentication and error handling.

## Styling

The application uses:
- Bootstrap 5 for responsive layout and components
- Custom CSS for admin panel specific styles
- Font Awesome for icons
- Gradient backgrounds and modern card designs

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Notes

- The app uses Vite for fast development and building
- Hot Module Replacement (HMR) is enabled for React components
- All state management is done with React hooks and Context API
- API calls are centralized in the services folder
- Helper functions for formatting are in the utils folder

## Troubleshooting

### API Connection Issues
- Ensure the backend server is running on port 5000
- Check the proxy configuration in `vite.config.js`
- Verify CORS settings on the backend

### Authentication Issues
- Clear localStorage if experiencing login issues
- Check that the admin credentials are correct
- Verify the JWT token is being sent with requests

### Build Issues
- Delete `node_modules` and `package-lock.json`, then run `npm install` again
- Clear Vite cache: `rm -rf node_modules/.vite`

## Future Enhancements

- Add data visualization charts
- Implement real-time notifications
- Add export functionality for reports
- Implement advanced filtering and search
- Add bulk actions for orders and products
- Implement modal dialogs for forms
- Add pagination for large datasets

## License

This project is part of the Payment Bot system.
