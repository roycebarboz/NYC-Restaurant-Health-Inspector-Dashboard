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

    const username = document.getElementById("lastName").value.trim();
    const email = document.getElementById("userId").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const last = document.getElementById("favoriteQuote").value.trim();
    const backgroundColor = document.getElementById("backgroundColor").value;
    const fontColor = document.getElementById("fontColor").value;
    const role = document.getElementById("role").value.trim().toLowerCase();
    
    let check = true;

    if (firstName.length < 2 || firstName.length > 20 || !/^[A-Za-z]+$/.test(firstName)) {
        updateError("firstName-error", "First Name must be 2-20 letters");
        check = false;
    }

    if (lastName.length < 2 || lastName.length > 20 || !/^[A-Za-z]+$/.test(lastName)) {
        updateError("lastName-error", "Last Name must be 2-20 letters");
        check = false;
    }

    if (userId.length < 5 || userId.length > 10 || !/^[a-z0-9]+$/.test(userId)) {
        updateError("userId-error", "User Id must be 5-10 letters or numbers");
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

    if (favoriteQuote.length < 20 || favoriteQuote.length > 255) {    
        updateError("favoriteQuote-error", "Quote must be atleast 20 characters long but less than 255 characters");
        check = false;
        }

    const checkhexcolor = /^#[0-9A-Fa-f]{6}$/;
    if (!checkhexcolor.test(backgroundColor)) {
        updateError("backgroundColor-error", "Background must be in proper Hex Format");
        check = false;
        }
    if (!checkhexcolor.test(fontColor)) {
        updateError("fontColor-error", "Font must be in proper Hex Format");
        check = false;
        }

    if (backgroundColor === fontColor){    
        updateError("backgroundColor-error", "Background and Font color must be different");
        check = false;
        }

    if (role != "user" && role != "superuser"){    
        updateError("role-error", "Incheck role provided");
        check = false;
        }

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

