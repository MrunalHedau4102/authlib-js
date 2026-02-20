# AuthLib - JavaScript Authentication Library

A scalable, framework-agnostic Node.js/TypeScript authentication library with JWT token management, user registration, login, and password reset functionality.

## Features

- User registration and login with email/password
- JWT-based access and refresh tokens
- Password reset flow with email verification
- Token blacklisting for logout and revocation
- User account management (activation/deactivation)
- Password strength validation and bcryptjs hashing
- Framework-agnostic: Works with Express, Fastify, Nest.js, etc.
- Database-agnostic: TypeORM supports PostgreSQL, MySQL, SQLite, etc.
- Async/Promise-based API
- TypeScript support with full type hints

## Installation

```bash
npm install authlib
```

Or from source:

```bash
git clone https://github.com/authlib/authlib-javascript.git
cd authlib-javascript
npm install
npm run build
```

## Quick Start

### 1. Set up environment

Create a `.env` file:

```env
JWT_SECRET_KEY=your-super-secret-key-change-this
DATABASE_URL=postgresql://user:password@localhost:5432/authlib_db
SMTP_SERVER=smtp.gmail.com
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 2. Initialize database

```typescript
import { AppDataSource } from './database';

await AppDataSource.initialize();
await AppDataSource.synchronize();
```

### 3. Use in your application

```typescript
import { AuthService } from 'authlib';
import { AppDataSource } from './database';

const authService = new AuthService(AppDataSource);

// Register user
const result = await authService.register({
  email: 'user@example.com',
  password: 'SecurePassword123!',
  firstName: 'John',
  lastName: 'Doe'
});

console.log(result.accessToken, result.refreshToken);

// Login user
const loginResult = await authService.login({
  email: 'user@example.com',
  password: 'SecurePassword123!'
});

// Verify token
const decoded = await authService.verifyToken(loginResult.accessToken);
console.log(decoded.userId, decoded.email);
```

## Publishing to npm

1. Create npm account: https://www.npmjs.com/signup
2. Setup npm authentication: `npm login`
3. Update version in package.json
4. Publish: `npm publish`

Full guide: [NPM_PUBLISHING.md](./NPM_PUBLISHING.md)

## License

MIT
