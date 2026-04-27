import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Amana Mart API',
      version: '1.0.0',
      description: 'API documentation for Amana Mart Super App backend.',
      contact: {
        name: 'Amana Mart Support',
        email: 'support@amanamart.com',
      },
    },
    servers: [
      {
        url: process.env.BACKEND_URL || 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://amana-mart-backend.onrender.com',
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
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/**/*.ts', './src/**/*.js'], // files containing annotations as above
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  // Swagger Page
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  app.get('/api/docs-json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Docs in YAML format
  app.get('/api/docs-yaml', (req, res) => {
    res.setHeader('Content-Type', 'text/yaml');
    res.send(require('yaml').stringify(swaggerSpec));
  });

  console.log('📖 Swagger documentation initialized at /api/docs');
};
