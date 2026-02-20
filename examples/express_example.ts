import express, { Request, Response, NextFunction } from 'express';
import { AuthService } from '../src/services/AuthService';
import { UserService } from '../src/services/UserService';
import { Config } from '../src/config/Config';
import { authenticate } from './middleware';

const app = express();
const config = new Config();
const authService = new AuthService();
const userService = new UserService();

// Middleware
app.use(express.json());

// ============================================================================
// Auth Routes
// ============================================================================

/**
 * POST /auth/register
 * Register a new user
 */
app.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Register user
    const result = await authService.register({
      email,
      password,
      firstName,
      lastName
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || 'Registration failed'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: {
        id: result.user?.id,
        email: result.user?.email,
        firstName: result.user?.firstName,
        lastName: result.user?.lastName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /auth/login
 * Login with email and password
 */
app.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Login user
    const result = await authService.login({ email, password });

    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: result.message || 'Login failed'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: config.JWT_EXPIRY,
      user: {
        id: result.user?.id,
        email: result.user?.email,
        firstName: result.user?.firstName,
        lastName: result.user?.lastName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
app.post('/auth/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Refresh token
    const result = await authService.refreshToken(refreshToken);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: result.message || 'Token refresh failed'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      accessToken: result.accessToken,
      expiresIn: config.JWT_EXPIRY
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /auth/logout
 * Logout and blacklist refresh token
 */
app.post('/auth/logout', authenticate, async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Logout
    const result = await authService.logout(refreshToken);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || 'Logout failed'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// ============================================================================
// User Routes
// ============================================================================

/**
 * GET /users/:id
 * Get user by ID (requires authentication)
 */
app.get('/users/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /users/email/:email
 * Get user by email (requires authentication)
 */
app.get('/users/email/:email', authenticate, async (req: Request, res: Response) => {
  try {
    const { email } = req.params;

    const user = await userService.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * PUT /users/:id
 * Update user (requires authentication)
 */
app.put('/users/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { firstName, lastName } = req.body;

    // Get existing user
    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    // Save (in real app, you would call a save method)
    // await userService.saveUser(user);

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /users/:id/activate
 * Activate a user account
 */
app.post('/users/:id/activate', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    const success = await userService.activateUser(userId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User activated successfully'
    });
  } catch (error) {
    console.error('Activate user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /users/:id/deactivate
 * Deactivate a user account
 */
app.post('/users/:id/deactivate', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    const success = await userService.deactivateUser(userId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /users/:id/verify
 * Verify user email
 */
app.post('/users/:id/verify', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    const success = await userService.verifyUser(userId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User verified successfully'
    });
  } catch (error) {
    console.error('Verify user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * Error handling middleware
 */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// ============================================================================
// Start Server
// ============================================================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 AuthLib Express server running on port ${PORT}`);
  console.log(`📚 API Documentation:`);
  console.log(`   POST   /auth/register         - Register new user`);
  console.log(`   POST   /auth/login            - Login user`);
  console.log(`   POST   /auth/refresh          - Refresh token`);
  console.log(`   POST   /auth/logout           - Logout user`);
  console.log(`   GET    /users/:id             - Get user by ID`);
  console.log(`   GET    /users/email/:email    - Get user by email`);
  console.log(`   PUT    /users/:id             - Update user`);
  console.log(`   POST   /users/:id/activate    - Activate user`);
  console.log(`   POST   /users/:id/deactivate  - Deactivate user`);
  console.log(`   POST   /users/:id/verify      - Verify user`);
  console.log(`   GET    /health                - Health check`);
});

export default app;
