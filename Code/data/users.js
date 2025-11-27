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
