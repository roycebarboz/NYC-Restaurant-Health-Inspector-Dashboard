import { dbConnection } from "./config/mongoConnection"
import {ObjectID} from mongodb

export const dupusercheck = async (username) => {
    let dbConnection = await dbConnection();
    let usersCollection = dbConnection.collection("users");

    const usercheck = await usersCollection.findone({
        username: {
            $regex: `^${username}`,
            $options: "i"
        }
    });
    if(usercheck){throw new Error("DupCheck Error 100: Username is already registered");}

    return true;
}

export const profilecheck = async (profile) => {

    const ValidKeys = ["firstName","lastName","dateOfBirth"];
    const profilekeys = Object.keys(profile);

    if (ValidKeys.length !== profilekeys.length||!ValidKeys.every(valid => profilekeys.includes(valid))){throw new Error("ProfileCheck 1 : Profile is missing keys or has too many keys");}
    ValidKeys.forEach(keys =>{
        if(typeof profile[keys] !== "string" || profile[keys].trim().length === 0){throw new Error(`ProfileCheck 2: ${keys} must be a non empty string`);}
    });

    const firstname = profile["firstName"];
    if (!username||  typeof username != "string"|| username.trim().length == 0) {throw new Error("Register Error 201: Username has to be a valid non empty string")};
    username = username.trim()
    if (username.length < 2 || username.length > 20) {throw new Error("Register Error 202: Username has to be atleast 2 character's long and less than 20 characters")};

    const lastname = profile["lastName"];

    const dob = profile["dateOfBirth"];
}