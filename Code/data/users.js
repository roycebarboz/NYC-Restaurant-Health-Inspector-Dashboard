import * as helperfunc from "../helpers.js"
import { dbConnection } from "../config/mongoConnection.js";
import { ObjectId } from "mongodb";

export const createUsers = async (
username,
email,
password,
profile,
reviewIds,
favoriteRestaurantIds
) => {
    if (!username||!email||!password||!profile){throw new Error("Register Error 101: Missing critical variables")};
    
    if (typeof username != "string"|| username.trim().length == 0) {throw new Error("Register Error 201: Username has to be a valid non empty string")};
    username = username.trim()
    if (username.length < 2 || username.length > 20) {throw new Error("Register Error 202: Username has to be atleast 2 character's long and less than 20 characters")};

    helperfunc.dupusercheck(username);

    if (typeof email != "string" || email.trim().length==0){throw new Error("Register Error 301: email has to be a Non-Empty String");}
    email = email.trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){throw new Error("Register Error 302: email has to be valid email");}


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
