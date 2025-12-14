import {Router} from 'express';
import * as userfunc from '../data/users.js';
import {redirect,loginRedirect} from "../middleware/Auth.js"
const router = Router();


router.route('/').get(loginRedirect,async (req, res) => {
    try{
    res.render('landing_page', 
        {
            title:"Inspectify - Landing Page"
        });
    }
    catch(e){
    res.status(500).send(e);
    }
});

router
    .route('/login')
    .get(redirect, async (req, res) => {
        try{
            res.render('login',{title:"Inspectify - Login"});
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
        _id: loginUser._id.toString(),
        username : loginUser.username,
        email : loginUser.email
        }

        return res.redirect("/")
    }
    catch(e){
        return res.status(400).render("login",{
        title: 'Inspectify - Login',
        error: e.message,
        email
        });
    }
    });

router
    .route('/register')
    .get(redirect,async (req, res) => {
    try{
        res.render('register',{title:"Inspectify - Register"});
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
            title: "Inspectify - Register",
            error: "Internal Server Error",
            ...req.body
            });
        }
    }
    catch(e){
        return res.status(400).render('register',{
            title:'Inspectify - Register',
            error:e.message,
            ...req.body
            });
        }
    });

router.route('/user_profile').get(loginRedirect, async (req, res) => {
    try{
    const user = res.locals.user;
    res.render('user_profile',{title:`Inspectify - ${user.username} Profile`});
    }
    catch(e){
    res.status(500).send(e);
    }
});

router.route('/signout').get(loginRedirect, (req, res) => {
    req.session.destroy(() => {
    res.redirect('/login')
    });
});

export default router;