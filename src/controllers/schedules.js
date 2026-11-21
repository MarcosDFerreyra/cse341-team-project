// src/controllers/schedules.js
import { getSchedulesByTripId } from '../models/schedules.js';

const MIN_MONTH = 1;
const MAX_MONTH = 12;

// Returns the month as a number from 1 to 12, or null if the value is not valid.
const parseMonth = (value) => {
    if (typeof value !== 'string' || !/^\d{1,2}$/.test(value)) {
        return null;
    }

    const month = Number(value);

    return month >= MIN_MONTH && month <= MAX_MONTH ? month : null;
};

const respondWithSchedules = async (res, tripId, month) => {
    try {
        const schedules = await getSchedulesByTripId(tripId, month);

        if (schedules === null) {
            return res.status(404).json({
                error: 'Trip not found'
            });
        }

        return res.status(200).json(schedules);
    } catch (error) {
        console.error('Error fetching schedules:', error);

        return res.status(500).json({
            error: 'Failed to fetch schedules'
        });
    }
};

const getSchedulesForTrip = async (req, res) => {
    return respondWithSchedules(res, req.params.id);
};

const getSchedulesForTripAndMonth = async (req, res) => {
    const month = parseMonth(req.query.month);

    if (month === null) {
        return res.status(400).json({
            error: 'month must be a whole number from 1 to 12'
        });
    }

    return respondWithSchedules(res, req.params.id, month);
};

export { getSchedulesForTrip, getSchedulesForTripAndMonth };
