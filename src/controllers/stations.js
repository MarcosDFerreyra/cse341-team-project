
import {
    getAllStations as fetchAllStations,
    getStationById as fetchStationById
} from '../models/stations.js';

// Get all stations.
const getAllStations = async (req, res) => {
    try {
        const stations = await fetchAllStations();
        return res.status(200).json(stations);
    } catch (error) {
        console.log("GET/stations failed");
        return res.status(500).json({
            error: "Internal Server error",
            message: error.message
        });
    }
};

// Get one station by its custom ID.
const getStationById = async (req, res) => {
    const id = req.params.id;

    try {
        const station = await fetchStationById(id);

        if (!station) {
            return res.status(404).json({ error: `Station ${id} not found` });
        }

        return res.status(200).json(station);
    } catch (error) {
        console.log(`GET/stations/${id} failed`);
        return res.status(500).json({
            error: "Internal Server error",
            message: error.message
        });
    }
};

export { getAllStations, getStationById };
