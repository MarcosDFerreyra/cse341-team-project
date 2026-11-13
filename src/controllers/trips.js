import { getAllTrips, getTripById } from '../models/trips.js';

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

export { getAllTripsApi, getTripByIdApi };
