import Trip from './schemas/trips.js';

const getAllTrips = async () => {
    return await Trip.find({}).lean();
};  

const getTripById = async (id) => {
    return await Trip.findOne({ id }, { _id: 0 }).lean();
};

export {
    getAllTrips,
    getTripById
}

