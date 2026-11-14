import Path from 'path';
import { fileURLToPath } from 'url';
import swaggerJsdoc from 'swagger-jsdoc';

const __dirname = Path.dirname(fileURLToPath(import.meta.url));

// Builds the OpenAPI document from the @openapi comments in api-routes.js.
// Add the Swagger comment above each new API route and it appears at /api-docs.
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kizuna Rail API',
      version: '1.0.0',
      description: 'JSON endpoints used by the Kizuna Rail pages.'
    },
    // Relative URL, so the same document works locally and on Render.
    servers: [{ url: '/' }],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Train not found' }
          }
        }
      }
    }
  },
  apis: [Path.join(__dirname, 'routes', 'api-routes.js')]
});

export default swaggerSpec;
