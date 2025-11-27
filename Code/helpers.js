import {ObjectID} from mongodb

export const validation(varname, type) => {
    if (!varname){ throw new Error(`Validation Err 100: ${varname} cannot be null`);}
    if (!type){throw new Error(`Validation Err 101: ${type} cannot be null`);}
    if (type == "string") {if (typeof varname != type||varname.trim().length===0){throw new Error(`Validation Err 201: ${type} cannot be empty string`)};}
    if (type == "number") {if  (typeof varname != type||varname.trim().length===0){throw new Error(`Validation Err 202i: ${type} cannot be empty number`)};}
    if (type == "ObjectID") {if  (typeof varname != type||varname.trim().length===0){throw new Error(`Validation Err 202i: ${type} cannot be empty number`)};}
}