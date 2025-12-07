import * as helperfunc from "../helpers.js"
import { dbConnection } from "../config/mongoConnection.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt"

export const createUsers = async (
username,
email,
password,
profile
) => {
    if (!username||!email||!password||!profile){throw new Error("Register Error 101: Missing critical variables")};
    
    if (typeof username != "string"|| username.trim().length == 0) {throw new Error("Register Error 201: Username has to be a valid non empty string")};
    username = username.trim()
    if (username.length < 2 || username.length > 20) {throw new Error("Register Error 202: Username has to be atleast 2 character's long and less than 20 characters")};

    if (typeof email != "string" || email.trim().length==0){throw new Error("Register Error 301: email has to be a Non-Empty String");}
    email = email.trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){throw new Error("Register Error 302: email has to be valid email");}

    await helperfunc.dupusercheck(email);
    
    if (typeof password != "string" || password.trim().length==0){throw new Error("Register Error 401: password has to be a Non-Empty String");}
    password = password.trim();
    if (password.length < 8 || password.length > 20) {throw new Error("Register Error 402: Password has to be atleast 8 character's long and less than 20 characters")};
    if(!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(password)){throw new Error("Register Error 403: password has to have 1 Uppercase Letter, 1 digit and 1 special character");}

    await helperfunc.profilecheck(profile);

    let reviewIds = [];
    let favoriteRestaurantIds = [];

    const createdAt = new Date();
    const lastLogin = null;

    password = await bcrypt.hash(password,16);

    const db = await dbConnection();
    const usersCollection = db.collection("users");
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
    
    return {registrationCompleted: true};
};

export const loginUser = async(email,password) => {

    const db = await dbConnection();
    const usersCollection = db.collection("users");

    if (!email||!password){throw new Error("Either the email or password is invalid")};
    if (typeof email != "string" || email.trim().length==0){throw new Error("Register Error 301: email has to be a Non-Empty String");}
    email = email.trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){throw new Error("Register Error 302: email has to be valid email");}

    if (typeof password != "string" || password.trim().length==0){throw new Error("Either the email or password is invalid")};
    password = password.trim();
    if (password.length < 8) {throw new Error("Either the email or password is invalid")};
    if (/\s/.test(password)){throw new Error("Either the email or password is invalid")};
    if(!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(password)){throw new Error("Either the email or password is invalid")};

    const potentialUser = await usersCollection.findOne({email: email});
    if (!potentialUser) {throw new Error("Either the email or password is invalid")};

    const AuthUser = await bcrypt.compare(password, potentialUser.password);
    if(!AuthUser){throw new Error("Either the email or password is invalid")};

    const currentdate = new Date();
    const month = String(currentdate.getMonth()+1).padStart(2,'0');
    const day = String(currentdate.getDate()).padStart(2,'0');
    const year = currentdate.getFullYear()
    let hours = currentdate.getHours();
    let zone = "";
    const minutes = String(currentdate.getMinutes()).padStart(2,'0');
    if (hours>=12){zone="PM"}
    else {zone = "AM"}
    hours = hours %12 || 12;
    const formattedhour = String(hours).padStart(2,'0');

    const lastLoginformatted = `${month}/${day}/${year} ${formattedhour}:${minutes}${zone}`

    await usersCollection.updateOne(
        {_id: potentialUser._id},
        {$set: {lastLogin: lastLoginformatted}}
    );

    return {
        username:potentialUser.username,
        email:potentialUser.email,
        profile:potentialUser.profile,
        reviewIds:potentialUser.reviewIds,
        favoriteRestaurantIds:potentialUser.favoriteRestaurantIds,
        createdAt:potentialUser.createdAt,
        lastLogin:potentialUser.lastLogin
    };
};

export const GetUserbyID = async (id) => {

    if (typeof id === "string" && id.trim().length!=0){
        id = id.trim()
        if (id.length===0||!ObjectId.isValid(id)){throw new Error("GetUser 102: Provided id is not a Valid Id");}
        id = new ObjectId(id);
    }
    else if (id instanceof ObjectId){}
    else {
        throw new Error("GetUser 102: Provided id is not a Valid Id");
    }
    const db = await dbConnection();
    const usersCollection = db.collection("users");

    const resultUser = await usersCollection.findOne({_id:id});
    if (!resultUser){throw new Error("GetUser 103: User with Id does not exist");}

    return resultUser;
};

export const updateUser = async (
id,
username,
email,
password,
profile,
reviewIds,
favoriteRestaurantIds
) => {
    if (!id||!username||!email||!password||!profile){throw new Error("Update Error 101: Missing critical variables")};
    
    if (typeof id !== "string" || id.trim().length === 0){throw new Error("Update Error 1: Please input a valid non empty String")};
    id = id.trim();
    if(!ObjectId.isValid(id)){throw new Error("Update Error 2: Provided id is not a Valid Id");}
    id = new ObjectId(id)

    if (typeof username != "string"|| username.trim().length == 0) {throw new Error("Update Error 201: Username has to be a valid non empty string")};
    username = username.trim()
    if (username.length < 2 || username.length > 20) {throw new Error("Update Error 202: Username has to be atleast 2 character's long and less than 20 characters")};

    if (typeof email != "string" || email.trim().length==0){throw new Error("Update Error 301: email has to be a Non-Empty String");}
    email = email.trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){throw new Error("Update Error 302: email has to be valid email");}

    await helperfunc.dupusercheck(email);
    
    if (typeof password != "string" || password.trim().length==0){throw new Error("Update Error 401: password has to be a Non-Empty String");}
    password = password.trim();
    if (password.length < 8 || password.length > 20) {throw new Error("Update Error 402: Password has to be atleast 8 character's long and less than 20 characters")};
    if(!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(password)){throw new Error("Update Error 403: password has to have 1 Uppercase Letter, 1 digit and 1 special character");}

    await helperfunc.profilecheck(profile);

    await helperfunc.validatedArray(reviewIds,"reviewIds",GetbyReviewID);
    await helperfunc.validatedArray(favoriteRestaurantIds,"favoriteRestaurantIds",GetbyRestaurantID);
    
    password = await bcrypt.hash(password,16);

    const db = await dbConnection();
    const usersCollection = db.collection("users");
    const insertResult = await usersCollection.updateOne(
        {_id: id},
        {
            $set: {
        username: username,
        email: email,
        password: password,
        profile: profile,
        reviewIds: reviewIds,
        favoriteRestaurantIds: favoriteRestaurantIds}}
    );

    if (insertResult.matchedCount === 0){throw new Error("Update Error 500: No user exists with given ID");}
    if (insertResult.modifiedCount === 0){throw new Error("Update Error 501: Update did not modify any fields");}
    
    return {updateCompleted: true};
};

export const deleteUsers = async (
id
) => {
    if (typeof id === "string" && id.trim().length!=0){
        id = id.trim()
        if (id.length===0||!ObjectId.isValid(id)){throw new Error("DeleteUser 102: Provided id is not a Valid Id");}
        id = new ObjectId(id);
    }
    else if (typeof id === "object"){}
    else {
        throw new Error("DeleteUser 102: Provided id is not a Valid Id");
    }
    const db = await dbConnection();
    const usersCollection = db.collection("users");

    const resultUser = await usersCollection.deleteOne({_id:id});

    return {deleteCompleted: true};
}
