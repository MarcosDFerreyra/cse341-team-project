import { getDashboardPath } from '../includes/helpers.js';

/**
 * Helper function to set all expected res.locals values
 */
const setLocalVariables = (req, res, next) => {
    // Make NODE_ENV available to all templates
    res.locals.NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';

    // Make any query parameters available to all templates
    res.locals.query = req.query;

    // Make the signed-in user's dashboard path available to all templates (null when signed out)
    res.locals.dashboardPath = req.user ? getDashboardPath(req.user.role) : null;

    next();
};

export default setLocalVariables;