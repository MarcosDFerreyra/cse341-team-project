
import stations from './seeds/stations.json' with { type: 'json' };
import { closeDb, connectToDb } from './connect.js';

try {
    const db = await connectToDb();
    const collection = db.collection('stations');

    const existingStations = await collection.countDocuments();

    if (existingStations > 0) {
        console.log(`Import cancelled. Stations collection already contains ${existingStations} documents.`);
    } else {
        await collection.insertMany(stations);
        console.log(`Successfully imported ${stations.length} stations.`);
    }
} catch (error) {
    console.error('Station import failed:', error);
} finally {
    await closeDb();
}
