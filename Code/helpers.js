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