import {ObjectId} from "mongodb"

export const profilecheck = (profile) => {

    const ValidKeys = ["firstName","lastName","dateOfBirth"];
    const profilekeys = Object.keys(profile);

    if (ValidKeys.length !== profilekeys.length||!ValidKeys.every(valid => profilekeys.includes(valid))){throw new Error("ProfileCheck 1 : Profile is missing keys or has too many keys");}
    ValidKeys.forEach(keys =>{
        if(typeof profile[keys] !== "string" || profile[keys].trim().length === 0){throw new Error(`ProfileCheck 2: ${keys} must be a non empty string`);}
    });

    let firstname = profile["firstName"];
    if (typeof firstname != "string"|| firstname.trim().length == 0) {throw new Error("ProfileCheck 10: firstname has to be a valid non empty string")};
    firstname = firstname.trim()
    if (firstname.length < 2 || firstname.length > 20) {throw new Error("ProfileCheck 11: firstname has to be atleast 2 character's long and less than 20 characters")};

    let lastname = profile["lastName"];
    if (typeof lastname != "string"|| lastname.trim().length == 0) {throw new Error("ProfileCheck 21: lastname has to be a valid non empty string")};
    lastname = lastname.trim()
    if (lastname.length < 2 || lastname.length > 20) {throw new Error("ProfileCheck 22: lastname has to be atleast 2 character's long and less than 20 characters")};

    let dob = profile["dateOfBirth"];
    if (typeof dob != "string" || dob.trim().length==0){throw new Error("ProfileCheck 31: date of birth has to be a Non-Empty String");}
    dob=dob.trim();
    if(!/^([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(dob)){throw new Error("ProfileCheck 32: date of birth has to be in YYYY/MM/DD format");}
        
    let [year,month,day] = dob.split("-").map(Number);
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

    return {
        firstName:firstname,
        lastName: lastname,
        dateOfBirth: dob
    };
}

export const validatedArray = async (array, attribute, fetchFunction) => {
    if (!Array.isArray(array)) {
        throw new Error(`Valid Array Error 1: ${attribute} must be an array`);
    }

    if (array.length === 0) return [];

    const validatedIds = [];

    for(let ValidID of array){
        if (typeof ValidID !== "string"|| ValidID.trim().length==0){
            throw new Error(`Valid Array Error 2: ${ValidID} has to be a nonempty String`);
        } 
        ValidID = ValidID.trim();
        if (!ObjectId.isValid(ValidID)) {throw new Error(`Valid Array Error 3: ${attribute} contains an invalid ObjectId`);}

        const objId = new ObjectId(ValidID);

        try {await fetchFunction(objId);} 
        catch (e) {
            throw new Error(`Valid Array Error 4: ${attribute} contains a non-existing id. Error thrown is ${e.message}`);
        }

        validatedIds.push(objId);
    };

    return validatedIds;
}

export const string_validation = (str, var_name = 'input') => {
    //first we check if the string is undefined or null
    //then we check if the input is of type string
    //then we trim it
    //then we check if the length is greater than 0
    //if all conditions are met, we return the input
    //if not, we throw an error
    if (str === undefined || str === null) {
      throw `${var_name} cannot be undefined or null`;
    }
    if (typeof str !== 'string') {
      throw `${var_name} must be a string`;
    }
    const s = str.trim();
    if (s.length === 0) {
      throw `${var_name} cannot be an empty string or just spaces`;
    }
    return s;
  };

export const zipcode_validation = (zipcode) => {
    //first check if the zipcode exists
    //then we we validate the zipcode as a string
    //then we check if it is a 5-digit number
    //then we check if it is in the range of 10001 to 14975
    //then we return the zipcode
    if (zipcode === undefined || zipcode === null) {
      throw `zipcode cannot be undefined or null`;
    }
    zipcode = string_validation(zipcode, 'zipcode')
    if (!/^\d{5}$/.test(zipcode)) {
        throw `zipcode must be a 5-digit number`;
      }
      const zip_num = Number(zipcode);
      if (zip_num < 10001 || zip_num > 14975) {
        throw `zipcode must be a valid New York ZIP code (10001–14975)`;
      }
    
      return zipcode;
}

export const score_validation = (score) => {
    //first we check if the score is undefined or null
    //then we check if the score is of type number
    //then we check if the score is greater than 0
    //then we check if the score is less than 100
    //then we return the score
    if (score === undefined || score === null) {
      throw `score cannot be undefined or null`;
    }
    if (typeof score !== 'number') {
      throw `score must be a number`;
    }
    if (score < 0 || score > 100) {
      throw `score must be between 0 and 100`;
    }
    return score;
}

export const grade_validation = (grade) => {
    //first we check if the grade is undefined or null
    //then we check if the grade is of type string
    //then we check if the grade is a valid grade
    //then we return the grade
    if (grade === undefined || grade === null) {
      throw `grade cannot be undefined or null`;
    }
    grade = string_validation(grade, 'grade')
    if (grade !== 'A' && grade !== 'B' && grade !== 'C' && grade !== 'P' && grade !== 'N' && grade !== 'Z') {
      throw `grade must be a valid grade (A, B, C, P, N, Z)`;
    }
    return grade;
}