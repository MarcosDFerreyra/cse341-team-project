
import station from "./schemas/stations.js";

// Retrieve all stations.
export async function getAllStations() {
    return station.find({}).lean();
}

// Retrieve one station using its custom ID.
export async function getStationById(id) {
    return station.findOne({ id }).lean();
}
