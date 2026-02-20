import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';
import { JWTHandler } from '../utils/JWTHandler';
import { PasswordHandler } from '../utils/PasswordHandler';
import { Config } from '../config/Config';
import { AppDataSource } from '../database/AppDataSource';
import { InvalidCredentials, UserAlreadyExists, InvalidToken } from '../utils/exceptions';

/**
 * Integration tests for AuthLib JavaScript version
 * Tests the complete authentication flow
 */

describe('AuthLib JavaScript Integration Tests', () => {
  beforeAll(async () => {
    // Initialize database for testing
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    // Synchronize schema
    await AppDataSource.synchronize(true);
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('User Registration', () => {
    const authService = new AuthService(AppDataSource);

    test('should successfully register a new user', async () => {
      const result = await authService.register({
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe'
      });

      expect(result.success).toBe(true);
      expect(result.user.email).toBe('newuser@example.com');
      expect(result.user.firstName).toBe('John');
      expect(result.user.lastName).toBe('Doe');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    test('should reject invalid email format', async () => {
      expect(async () => {
        await authService.register({
          email: 'invalid-email',
          password: 'SecurePass123!',
          firstName: 'Jane',
          lastName: 'Doe'
        });
      }).rejects.toThrow('Invalid email format');
    });

    test('should reject weak password', async () => {
      expect(async () => {
        await authService.register({
          email: 'weak@example.com',
          password: 'weak',
          firstName: 'Test',
          lastName: 'User'
        });
      }).rejects.toThrow();
    });

    test('should prevent duplicate email registration', async () => {
      // First registration
      await authService.register({
        email: 'duplicate@example.com',
        password: 'SecurePass123!',
        firstName: 'First',
        lastName: 'User'
      });

      // Attempt duplicate
      expect(async () => {
        await authService.register({
          email: 'duplicate@example.com',
          password: 'SecurePass123!',
          firstName: 'Second',
          lastName: 'User'
        });
      }).rejects.toThrow('already exists');
    });

    test('should generate valid JWT tokens', async () => {
      const result = await authService.register({
        email: 'tokentest@example.com',
        password: 'SecurePass123!',
        firstName: 'Token',
        lastName: 'Tester'
      });

      const accessPayload = authService.verifyToken(result.accessToken);
      expect(accessPayload.userId).toBe(result.user.id);
      expect(accessPayload.email).toBe(result.user.email);
      expect(accessPayload.type).toBe('access');
    });
  });

  describe('User Login', () => {
    const authService = new AuthService(AppDataSource);

    beforeEach(async () => {
      // Create test user
      await authService.register({
        email: 'logintest@example.com',
        password: 'SecurePass123!',
        firstName: 'Login',
        lastName: 'Tester'
      });
    });

    test('should successfully login with correct credentials', async () => {
      const result = await authService.login({
        email: 'logintest@example.com',
        password: 'SecurePass123!'
      });

      expect(result.success).toBe(true);
      expect(result.user.email).toBe('logintest@example.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    test('should track last login timestamp', async () => {
      const beforeLogin = new Date();
      
      const result = await authService.login({
        email: 'logintest@example.com',
        password: 'SecurePass123!'
      });

      const afterLogin = new Date();
      
      expect(result.user.lastLogin).toBeDefined();
      const loginTime = result.user.lastLogin instanceof Date 
        ? result.user.lastLogin 
        : new Date(result.user.lastLogin as string);
      
      expect(loginTime.getTime()).toBeGreaterThanOrEqual(beforeLogin.getTime());
      expect(loginTime.getTime()).toBeLessThanOrEqual(afterLogin.getTime());
    });

    test('should reject incorrect password', async () => {
      expect(async () => {
        await authService.login({
          email: 'logintest@example.com',
          password: 'WrongPassword123!'
        });
      }).rejects.toThrow('Invalid email or password');
    });

    test('should reject non-existent email', async () => {
      expect(async () => {
        await authService.login({
          email: 'nonexistent@example.com',
          password: 'SecurePass123!'
        });
      }).rejects.toThrow('not found');
    });

    test('should reject login for deactivated user', async () => {
      const userService = new UserService(AppDataSource);
      const user = await userService.getUserByEmail('logintest@example.com');
      
      // Deactivate user
      await userService.deactivateUser(user.id);

      expect(async () => {
        await authService.login({
          email: 'logintest@example.com',
          password: 'SecurePass123!'
        });
      }).rejects.toThrow('deactivated');
    });
  });

  describe('Token Management', () => {
    const authService = new AuthService(AppDataSource);
    let testTokens: { accessToken: string; refreshToken: string };
    let userId: number;

    beforeAll(async () => {
      const result = await authService.register({
        email: 'tokenmanagement@example.com',
        password: 'SecurePass123!',
        firstName: 'Token',
        lastName: 'Manager'
      });

      testTokens = {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      };
      userId = result.user.id;
    });

    test('should verify valid access token', () => {
      const payload = authService.verifyToken(testTokens.accessToken);

      expect(payload.userId).toBe(userId);
      expect(payload.email).toBe('tokenmanagement@example.com');
      expect(payload.type).toBe('access');
    });

    test('should reject invalid token', () => {
      expect(() => {
        authService.verifyToken('invalid.token.here');
      }).toThrow('verification failed');
    });

    test('should refresh access token using refresh token', async () => {
      const refreshResponse = await authService.refreshAccessToken(testTokens.refreshToken);

      expect(refreshResponse.accessToken).toBeDefined();
      expect(refreshResponse.accessToken).not.toBe(testTokens.accessToken);

      const newPayload = authService.verifyToken(refreshResponse.accessToken);
      expect(newPayload.userId).toBe(userId);
      expect(newPayload.type).toBe('access');
    });

    test('should reject refresh with wrong token type', async () => {
      // Try to use access token as refresh token
      expect(async () => {
        await authService.refreshAccessToken(testTokens.accessToken);
      }).rejects.toThrow('Invalid token type');
    });

    test('should logout and blacklist tokens', async () => {
      const loginResult = await authService.login({
        email: 'tokenmanagement@example.com',
        password: 'SecurePass123!'
      });

      const logoutResult = await authService.logout(
        loginResult.accessToken,
        loginResult.refreshToken
      );

      expect(logoutResult.success).toBe(true);

      // Attempt to use blacklisted token should fail
      expect(async () => {
        await authService.refreshAccessToken(loginResult.refreshToken);
      }).rejects.toThrow('revoked');
    });
  });

  describe('User Service', () => {
    const authService = new AuthService(AppDataSource);
    const userService = new UserService(AppDataSource);
    let testUserId: number;

    beforeAll(async () => {
      const result = await authService.register({
        email: 'userservice@example.com',
        password: 'SecurePass123!',
        firstName: 'User',
        lastName: 'Service'
      });

      testUserId = result.user.id;
    });

    test('should retrieve user by ID', async () => {
      const user = await userService.getUserById(testUserId);

      expect(user.id).toBe(testUserId);
      expect(user.email).toBe('userservice@example.com');
    });

    test('should retrieve user by email', async () => {
      const user = await userService.getUserByEmail('userservice@example.com');

      expect(user.id).toBe(testUserId);
      expect(user.email).toBe('userservice@example.com');
    });

    test('should activate and deactivate user', async () => {
      let user = await userService.deactivateUser(testUserId);
      expect(user.isActive).toBe(false);

      user = await userService.activateUser(testUserId);
      expect(user.isActive).toBe(true);
    });

    test('should verify user', async () => {
      const user = await userService.verifyUser(testUserId);
      expect(user.isVerified).toBe(true);
    });

    test('should update last login', async () => {
      const beforeUpdate = new Date();
      const user = await userService.updateLastLogin(testUserId);
      const afterUpdate = new Date();

      expect(user.lastLogin).toBeDefined();
      const loginTime = user.lastLogin instanceof Date
        ? user.lastLogin
        : new Date(user.lastLogin as string);

      expect(loginTime.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
      expect(loginTime.getTime()).toLessThanOrEqual(afterUpdate.getTime());
    });

    test('should throw for non-existent user', async () => {
      expect(async () => {
        await userService.getUserById(99999);
      }).rejects.toThrow('not found');
    });
  });

  describe('Password Security', () => {
    const passwordHandler = new PasswordHandler();

    test('should hash password', async () => {
      const password = 'SecurePass123!';
      const hash = await passwordHandler.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(password.length);
    });

    test('should verify correct password', async () => {
      const password = 'SecurePass123!';
      const hash = await passwordHandler.hashPassword(password);

      const isValid = await passwordHandler.verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const password = 'SecurePass123!';
      const hash = await passwordHandler.hashPassword(password);

      const isValid = await passwordHandler.verifyPassword('WrongPass123!', hash);
      expect(isValid).toBe(false);
    });

    test('should generate different hash for same password', async () => {
      const password = 'SecurePass123!';
      const hash1 = await passwordHandler.hashPassword(password);
      const hash2 = await passwordHandler.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('End-to-End Workflow', () => {
    const authService = new AuthService(AppDataSource);
    const userService = new UserService(AppDataSource);

    test('should complete full registration and login workflow', async () => {
      // 1. Register new user
      const registerResult = await authService.register({
        email: 'e2e@example.com',
        password: 'SecurePass123!',
        firstName: 'End',
        lastName: 'ToEnd'
      });

      expect(registerResult.success).toBe(true);
      const userId = registerResult.user.id;

      // 2. Verify user can be retrieved
      const user = await userService.getUserById(userId);
      expect(user.email).toBe('e2e@example.com');

      // 3. Verify tokens are valid
      const accessPayload = authService.verifyToken(registerResult.accessToken);
      expect(accessPayload.userId).toBe(userId);

      // 4. Perform logout
      const logoutResult = await authService.logout(
        registerResult.accessToken,
        registerResult.refreshToken
      );
      expect(logoutResult.success).toBe(true);

      // 5. Login again
      const loginResult = await authService.login({
        email: 'e2e@example.com',
        password: 'SecurePass123!'
      });

      expect(loginResult.success).toBe(true);
      expect(loginResult.accessToken).toBeDefined();

      // 6. Verify new tokens work
      const newPayload = authService.verifyToken(loginResult.accessToken);
      expect(newPayload.userId).toBe(userId);
    });

    test('should handle concurrent operations safely', async () => {
      const promises = [];

      // Register multiple users concurrently
      for (let i = 0; i < 5; i++) {
        promises.push(
          authService.register({
            email: `concurrent${i}@example.com`,
            password: 'SecurePass123!',
            firstName: `Concurrent`,
            lastName: `User${i}`
          })
        );
      }

      const results = await Promise.all(promises);

      // All should succeed
      expect(results.length).toBe(5);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });

      // All should have unique IDs
      const ids = results.map(r => r.user.id);
      expect(new Set(ids).size).toBe(5);
    });
  });

  describe('Configuration', () => {
    test('should load environment configuration', () => {
      const config = new Config();

      expect(config.JWT_SECRET_KEY).toBeDefined();
      expect(config.JWT_ALGORITHM).toBeDefined();
      expect(config.JWT_ACCESS_TOKEN_EXPIRY_MINUTES).toBeGreaterThan(0);
      expect(config.JWT_REFRESH_TOKEN_EXPIRY_DAYS).toBeGreaterThan(0);
      expect(config.DATABASE_URL).toBeDefined();
    });

    test('should validate configuration in production', () => {
      process.env.MODE = 'production';
      process.env.JWT_SECRET_KEY = 'change-me-in-production';

      expect(() => {
        const config = new Config();
        config.validate();
      }).toThrow('JWT_SECRET_KEY must be set in production');

      process.env.MODE = 'development';
    });
  });
});
