import {Router} from 'express';
import {loginRedirect} from "../middleware/Auth.js"
import * as restaurants from "../data/restaurants.js"
const router = Router();

router
    .route('/search')
        .get(loginRedirect, async(req,res)=>{
            try{
                const results = await restaurants.SearchRestaurants(req.query);

                res.render('search_results',{
                    title: "Inspectify - Search Results",
                    restaurants: results.restaurants,
                    pagination: results.pagination,
                    filter: req.query
                });
            }catch(e){
                res.status(400).render('search_results', {
                title: 'Search Results',
                error: e.message
                });
            }
        })
        .post(loginRedirect, (req,res)=>{
            const { filter, filter_text } = req.body;
            const query = new URLSearchParams();

            const text = filter_text?.trim();

            if (text) {
                query.append("name", text);
            }

            if (filter && filter != "name" && text) {
                query.append(filter, text);
            }

            return res.redirect(`/restaurants/search?${query.toString()}`);
        })

    .route('/featured').get(loginRedirect, async(req,res) => {
        try{
            let featured = await restaurants.SearchRestaurants({grade:'A'});
            featured = featured[pagination{restaurants_per_page:3,page:1}];
        }
        catch(e){
            res.status(500).json({ error: 'Failed to load featured restaurants' });
        }
    })

export default router;