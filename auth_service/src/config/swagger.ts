import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

// ─────────────────────────────────────────────
//  Swagger / OpenAPI 3.0 Configuration
// ─────────────────────────────────────────────

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: '🏋️ Gym Management — Auth Service',
      version: '1.0.0',
      description:
        'Production-ready authentication microservice for the Gym Management System. ' +
        'Handles user registration, login, JWT token issuance, and identity verification.',
      contact: {
        name: 'API Support',
        email: 'support@gymapp.io',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Development server',
      },
      {
        url: 'https://api.gymapp.io',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token. Example: `Bearer eyJhbGci...`',
        },
      },
      schemas: {
        // ── Request Bodies ──────────────────────────────────
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'name', 'role'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com',
              description: 'Must be a valid, unique email address.',
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 8,
              example: 'Str0ngP@ssword!',
              description: 'Minimum 8 characters.',
            },
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              example: 'John Doe',
            },
            role: {
              type: 'string',
              enum: ['admin', 'client'],
              example: 'client',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'john.doe@example.com',
            },
            password: {
              type: 'string',
              format: 'password',
              example: 'Str0ngP@ssword!',
            },
          },
        },

        // ── Response Schemas ─────────────────────────────────
        UserResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
            email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
            name: { type: 'string', example: 'John Doe' },
            role: { type: 'string', enum: ['admin', 'client'], example: 'client' },
            createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:00:00.000Z' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              description: 'JWT access token. Pass this in the Authorization header.',
            },
            tokenType: { type: 'string', example: 'Bearer' },
            expiresIn: { type: 'string', example: '7d' },
            user: { $ref: '#/components/schemas/UserResponse' },
          },
        },

        // ── Error Schemas ─────────────────────────────────────
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string', example: 'VALIDATION_ERROR' },
                message: { type: 'string', example: 'Validation failed' },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: { type: 'string', example: 'email' },
                      message: { type: 'string', example: 'Invalid email format' },
                    },
                  },
                },
              },
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
          },
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints — register, login, and token management',
      },
      {
        name: 'Users',
        description: 'User profile and identity endpoints',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
