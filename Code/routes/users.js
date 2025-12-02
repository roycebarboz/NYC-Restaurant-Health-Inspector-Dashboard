import {Router} from 'express';
import { createUsers } from '../data/users';
const router = Router();


router.route('/').get(async (req, res) => {
    try{
    res.render('login',{title:"Login"});
    }
    catch(e){
    res.status(500).send(e);
    }
});

router
    .route('/register')
    .get(async (req, res) => {
    try{
    res.render('register',{title:"Register"});
    }
    catch(e){
    res.status(500).send(e);
    }
    })
    .post(async (req, res) => {
    try{
        const { username, email, password, profile} = req.body;
        const result = await createUsers(username,email,password,profile);

        res.render('login',{
            title: "Login",
            registrationCompleted: true
        });
    }
    catch(e){
        res.status(400).render('error',{
            title:'Register',
            error:e.message
        });
    }
});

router.route('/user').get(async (req, res) => {
    try{
    res.render('user',{title:"User"});
    }
    catch(e){
    res.status(500).send(e);
    }
});

router.route('/signout').get(async (req, res) => {
    try{
    res.render('signout',{title:"User"});
    }
    catch(e){
    res.status(500).send(e);
    }
});

router.route('/profile').get(async (req, res) => {
    try{
    res.render('[user_profile',{title:"Profile"});
    }
    catch(e){
    res.status(500).send(e);
    }
});

export default router;