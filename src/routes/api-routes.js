import { Router } from 'express';
import { getAllTrains, getTrainById } from '../controllers/trains.js';

// Routes that send JSON. This router is mounted at /api in router.js,
// so '/trains' here is served as /api/trains.
// Each route has an @openapi comment that Swagger reads (see src/swagger.js).
const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Train:
 *       type: object
 *       properties:
 *         id: { type: string, example: series-e353 }
 *         name: { type: string, example: Series E353 Limited Express }
 *         operator: { type: string, example: JR East }
 *         imageUrl: { type: string, example: /images/trains/series-e353-limited-express.png }
 *         imageAlt: { type: string }
 *         type: { type: string, example: Limited Express }
 *         maxSpeedKmh: { type: number, example: 130 }
 *         capacity: { type: number, example: 360 }
 *         powerSource: { type: string, example: Electric }
 *         bestFor: { type: string }
 *         description: { type: string }
 */

/**
 * @openapi
 * /api/trains:
 *   get:
 *     tags: [Trains]
 *     summary: List all trains
 *     responses:
 *       200:
 *         description: An object with the list of trains
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trains:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Train' }
 *       500:
 *         description: Unexpected server or database error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/trains', getAllTrains);

/**
 * @openapi
 * /api/trains/{id}:
 *   get:
 *     tags: [Trains]
 *     summary: Get one train by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         example: series-e353
 *     responses:
 *       200:
 *         description: The train
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Train' }
 *       404:
 *         description: No train has this id
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       500:
 *         description: Unexpected server or database error
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/trains/:id', getTrainById);

export default router;
