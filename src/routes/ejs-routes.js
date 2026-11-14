import { Router } from 'express';
import { trainsPage } from '../controllers/trains.js';
import { homePage, aboutPage, testErrorPage } from './index.js';
import railTripsRouter from './trips.js';

// Routes that render EJS pages.
const router = Router();

// Home page
router.get('/', homePage);

// About page
router.get('/about', aboutPage);

// Trains page (the train cards are loaded in the browser from /api/trains)
router.get('/trains', trainsPage);

// Rail trips (Feature Set 1 moves these handlers into controllers/trips.js)
router.use('/trips', railTripsRouter);

// Test 500 error page
router.get('/500', testErrorPage);

export default router;
