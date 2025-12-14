import {Router} from 'express';
import {loginRedirect} from "../middleware/Auth.js"
import * as restaurants from "../data/restaurants.js"
const router = Router();

router
    .route('/search')
        .get(loginRedirect, async(req,res)=>{
            try{
                const results = await restaurants.SearchRestaurants(req.query);
                const {page,totalPages} = results.pagination;

                const basefilters = new URLSearchParams(req.query);
                basefilters.delete('page');

                const URL = (p) => {
                    const params = new URLSearchParams(basefilters);
                    params.set('page',String(p));
                    return `/restaurants/search?${params.toString()}`;
                };

                res.render('search_results',{
                    title: "Inspectify - Search Results",
                    restaurants: results.restaurants,
                    pagination: results.pagination,
                    filter: req.query,
                    pagination: results.pagination,
                    prevUrl: page > 1 ? URL(page - 1) : null,
                    nextUrl: page < totalPages ? URL(page + 1) : null
                });
            }catch(e){
                res.status(400).render('search_results', {
                title: 'Search Results',
                error: e.message
                });
            }
        })
        .post(loginRedirect, (req,res)=>{
            const query = new URLSearchParams();
            const name = req.body.name;
            const filters = req.body.filters ?? {};
            
            if (name?.trim()){query.append("name",name.trim());}

            if (filters){
                for (const [filter,filtername] of Object.entries(filters)){ query.append(filter,filtername)}
            }
            
            if (query.toString() === ''){
                res.redirect('/');
            }
            return res.redirect(`/restaurants/search?${query.toString()}`);
        })

router
    .route('/featured').get(async(req,res) => {
        /*
        //test code
        return res.json([
        {
        _id: 'mock1',
        name: 'Test Restaurant A',
        image: '/public/images/no_image_1.png'
        },
        {
        _id: 'mock2',
        name: 'Test Restaurant B',
        image: '/public/images/no_image_1.png'
        },
        {
        _id: 'mock3',
        name: 'Test Restaurant C',
        image: '/public/images/no_image_1.png'
        }
    ]);*/
        try{
            const results = await restaurants.SearchRestaurants({
            grade: 'A',
            restaurant_per_page: 3,
            page: 1
            });
            res.json(results.restaurants);
        }
        catch(e){
            res.status(500).json({ error: 'Failed to load featured restaurants'});
        }
    })

export default router;