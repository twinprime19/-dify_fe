# Dify Web Application

A modern web application built with Next.js that integrates with Dify.ai for AI-powered conversations, featuring secure authentication and role-based access control.

## Features

- **Authentication**:
  - Local admin authentication
  - Google OAuth2.0
  - Azure AD integration
  - Role-based access control
  - Protected routes with middleware
  - Development bypass for testing

- **Core Functionality**:
  - Integration with Dify.ai API
  - Responsive design
  - Session management
  - Environment-based configuration
  - Customizable UI through config

## Prerequisites

- Node.js 16.8 or later
- npm/yarn/pnpm
- Dify.ai account and API credentials

## Environment Setup

1. Create a `.env.local` file in the root directory and configure the following variables:

```env
# Dify API Configuration
NEXT_PUBLIC_APP_ID=your_dify_app_id
NEXT_PUBLIC_APP_KEY=your_dify_app_key
NEXT_PUBLIC_API_URL=https://api.dify.ai/v1

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Azure AD
AZURE_AD_CLIENT_ID=your-azure-client-id
AZURE_AD_CLIENT_SECRET=your-azure-client-secret
AZURE_AD_TENANT_ID=your-azure-tenant-id
```

## Default Admin Credentials

A local admin account is pre-configured for initial access:
- **Username**: admin
- **Password**: password123!

> **Security Note**: Change these credentials immediately after first login in production by updating the `src/auth/authConfig.js` file.

## Application Configuration

Edit `config/index.ts` to customize the application:

```typescript
export const APP_INFO = {
  title: 'Dify Chat Application',
  description: 'AI-powered chat application',
  copyright: '© 2025 Your Company',
  privacy_policy: '/privacy-policy',
  default_language: 'en'  // Supported: 'en', 'zh-Hans', etc.
}

// Whether to show the prompt input field
export const isShowPrompt = true

// Default prompt template
export const promptTemplate = 'Your custom prompt template here';
```

## Authentication Flow

The application uses NextAuth.js for authentication with the following providers:
1. **Local Admin**: Username/password authentication
2. **Google OAuth**: For Google account login
3. **Azure AD**: For enterprise Azure Active Directory integration

### Development Bypass
During development, you can bypass authentication by:
1. Adding `?bypass=dev` to any URL
2. This sets a cookie that maintains the bypass state for 24 hours
3. The bypass is only available in development mode (NODE_ENV !== 'production')

### Protected Routes
- All routes except `/auth/signin` and static assets require authentication
- Unauthenticated users are redirected to `/auth/signin` with a callback URL
- The callback URL ensures users return to their intended destination after login

## Getting Started

### Prerequisites
- Node.js 16.8 or later
- npm, yarn, or pnpm
- Dify.ai API credentials

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd dify-fe
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   # or
   pnpm install
   ```

3. Set up environment variables (see [Environment Setup](#environment-setup))

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

### Available Scripts

- `dev`: Start development server
- `build`: Build for production
- `start`: Start production server
- `lint`: Run ESLint
- `test`: Run tests

### Development Bypass

For development purposes, you can bypass authentication by:
1. Adding `?bypass=dev` to any URL
2. This sets a cookie that maintains the bypass state for 24 hours
3. The bypass is only available in development mode (NODE_ENV !== 'production')

## Deployment

### Using Docker

1. Build the Docker image:
   ```bash
   docker build -t dify-webapp .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 --env-file .env.local dify-webapp
   ```

### Vercel Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>&project-name=dify-webapp&repository-name=dify-webapp)

> **Note**: If using Vercel Hobby, be aware of the [response size limits](https://vercel.com/pricing).

### Environment Variables in Production

Make sure to set all required environment variables in your production environment:

- `NEXTAUTH_SECRET`: A secure random string for encrypting cookies
- `NEXTAUTH_URL`: Your production URL (e.g., https://yourdomain.com)
- OAuth provider credentials (Google, Azure AD)
- Dify.ai API credentials

## Security

- All routes are protected by default
- Authentication state is maintained via HTTP-only cookies
- CSRF protection is enabled
- Password hashing is handled by NextAuth.js
- Session management with JWT

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Support

For support, please open an issue in the GitHub repository.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [NextAuth.js](https://next-auth.js.org/)
- [Dify.ai](https://dify.ai/)
- [Tailwind CSS](https://tailwindcss.com/)
