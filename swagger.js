import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDocs = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: "Kizuna Rail API",
            version: '1.0.0',
            description: "API documentation for Kizuna Rail. A group project for CSE 341 Web Services at BYU-Idaho."
        }
    },
    apis: ['./src/routes/*.js']
});

const swaggerUse = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};

export default swaggerUse;