//Here you will import route files and export them as used in previous labs

import restaurantsRoutes from './restaurants.js';
import usersRoutes from './users.js';
import inspectionsRoutes from './inspections.js';
import reviewsRoutes from './reviews.js';


const constructorMethod = (app) => {
    app.use('/restaurants', restaurantsRoutes);
    app.use('/', usersRoutes);
    app.use('/inspections', inspectionsRoutes);
    app.use('/reviews', reviewsRoutes);

    app.use(/(.*)/, (req, res) => {
        return res.status(404).json({ error: 'Not found' });
    });
};

export default constructorMethod;