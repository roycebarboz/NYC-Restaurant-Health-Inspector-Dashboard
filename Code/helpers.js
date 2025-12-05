import { dbConnection } from "./config/mongoConnection.js";
import {ObjectId} from "mongodb"

export const dupusercheck = async (email) => {
    let dbConnection = await dbConnection();
    let usersCollection = dbConnection.collection("users");

    const usercheck = await usersCollection.findOne({email:email});
    if(usercheck){throw new Error("DupCheck Error 100: Email is already registered");}

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
    if (!firstname||  typeof firstname != "string"|| firstname.trim().length == 0) {throw new Error("ProfileCheck 10: firstname has to be a valid non empty string")};
    firstname = username.trim()
    if (firstname.length < 2 || firstname.length > 20) {throw new Error("ProfileCheck 11: firstname has to be atleast 2 character's long and less than 20 characters")};

    const lastname = profile["lastName"];
    if (!lastname||  typeof lastname != "string"|| lastname.trim().length == 0) {throw new Error("ProfileCheck 21: lastname has to be a valid non empty string")};
    lastname = lastname.trim()
    if (lastname.length < 2 || lastname.length > 20) {throw new Error("ProfileCheck 22: lastname has to be atleast 2 character's long and less than 20 characters")};

    const dob = profile["dateOfBirth"];
    if (typeof dob != "string" || dob.trim().length==0){throw new Error("ProfileCheck 31: date of birth has to be a Non-Empty String");}
    dob=dob.trim();
    if(!/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/([0-9]{4})$/.test(dob)){throw new Error("ProfileCheck 32: date of birth has to be a MM/DD/YYYY");}
        
    let [month,day,year] = dob.split("/").map(Number);
    const given_dob = new Date(year,month-1,day);
    if (given_dob.getFullYear() !== year || given_dob.getMonth() !== month - 1 || given_dob.getDate() !== day) {throw new Error("ProfileCheck 33: Invalid date (day/month error)");}

    let currentDate = new Date();
    let age = currentDate.getFullYear() - year;
    const hasHadBirthday =
    currentDate.getMonth() > given_dob.getMonth() ||
    (currentDate.getMonth() === given_dob.getMonth() && currentDate.getDate() >= given_dob.getDate());
    if (!hasHadBirthday) age--;

    if (age < 18) throw new Error("ProfileCheck 34: User must be at least 18 years old");
    if (age > 100) throw new Error("ProfileCheck 35: User cannot be older than 100 years");

    return profile;
}