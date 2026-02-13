import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './config';
import routes from './routes';
import { errorHandler, notFoundHandler, apiLimiter } from './middlewares';
import { logger } from './utils/logger';


// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AccuDocs API',
      version: '1.0.0',
      description: 'Accountant Client Document Management System API',
      contact: {
        name: 'AccuDocs Support',
        email: 'support@accudocs.example.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}/api/${config.apiVersion}`,
        description: 'Development server',
      },
      {
        url: process.env.PUBLIC_API_URL ? `${process.env.PUBLIC_API_URL}/api/${config.apiVersion}` : `https://accudocs.onrender.com/api/${config.apiVersion}`,
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [config.nodeEnv === 'production' ? './dist/routes/*.js' : './src/routes/*.ts'],
};

export const createApp = (): Application => {
  // Generate Swagger spec inside createApp to avoid blocking import
  const swaggerSpec = swaggerJsdoc(swaggerOptions);

  const app = express();

  // Trust proxy for rate limiting and IP detection
  app.set('trust proxy', 1);

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // CORS configuration
  app.use(cors({
    origin: config.cors.origin.split(',').map((origin) => origin.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));

  // Compression
  app.use(compression());

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Request logging
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
  });

  // Rate limiting
  app.use(`/api/${config.apiVersion}`, apiLimiter);

  // Swagger documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'AccuDocs API Documentation',
  }));

  // API routes
  app.use(`/api/${config.apiVersion}`, routes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
