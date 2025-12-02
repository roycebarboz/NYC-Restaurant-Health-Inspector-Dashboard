import * as helperfunc from "../helpers.js"
import { dbConnection } from "../config/mongoConnection.js";
import { ObjectId } from "mongodb";

export const createUsers = async (
username,
email,
password,
profile
) => {
    const db = await dbConnection();
    const usersCollection = db.collection("users");

    if (!username||!email||!password||!profile){throw new Error("Register Error 101: Missing critical variables")};
    
    if (typeof username != "string"|| username.trim().length == 0) {throw new Error("Register Error 201: Username has to be a valid non empty string")};
    username = username.trim()
    if (username.length < 2 || username.length > 20) {throw new Error("Register Error 202: Username has to be atleast 2 character's long and less than 20 characters")};

    helperfunc.dupusercheck(username);

    if (typeof email != "string" || email.trim().length==0){throw new Error("Register Error 301: email has to be a Non-Empty String");}
    email = email.trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){throw new Error("Register Error 302: email has to be valid email");}

    
    if (typeof password != "string" || password.trim().length==0){throw new Error("Register Error 401: password has to be a Non-Empty String");}
    password = password.trim();
    if (username.length < 8 || username.length > 20) {throw new Error("Register Error 402: Password has to be atleast 8 character's long and less than 20 characters")};
    if(!/[^A-Z][^0-9][^{p}]+$/.test(email)){throw new Error("Register Error 403: password has to have 1 Uppercase Letter, 1 digit and 1 special character");}

    helperfunc.profilecheck(profile);

    let reviewIds = [];
    let favoriteRestaurantIds = [];

    const createdAt = new Date();
    const lastLogin = new Date();
    lastLogin.setDate(0);

    password = bcrypt(password);

    const insertResult = await usersCollection.insertOne({
        username,
        email,
        password,
        profile,
        reviewIds,
        favoriteRestaurantIds,
        createdAt,
        lastLogin
    });

    const newUser = await usersCollection.findOne({_id:insertResult.insertedId});
    if (!newUser) {throw new Error("Register Error 500: Failed to register User")}
    else { return "{registrationCompleted: true}" };
}

export const getbyUserID = async (
userId
) => {

}

export const updateUser = async (
username,
email,
password,
profile,
reviewIds,
favoriteRestaurantIds
) => {

}

export const deleteUsers = async (
username
) => {

}
