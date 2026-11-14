import { Router } from 'express';
import { getAllTripsApi, getTripByIdApi } from '../controllers/trips.js';
import { getAllTrains, getTrainById } from '../controllers/trains.js';

const apiRouter = Router();

/**
 * @openapi
 * tags:
 *   - name: Trips
 *     description: Rail trips offered by Kizuna Rail
 *
 * components:
 *   schemas:
 *     Trip:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - description
 *         - region
 *         - startStation
 *         - endStation
 *         - duration
 *         - distance
 *         - bestSeason
 *         - operatingMonths
 *       properties:
 *         id:
 *           type: string
 *           description: Custom slug id of the trip
 *           example: alpine-panorama
 *         name:
 *           type: string
 *           description: Display name of the trip
 *           example: Alpine Panorama Express
 *         description:
 *           type: string
 *           description: Short description of the trip
 *           example: Journey through the Japanese Alps with stunning mountain views and traditional villages.
 *         region:
 *           type: string
 *           description: Region where the trip takes place
 *           example: central
 *         startStation:
 *           type: string
 *           description: Id of the departure station
 *           example: nagoya
 *         endStation:
 *           type: string
 *           description: Id of the arrival station
 *           example: toyama
 *         duration:
 *           type: string
 *           description: Approximate travel time
 *           example: 4.5 hours
 *         distance:
 *           type: number
 *           description: Distance of the trip in kilometers
 *           minimum: 0
 *           example: 180
 *         highlights:
 *           type: array
 *           description: Main attractions along the trip
 *           items:
 *             type: string
 *           example:
 *             - Mount Tateyama views
 *             - Hida River gorge
 *             - Traditional alpine villages
 *         bestSeason:
 *           type: string
 *           description: Recommended season to take the trip
 *           example: autumn
 *         operatingMonths:
 *           type: array
 *           description: Months when the trip operates (1 = January, 12 = December)
 *           items:
 *             type: integer
 *             minimum: 1
 *             maximum: 12
 *           example: [4, 5, 6, 7, 8, 9, 10, 11]
 *         imageUrl:
 *           type: string
 *           description: Path to the trip image
 *           example: /images/routes/alpine-panorama.png
 *         imageAlt:
 *           type: string
 *           description: Alternative text for the trip image
 *           example: Alpine Panorama Express train in the Japanese Alps
 *
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Short message explaining what went wrong
 *       example:
 *         error: Internal server error
 */

/**
 * @openapi
 * /api/trips:
 *   get:
 *     summary: Get all trips
 *     description: Returns every trip stored in the database. Returns an empty array if there are no trips.
 *     tags: [Trips]
 *     responses:
 *       200:
 *         description: An array of trips
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trip'
 *       500:
 *         description: Unexpected server or database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Internal server error
 */
apiRouter.get('/trips', getAllTripsApi);

/**
 * @openapi
 * /api/trips/{id}:
 *   get:
 *     summary: Get a trip by id
 *     description: Returns a single trip that matches the given custom id.
 *     tags: [Trips]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Custom slug id of the trip
 *         schema:
 *           type: string
 *         example: alpine-panorama
 *     responses:
 *       200:
 *         description: The matching trip
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trip'
 *       404:
 *         description: No trip exists with the given id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Trip alpine-panorama not found
 *       500:
 *         description: Unexpected server or database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Internal server error
 */
apiRouter.get('/trips/:id', getTripByIdApi);


/**
 * @openapi
 * tags:
 *   - name: Trains
 *     description: Trains used on Kizuna Rail trips
 *
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
apiRouter.get('/trains', getAllTrains);

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
apiRouter.get('/trains/:id', getTrainById);

export default apiRouter;
