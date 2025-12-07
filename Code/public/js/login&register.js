const signupform = document.querySelector("#signup-form");
const signinform = document.querySelector("#signin-form");

function clearError () {
    document.querySelectorAll(".error").forEach(errorboxs => errorboxs.textContent = "");
}

function updateError(id, message){
    const errorbox = document.querySelector('#'+id);
    if (errorbox) {errorbox.textContent = message};
}

signupform.addEventListener('submit', (event) => {
    event.preventDefault();
    clearError();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value;
    const dateOfBirth = document.getElementById("dateOfBirth").value;
    
    let check = true;

    if (username.length < 2 || username.length > 20 || !/^[A-Za-z]+$/.test(username)) {
        updateError("username-error", "UserName must be 2-20 letters");
        check = false;
    }

    if (email.length < 2 || email.length > 20 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        updateError("email-error", "Email has to be valid email");
        check = false;
    }

    if (password.length < 8 || /\s/.test(password)) {
        updateError("password-error", "Password must be atleast longer than 8 characters and not empty");
        check = false;
        }
    if(!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(password)) {
        updateError("password-error", "Password must have 1 Uppercase character, 1 Digit and 1 Special Character");
        check = false;
        }

    if (confirmPassword.length < 8 || /\s/.test(confirmPassword)) {
        updateError("confirmPassword-error", "Password must be atleast longer than 8 characters and not empty");
        check = false;
        }
    if(!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(confirmPassword)){
        updateError("confirmPassword-error", "Password must have 1 Uppercase character, 1 Digit and 1 Special Character");
        check = false;
        }
    if(password !== confirmPassword){    
        updateError("confirmPassword-error", "Passwords do not match");
        check = false;
        }

    if (firstName.length < 2 || firstName.length > 20 || !/^[A-Za-z]+$/.test(firstName)) {
        updateError("firstName-error", "First Name must be 2-20 letters");
        check = false;
        }

    if (lastName.length < 2 || lastName.length > 20 || !/^[A-Za-z]+$/.test(lastName)) {
        updateError("lastName-error", "First Name must be 2-20 letters");
        check = false;
        }

    if(!/^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/([0-9]{4})$/.test(dateOfBirth)){
        updateError("dateOfBirth-error", "Date of Birth has to be in MM/DD/YYYY format");
        check = false;
        };
        
    let [month,day,year] = dateOfBirth.split("/").map(Number);
    const given_dob = new Date(year,month-1,day);
    if (given_dob.getFullYear() !== year || given_dob.getMonth() !== month - 1 || given_dob.getDate() !== day){
        updateError("dateOfBirth-error", "Invalid Date");
        check = false;
    };

    let currentDate = new Date();
    let age = currentDate.getFullYear() - year;
    const hasHadBirthday =
    currentDate.getMonth() > given_dob.getMonth() ||
    (currentDate.getMonth() === given_dob.getMonth() && currentDate.getDate() >= given_dob.getDate());
    if (!hasHadBirthday) age--;

    if (age < 18){
        updateError("dateOfBirth-error", "User cannot be younger that 18 yrs old");
        check = false;
    };
    if (age > 100){
        updateError("dateOfBirth-error", "User cannot be older that 100 yrs old");
        check = false;
    };

    if(check){signupform.submit();}
});

signinform.addEventListener('submit', (event) => {
    event.preventDefault();
    clearError();

    const userId = document.getElementById("userId").value.trim();
    const password = document.getElementById("password").value.trim();

    let check = true;
    if (userId.length < 5 || userId.length > 10 || !/^[a-z0-9]+$/.test(userId)) {
        updateError("signin-error", "User Id must be 5–10 lowercase letters or numbers.");
        check = false;
    }
    
    if (password.length < 8 || /\s/.test(password)) {
        updateError("signin-error", "Password must be at least 8 characters and contain no spaces.");
        check = false;
    }

    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(password)) {
        updateError("signin-error", "Password must contain 1 uppercase, 1 digit, and 1 special character.");
        check = false;
    }

    if (check) {signinform.submit();}
});

