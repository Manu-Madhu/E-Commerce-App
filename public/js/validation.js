let emailMsg = document.getElementById('emailError')
let passError = document.getElementById("passwordError")

// AdminLoginPage Validaation
function emailValidate() {
    let emailId = document.getElementById("Email").value.trim();
    if (/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(emailId) == false) {
        emailMsg.innerHTML = "Please enter valid email ";
        return false;
    } else {
        emailMsg.innerHTML = "";
        return true;
    }
}
function passwordValidate() {
    let password = document.getElementById("Password").value.trim();
    if (password.length < 8 || password ==='' ) {
        passError.innerHTML = "please enter valied password";
        return false

    } else {
        passError.innerHTML = "";
        return true;
    }
}


function fullyChecking() {
    if (passwordValidate() && emailValidate()) {
        return true
    } else {
        return false
    }
}

// SIGNUP VALIDATION
const re_name = document.getElementById("Name");
const re_email = document.getElementById("Email");
const re_number = document.getElementById("Number");
const re_password = document.getElementById("Password")

function nameChecking() {
    let name = document.getElementById("name").value;
    if (name == "") {
        re_name.innerHTML = "please enter name";
        return false
    } else {
        re_name.innerHTML = "";
        return true
    }
}
function emailChecking() {
    let emailId = document.getElementById("email").value.trim();
    console.log("emailId" + emailId);
    if (/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(emailId) == false) {
        re_email.innerHTML = "Please enter valid email ";
        return false;
    } else {
        re_email.innerHTML = "";
        return true;
    }
}
function numberChecking() {
    let number = document.getElementById("number").value.trim();
    // if (/^[0-9]+$/.test(number) == false) {
    //     re_number.innerHTML = "please enter a valid number";
    //     return false
    // }
    // else
     if (number.length != 13) {
        re_number.innerHTML = "please enter 10 digits";
        return false
    } else {
        re_number.innerHTML = "";
        return true
    }
}


function passwordChecking() {
    let password = document.getElementById("password").value.trim();
    if (password.length < 8 || password==='') {
        re_password.innerHTML = "please enter minimum 8 digits";
        return false
    } else {
        re_password.innerHTML = "";
        return true
    }
}
function allChecking() {
    if (nameChecking() && emailChecking() && numberChecking() && passwordChecking()) {
        return true
    } else {
        return false
    }
}