# Insurance Management System - Frontend

This is the Angular frontend for the Insurance Management System. It provides a comprehensive web interface for managing insurance policies, claims, and payments.

## Features

- **Authentication**: User registration and login using GraphQL
- **Dashboard**: Overview of policies, claims, and payments
- **Policy Management**: Browse and purchase insurance policies
- **Claims Management**: Submit and track insurance claims
- **Payment History**: View payment records and history
- **Admin Dashboard**: System administration and analytics
- **Responsive Design**: Built with Tailwind CSS for modern, mobile-friendly UI

## Technology Stack

- **Angular 20**: Latest version with standalone components
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **RxJS**: Reactive programming for data handling
- **Angular Router**: Client-side routing
- **Angular Forms**: Reactive forms for user input

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Backend API running on `http://localhost:3000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:4200`

### Building for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
src/
├── app/
│   ├── components/          # Reusable UI components
│   ├── guards/             # Route guards for authentication
│   ├── interceptors/       # HTTP interceptors
│   ├── pages/              # Feature pages
│   │   ├── admin/          # Admin dashboard
│   │   ├── auth/           # Login/Register pages
│   │   ├── claims/         # Claims management
│   │   ├── dashboard/      # User dashboard
│   │   ├── home/           # Landing page
│   │   ├── payments/       # Payment history
│   │   └── policies/       # Policy management
│   ├── services/           # API services
│   └── app.routes.ts       # Application routes
├── environments/           # Environment configurations
└── styles.scss            # Global styles
```

## API Integration

The frontend integrates with the backend API through:

- **GraphQL**: Used for authentication (signup/login)
- **REST API**: Used for all other operations (policies, claims, payments, admin)

### Environment Configuration

Update `src/environments/environment.ts` for development:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  graphqlUrl: 'http://localhost:3000/graphql'
};
```

## Key Features

### Authentication
- User registration and login
- JWT token-based authentication
- Role-based access control (customer, agent, admin)

### Policy Management
- Browse available insurance policies
- View policy details
- Purchase policies with nominee information
- Track policy status

### Claims Management
- Submit new insurance claims
- Track claim status (pending, approved, rejected)
- View claim history

### Payment Management
- View payment history
- Track payment amounts and methods
- Payment summaries and analytics

### Admin Dashboard
- System overview and statistics
- User management
- Agent management
- Audit logs and activity tracking

## Development

### Code Structure
- **Standalone Components**: All components are standalone for better tree-shaking
- **Services**: Centralized API communication
- **Guards**: Route protection based on authentication and roles
- **Interceptors**: Automatic token injection for API requests

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean, professional interface

## Testing

```bash
# Run unit tests
npm test

# Run e2e tests
npm run e2e
```

## Deployment

The application can be deployed to any static hosting service:

1. Build the application: `npm run build`
2. Deploy the `dist/` folder to your hosting service
3. Configure environment variables for production API endpoints

## Contributing

1. Follow Angular style guide
2. Use TypeScript strict mode
3. Write unit tests for new features
4. Follow Tailwind CSS best practices
5. Ensure responsive design

## Support

For issues and questions, please refer to the project documentation or contact the development team.