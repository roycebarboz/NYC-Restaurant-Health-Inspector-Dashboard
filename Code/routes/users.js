import { Router } from 'express';
import * as userfunc from '../data/users.js';
import * as restaurantfunc from '../data/restaurants.js';
import { redirect, loginRedirect } from "../middleware/Auth.js";
import { dbConnection } from '../config/mongoConnection.js';
import { ObjectId } from 'mongodb';
import * as helperfunc from '../helpers.js';
const router = Router();


router.route('/').get(loginRedirect, async (req, res) => {
    try {
        res.render('landing_page',
            {
                title: "Inspectify - Landing Page"
            });
    }
    catch (e) {
        res.status(500).send(e);
    }
});

router
    .route('/login')
    .get(redirect, async (req, res) => {
        try {
            res.render('login', { title: "Inspectify - Login" });
        }
        catch (e) {
            res.status(500).send(e);
        }
    })
    .post(async (req, res) => {
        let { email, password } = req.body;

        try {
            const loginUser = await userfunc.loginUser(email, password);

            req.session.user = {
                _id: loginUser._id.toString(),
                username: loginUser.username,
                email: loginUser.email
            }

            return res.redirect("/")
        }
        catch (e) {
            return res.status(400).render("login", {
                title: 'Inspectify - Login',
                error: e.message,
                email
            });
        }
    });

router
    .route('/register')
    .get(redirect, async (req, res) => {
        try {
            res.render('register', { title: "Inspectify - Register" });
        }
        catch (e) {
            res.status(500).send(e);
        }
    })
    .post(async (req, res) => {
        let { username, email, password, firstName, lastName, dateOfBirth } = req.body;

        try {
            const profile = {
                firstName,
                lastName,
                dateOfBirth
            }
            const result = await userfunc.createUsers(username, email, password, profile);

            if (result.registrationCompleted === true) { return res.redirect("/login"); }
            else {
                return res.status(500).render("register", {
                    title: "Inspectify - Register",
                    error: "Internal Server Error",
                    ...req.body
                });
            }
        }
        catch (e) {
            return res.status(400).render('register', {
                title: 'Inspectify - Register',
                error: e.message,
                ...req.body
            });
        }
    });

router.route('/user_profile').get(loginRedirect, async (req, res) => {
    try {
        const sessionUser = res.locals.user;

        const fullUser = await userfunc.GetUserbyID(sessionUser._id);

        let favoriteRestaurant = null;
        if (fullUser.favoriteRestaurantIds && fullUser.favoriteRestaurantIds.length > 0) {
            try {
                const firstFavoriteId = fullUser.favoriteRestaurantIds[0];
                const restaurantId = typeof firstFavoriteId === 'object' ? firstFavoriteId.toString() : firstFavoriteId;
                const restaurantData = await restaurantfunc.GetRestaurantbyID(restaurantId);
                favoriteRestaurant = restaurantData.restaurant;
                if (!favoriteRestaurant.grade && favoriteRestaurant.currentGrade) {
                    favoriteRestaurant.grade = favoriteRestaurant.currentGrade;
                }
            } catch (error) {
                console.error('Error fetching favorite restaurant:', error);
            }
        }

        const user = {
            ...sessionUser,
            profile: fullUser.profile
        };

        res.render('user_profile', {
            title: `Inspectify - ${user.username} Profile`,
            user: user,
            favoriteRestaurant: favoriteRestaurant
        });
    }
    catch (e) {
        res.status(500).render('error', {
            title: 'Inspectify - Error',
            error: e.message
        });
    }
});

