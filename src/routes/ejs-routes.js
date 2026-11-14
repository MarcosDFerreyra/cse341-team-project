import { Router } from 'express';
import { tripDetails, listTripsPage } from '../controllers/trips.js';

const routerEjs = Router();

routerEjs.get('/', listTripsPage);

routerEjs.get('/:tripId', tripDetails);

export default routerEjs;