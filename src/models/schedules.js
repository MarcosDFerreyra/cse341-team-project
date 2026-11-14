// src/models/schedules.js
import schedule from './schemas/schedules.js';
import { getTripById } from './trips.js';

/**
 * Gets the schedules for a trip, optionally limited to a month.
 *
 * Schedules do not store months. A trip's operatingMonths decide which months
 * its schedules run in, so a month the trip does not operate in has no schedules.
 *
 * @param {string} tripId - The trip id, such as "alpine-panorama".
 * @param {number} [month] - Optional month number from 1 to 12.
 * @returns {Promise<Array|null>} The schedules (possibly empty), or null if the trip does not exist.
 */
const getSchedulesByTripId = async (tripId, month) => {
    const trip = await getTripById(tripId);

    if (!trip) {
        return null;
    }

    const operatingMonths = trip.operatingMonths ?? [];

    if (month !== undefined && !operatingMonths.includes(month)) {
        return [];
    }

    return schedule
        .find({ tripId })
        .select('-_id -__v')
        .sort({ departureTime: 1, id: 1 })
        .lean();
};

export { getSchedulesByTripId };
