import { Router } from 'express';
import { getAllTripsApi, getTripByIdApi } from '../controllers/trips.js';
import { getSchedulesForTrip, getSchedulesForTripAndMonth } from '../controllers/schedules.js';
import { getMyBookings } from '../controllers/bookings.js';
import { requireApiLogin } from '../middleware/auth.js';

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
 * components:
 *   schemas:
 *     Schedule:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         tripId:
 *           type: string
 *           example: alpine-panorama
 *         departureTime:
 *           type: string
 *           description: 24-hour time in HH:MM format
 *           example: '08:30'
 *         arrivalTime:
 *           type: string
 *           description: 24-hour time in HH:MM format
 *           example: '13:00'
 *         daysOfWeek:
 *           type: array
 *           items:
 *             type: string
 *             enum: [monday, tuesday, wednesday, thursday, friday, saturday, sunday]
 *           example: [monday, tuesday, wednesday, thursday, friday]
 *         status:
 *           type: boolean
 *           example: true
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
 * /api/trips/{id}/schedules:
 *   get:
 *     summary: Get the schedules for a trip
 *     description: >
 *       Returns the schedules for a trip, sorted by departure time. If the month
 *       query parameter is included, returns the schedules only when the trip
 *       operates in that month; otherwise the list is empty.
 *     tags:
 *       - Schedules
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The trip id (for example, alpine-panorama)
 *         schema:
 *           type: string
 *       - in: query
 *         name: month
 *         required: false
 *         description: Month number from 1 (January) to 12 (December)
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *     responses:
 *       200:
 *         description: A list of schedules (empty if the trip has none for the requested month)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Schedule'
 *       400:
 *         description: The month query parameter is not a whole number from 1 to 12
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: month must be a whole number from 1 to 12
 *       404:
 *         description: No trip exists with that id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Trip not found
 *       500:
 *         description: Unexpected server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Failed to fetch schedules
 */
const getTripSchedules = (req, res) => {
    // The same URL serves both controller functions; the month parameter picks one.
    if (req.query.month !== undefined) {
        return getSchedulesForTripAndMonth(req, res);
    }

    return getSchedulesForTrip(req, res);
};

apiRouter.get('/trips/:id/schedules', getTripSchedules);

/**
 * @openapi
 * components:
 *   schemas:
 *     MyBooking:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Booking reference
 *           example: JR4K2M9XQ
 *         tripId:
 *           type: string
 *           example: alpine-panorama
 *         tripName:
 *           type: string
 *           example: Alpine Panorama Express
 *         ticketClass:
 *           type: string
 *           example: standard
 *         selectedDay:
 *           type: string
 *           example: monday
 *         passengerCount:
 *           type: integer
 *           example: 2
 *         createdAt:
 *           type: string
 *           description: ISO 8601 date and time the booking was made
 *           example: '2026-11-20T14:05:00.000Z'
 */

/**
 * @openapi
 * /api/users/me/bookings:
 *   get:
 *     summary: Get the signed-in user's bookings
 *     description: >
 *       Returns the bookings where one of the passengers has the same email address
 *       as the signed-in user, newest first. Requires a signed-in session (cookie).
 *       The email comes from the user's account, not from the request.
 *     tags:
 *       - Bookings
 *     responses:
 *       200:
 *         description: A list of bookings (empty if the user has none)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MyBooking'
 *       401:
 *         description: Not signed in, or the signed-in user no longer exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: Authentication required
 *       500:
 *         description: Unexpected server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: Failed to fetch bookings
 */
apiRouter.get('/users/me/bookings', requireApiLogin, getMyBookings);

export default apiRouter;