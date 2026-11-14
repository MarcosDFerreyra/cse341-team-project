import { getAllTrips, getTripById } from '../models/trips.js';
import { getDb } from '../db/connect.js';

const getAllTripsApi = async (req, res) => {
    try {
        const trips = await getAllTrips();
        res.status(200).json(trips);
    }
    catch (error) { 
        console.log("GET/trips failed");
        return res.status(500).json({ error: "Internal Server error", message: error.message });
    }
};

const getTripByIdApi = async (req, res) => {
    const id = req.params.id;
    const trip = await getTripById(id);
    try {
        if (!trip) {
            return res.status(404).json({ error: `Trip ${id} not found`});
        }
        return res.status(200).json(trip);
    }
    catch (error) {
        console.log(`GET/trips/${id} failed`);
        return res.status(500).json({ error: "Internal Server error", message: error.message });
    }
}


const tripDetails = async (req, res) => {
    const { tripId } = req.params;
    const db = getDb();
    const details = await getTripById(tripId);
    if (!details) {
        return res.status(404).render('errors/404', { title: 'Page Not Found' });
    }
    details.schedules = await db.collection('schedules').find({ tripId }).toArray();

    res.render('trips/details', {
        title: 'Trip Details',
        details
    });
};

const listTripsPage =  async (req, res) => {
    const db = getDb();
    const [regions, seasons] = await Promise.all([
        db.collection('trips').distinct('region'),
        db.collection('trips').distinct('bestSeason')
    ]);

    res.render('trips/list', {
        title: 'Scenic Train Trips',
        regions,
        seasons
    });
};

export { getAllTripsApi, getTripByIdApi, tripDetails, listTripsPage };
