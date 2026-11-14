import { Router } from 'express';
import apiRoutes from './api-routes.js';
import ejsRoutes from './ejs-routes.js';

const router = Router();

// JSON API endpoints: /api/...
router.use('/api', apiRoutes);

// Pages rendered with EJS
router.use('/', ejsRoutes);

export default router;
