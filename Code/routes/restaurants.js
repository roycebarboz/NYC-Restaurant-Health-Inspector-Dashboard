import { Router } from 'express';
import { SearchRestaurants, GetRestaurantbyID } from '../data/restaurants.js';
const router = Router();

//GET /restaurants/search
//first we write a object to store the filters to put in mongoDB query
//then we put the filters in the the SearchRestaurants function
//throw an error if the filters are not valid
//return the results
router.get('/search', async (req, res) => {
    try {
        const filters = {
            name: req.query.name,
            borough: req.query.borough,
            cuisineType: req.query.cuisineType,
            grade: req.query.grade,
            zipcode: req.query.zipcode,
            minScore: req.query.minScore ? parseInt(req.query.minScore) : undefined,
            maxScore: req.query.maxScore ? parseInt(req.query.maxScore) : undefined,
            page: req.query.page,
            restaurant_per_page: req.query.restaurant_per_page
        };

        const result = await SearchRestaurants(filters);

        res.render('search_results', {
            title: 'Search Results',
            restaurants: result.restaurants,
            pagination: result.pagination,
            filters: filters
        });
    } catch (error) {
        res.status(400).render('error', {
            title: 'Search Error',
            error: error.toString()
        });
    }
});

//GET /restaurants/:id
//first we get the id from the request parameters
//then we put the id in the GetRestaurantbyID function
//throw an error if the id is not valid
//return the result
router.get('/:id', async (req, res) => {
    try {
        const restaurantId = req.params.id;
        const result = await GetRestaurantbyID(restaurantId);

        res.render('restaurant_detail', {
            title: result.restaurant.name,
            restaurant: result.restaurant,
            inspections: result.inspections,
            reviews: result.reviews
        });
    } catch (error) {
        res.status(404).render('error', {
            title: 'Restaurant Not Found',
            error: error.toString()
        });
    }
});

export default router;