router.route('/user_profile/edit')
    .get(loginRedirect, async (req, res) => {
        try {
            const sessionUser = res.locals.user;
            const fullUser = await userfunc.GetUserbyID(sessionUser._id);

            const user = {
                ...sessionUser,
                profile: fullUser.profile
            };

            res.render('user_profile_edit', {
                title: `Inspectify - Edit Profile`,
                user: user
            });
        }
        catch (e) {
            res.status(500).render('error', {
                title: 'Inspectify - Error',
                error: e.message
            });
        }
    })
    .post(loginRedirect, async (req, res) => {
        try {
            const sessionUser = res.locals.user;
            const { firstName, lastName, dateOfBirth } = req.body;

            const updatedProfile = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                dateOfBirth: dateOfBirth.trim()
            };

            const validatedProfile = helperfunc.profilecheck(updatedProfile);

            const db = await dbConnection();
            const usersCollection = db.collection("users");
            const userId = new ObjectId(sessionUser._id);

            const updateResult = await usersCollection.updateOne(
                { _id: userId },
                { $set: { profile: validatedProfile } }
            );

            if (updateResult.matchedCount === 0) {
                throw new Error("User not found");
            }

            return res.redirect('/user_profile');
        }
        catch (e) {
            const sessionUser = res.locals.user;
            const fullUser = await userfunc.GetUserbyID(sessionUser._id);
            const user = {
                ...sessionUser,
                profile: fullUser.profile
            };

            return res.status(400).render('user_profile_edit', {
                title: 'Inspectify - Edit Profile',
                error: e.message,
                user: user,
                ...req.body
            });
        }
    });

router.route('/favorites/:restaurantId').post(loginRedirect, async (req, res) => {
    try {
        const sessionUser = res.locals.user;
        const restaurantId = req.params.restaurantId;

        if (!restaurantId || restaurantId.trim().length === 0) {
            return res.status(400).json({ error: 'Restaurant ID is required' });
        }

        const fullUser = await userfunc.GetUserbyID(sessionUser._id);

        const favoriteIds = (fullUser.favoriteRestaurantIds || []).map(id =>
            typeof id === 'object' ? id.toString() : id.toString()
        );

        const restaurantIdStr = restaurantId.trim();
        const isFavorite = favoriteIds.includes(restaurantIdStr);

        let updatedFavorites;
        if (isFavorite) {
            updatedFavorites = favoriteIds.filter(id => id !== restaurantIdStr);
        } else {
            updatedFavorites = [...favoriteIds, restaurantIdStr];
        }

        const db = await dbConnection();
        const usersCollection = db.collection("users");
        const userId = new ObjectId(sessionUser._id);

        const updatedFavoriteObjectIds = updatedFavorites.map(id => new ObjectId(id));

        const updateResult = await usersCollection.updateOne(
            { _id: userId },
            { $set: { favoriteRestaurantIds: updatedFavoriteObjectIds } }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.json({
            success: true,
            isFavorite: !isFavorite,
            message: !isFavorite ? 'Added to favorites' : 'Removed from favorites'
        });
    }
    catch (e) {
        console.error('Error updating favorites:', e);
        return res.status(500).json({ error: e.message });
    }
});

router.route('/favorites').get(loginRedirect, async (req, res) => {
    try {
        const sessionUser = res.locals.user;
        const fullUser = await userfunc.GetUserbyID(sessionUser._id);

        let favoriteRestaurants = [];
        if (fullUser.favoriteRestaurantIds && fullUser.favoriteRestaurantIds.length > 0) {
            try {
                for (const favoriteId of fullUser.favoriteRestaurantIds) {
                    const restaurantId = typeof favoriteId === 'object' ? favoriteId.toString() : favoriteId;
                    const restaurantData = await restaurantfunc.GetRestaurantbyID(restaurantId);
                    const restaurant = restaurantData.restaurant;
                    if (!restaurant.grade && restaurant.currentGrade) {
                        restaurant.grade = restaurant.currentGrade;
                    }
                    favoriteRestaurants.push(restaurant);
                }
            } catch (error) {
                console.error('Error fetching favorite restaurants:', error);
            }
        }

        res.render('favorites', {
            title: 'Inspectify - My Favorites',
            favoriteRestaurants: favoriteRestaurants
        });
    }
    catch (e) {
        res.status(500).render('error', {
            title: 'Inspectify - Error',
            error: e.message
        });
    }
});

router.route('/signout').get(loginRedirect, (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login')
    });
});

export default router;