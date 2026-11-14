// src/routes/api-routes.js
// Routes that expose JSON API endpoints. This router is mounted at /api.
import { Router } from 'express';
import { getSchedulesForTrip, getSchedulesForTripAndMonth } from '../controllers/schedules.js';

const router = Router();

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
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 */

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
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: month must be a whole number from 1 to 12
 *       404:
 *         description: No trip exists with that id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Trip not found
 *       500:
 *         description: Unexpected server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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

router.get('/trips/:id/schedules', getTripSchedules);

export default router;
