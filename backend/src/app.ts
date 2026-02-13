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

  // CORS configuration - Moved to top and made more robust
  const allowedOrigins = config.cors.origin.split(',').map((origin) => origin.trim()).filter(Boolean);

  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some(allowed => {
        if (allowed === '*') return true;
        // Exact match
        if (allowed === origin) return true;
        // Match without trailing slash (some browsers or tools might be inconsistent)
        if (allowed.replace(/\/$/, '') === origin.replace(/\/$/, '')) return true;
        return false;
      });

      if (isAllowed || config.nodeEnv === 'development') {
        callback(null, true);
      } else {
        // Fallback for GitHub Pages and common subdomains
        if (origin.includes('github.io') || origin.includes('onrender.com')) {
          callback(null, true);
        } else {
          logger.warn(`CORS blocked for origin: ${origin}`);
          callback(null, false);
        }
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    optionsSuccessStatus: 204
  }));

  // Security middleware - Adjusted for CORS compatibility
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", ...allowedOrigins],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: false
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
