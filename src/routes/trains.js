const trainsPage = (req, res) => {
    res.render('trains', { title: 'Trains' });
};

// The trains API (GET /api/trains) is in api-routes.js and controllers/trains.js.
export { trainsPage };
