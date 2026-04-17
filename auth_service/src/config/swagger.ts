import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Gym Management — Auth Service API',
      version: '1.0.0',
      description: `
## Как пользоваться

1. Нажмите **POST /auth/register** или **POST /auth/login** → кнопка **Try it out** → **Execute**
2. Скопируйте значение \`accessToken\` из ответа
3. Нажмите кнопку **Authorize** (вверху страницы, значок замка)
4. Вставьте токен в поле **Value** и нажмите **Authorize**
5. Теперь все защищённые эндпоинты будут выполняться с вашим токеном

## Два типа токенов

| Токен | Время жизни | Назначение |
|-------|------------|------------|
| **accessToken** | 15 минут | Отправляется с каждым запросом в заголовке \`Authorization: Bearer <token>\` |
| **refreshToken** | 30 дней | Используется **только** для получения нового \`accessToken\` через \`POST /auth/refresh\` |

Когда accessToken истекает → вызовите \`/auth/refresh\` с refreshToken → получите новую пару токенов.
      `,
      contact: { name: 'API Support', email: 'support@gymapp.io' },
    },
    servers: [
      { url: `http://localhost:${env.PORT}`, description: 'Локальный сервер (Docker)' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Вставьте accessToken, полученный при входе или регистрации. Пример: `Bearer eyJhbGci...`',
        },
      },
      schemas: {
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'name', 'role'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'ivan@example.com',
              description: 'Уникальный email адрес',
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 8,
              example: 'Str0ngP@ss1',
              description: 'Минимум 8 символов, одна заглавная буква, одна цифра',
            },
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              example: 'Иван Иванов',
              description: 'Полное имя пользователя',
            },
            role: {
              type: 'string',
              enum: ['admin', 'client'],
              example: 'client',
              description: 'Роль: client — обычный посетитель зала, admin — управляет системой',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'ivan@example.com' },
            password: { type: 'string', format: 'password', example: 'Str0ngP@ss1' },
          },
        },
        RefreshRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              description: 'Refresh token, полученный при входе или регистрации',
            },
          },
        },
        UserResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
            email: { type: 'string', format: 'email', example: 'ivan@example.com' },
            name: { type: 'string', example: 'Иван Иванов' },
            role: { type: 'string', enum: ['admin', 'client'], example: 'client' },
            createdAt: { type: 'string', format: 'date-time', example: '2026-04-01T10:00:00.000Z' },
            updatedAt: { type: 'string', format: 'date-time', example: '2026-04-01T10:00:00.000Z' },
          },
        },
        TokenPairResponse: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              description: 'JWT токен доступа. Срок жизни — 15 минут. Отправляется с каждым запросом.',
            },
            refreshToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              description: 'Токен обновления. Срок жизни — 30 дней. Используется только для получения нового accessToken.',
            },
            tokenType: { type: 'string', example: 'Bearer' },
            expiresIn: { type: 'string', example: '15m', description: 'Время жизни accessToken' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              description: 'Токен доступа. Срок жизни — 15 минут.',
            },
            refreshToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              description: 'Токен обновления. Срок жизни — 30 дней.',
            },
            tokenType: { type: 'string', example: 'Bearer' },
            expiresIn: { type: 'string', example: '15m' },
            user: { $ref: '#/components/schemas/UserResponse' },
          },
        },
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
        description: 'Регистрация, вход, обновление токена, выход',
      },
      {
        name: 'Users',
        description: 'Профиль текущего пользователя',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
