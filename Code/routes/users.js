import {Router} from 'express';
import * as userfunc from '../data/users.js';
import * as middlefunc from "../middleware/Auth.js"
const router = Router();


router.route('/').get(middlefunc.loginRedirect,async (req, res) => {
    try{
    const user = req.session.user || null;
    res.render('landing_page', 
        {
            title:"Landing Page",
            user
        });
    }
    catch(e){
    res.status(500).send(e);
    }
});

router
    .route('/login')
    .get(middlefunc.redirect, async (req, res) => {
        try{
            res.render('login',{title:"Login"});
        }
        catch(e){
        res.status(500).send(e);
        }
    })
    .post(async (req, res) => {
    let {email,password} = req.body;

    try{
        const loginUser = await userfunc.loginUser(email,password);

        req.session.user = {
        username : loginUser.username,
        email : loginUser.email,
        profile: loginUser.profile,
        reviewIds:loginUser.reviewIds,
        favoriteRestaurantIds:loginUser.favoriteRestaurantIds,
        createdAt: loginUser.createdAt,
        lastLogin: loginUser.lastLogin
        }

        return res.redirect("/")
    }
    catch(e){
        return res.status(400).render("login",{
        title: 'Login',
        error: e.message,
        email
        });
    }
    });

router
    .route('/register')
    .get(middlefunc.redirect,async (req, res) => {
    try{
        res.render('register',{title:"Register"});
    }
    catch(e){
        res.status(500).send(e);
    }
    })
    .post(async (req, res) => {
    let { username, email, password, firstName, lastName, dateOfBirth} = req.body;
    
    try{
        const profile = {
            firstName,
            lastName,
            dateOfBirth
        }
    const result = await userfunc.createUsers(username,email,password,profile);
    
    if (result.registrationCompleted===true){return res.redirect("/login");}
    else{
        return res.status(500).render("register",{
            title: "Register",
            error: "Internal Server Error",
            ...req.body
            });
        }
    }
    catch(e){
        return res.status(400).render('register',{
            title:'Register',
            error:e.message,
            ...req.body
            });
        }
    });

router.route('/user_profile').get(middlefunc.loginRedirect, async (req, res) => {
    try{
    res.render('user_profile',{title:"User"});
    }
    catch(e){
    res.status(500).send(e);
    }
});

router.route('/signout').get(middlefunc.signingout, (req, res) => {
    req.session.destroy(() => {
    res.render("signout",{
        title:"Signed Out"
        });
    });
});

export default router;