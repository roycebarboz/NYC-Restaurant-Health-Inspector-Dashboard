import bcrypt from 'bcrypt';
import { dbConnection } from "../config/mongoConnection.js";

export const encryptPassword = async (password) => {
    const saltRounds = 16;
    return await bcrypt.hash(plainTextPassword, saltRounds);
}

export const passwordCheck = async (password,username) =>  {
    let dbConnection = await dbConnection();
    let usersCollection = dbConnection.collection("users");

    const potentialUser = await usersCollection.findOne({username: {username}});
    if (!potentialUser) {throw new Error("Password Auth 100: User does not Exist")};
    let AuthUser = false;

    try {
        AuthUser = await bcrypt.compare(password, potentialUser.password);
    }
    catch(e){
        throw new Error("Password Auth 101: Failure to Compare");
    }

    if(AuthUser){
        await usersCollection.updateOne(
        {_id: potentialUser._id},
        {$set: {lastLogin: new Date()}}
        );
        return {UserAuthentication:True};
    }
    else{
        return {UserAuthentication:False};
    }
}