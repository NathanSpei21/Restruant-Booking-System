var modal = document.getElementById('id01');
let Usernames = []
let locations = ["Glasgow", "Edinburgh", "Dundee", "Inverness", "Aberdeen", "London", "Manchester", "Liverpool", "Newcastle", "Birmingham", "Leeds"]
let Cuisine = ["Italian", "Seafood", "Indian", "Chinese", "Mexican", "SteakHouse", "French", "Japanese", "Greek", "British"]


window.onload = function onload() {
    displayButtons();
    getID();
    console.log("loaded")
}

//server request that passes the username and password that the user is attempting to log in with
function sendLogIn() {
    fetch('http://localhost:5000/signIn', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            Uname: arguments[0],
            Pass: arguments[1]
        })
    })
        .then(response => response.json())
        .then(data => checkLogIn(data['data']));
}

//server request to get all the usernames currently used in order to be used to avoid duplicate username to allowed
function getAllUsernames() {
    if (localStorage.getItem("SignedIn") === "false") {
        fetch('http://localhost:5000/getUsernames', {
            headers: {
                'Content-type': 'application/json'
            },
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => setUsernames(data['data']));
    }
    document.getElementById('id02').style.display = 'block'

}

//server request to provide the DB with the correct info to register an new account
function sendData(id, acctype, name, uname, Pword) {
    fetch('http://localhost:5000/register', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            id: arguments[0],
            Acctype: arguments[1],
            name: arguments[2],
            Uname: arguments[3],
            Pword: arguments[4]
        })
    })
        .then(response => response.json())
}

//server request to get the current Max ID that is used in the system
function getID() {
    fetch('http://localhost:5000/getID')
        .then(response => response.json())
        .then(data => setID(data['data']));

}

//Disables buttons that are not meant to be available dependant of the user is signed in or not
function displayButtons() {
    const signnedIn = localStorage.getItem("SignedIn")
    if (signnedIn === "true") {
        disable(1);
    } else {
        disable(2);
    }
}

function setUsernames(data) {
    for (let i = 0; i < data.length; i++) {
        Usernames.push(data[i].username)
    }
}

function setID(data) {
    if (data.length === 0) {
        localStorage.setItem("AccID", "1");
    } else {
        localStorage.setItem("AccID", data[0].A_id + 1)
    }
}

//Stops certain buttons from being displayed thus removing their potential to being used when not supposed to
function disable(a) {
    if (a === 1) {
        document.getElementById('signin').style.display = "none"
        document.getElementById('register').style.display = "none"
        document.getElementById('account').style.display = ""
        document.getElementById('signout').style.display = ""
        modal.style.display = "none";
    } else if (a === 2) {
        document.getElementById('signin').style.display = ""
        document.getElementById('register').style.display = ""
        document.getElementById('account').style.display = "none"
        document.getElementById('signout').style.display = "none"
    }
}

//Stores the search locally to be used in other web pages if needed
//Also input validation for the search is carried out here as well before it it stored
function StoreSearch() {

    let no_of_people = document.getElementById("People").value;
    let htime = document.getElementById("Time").value;
    let htype = document.getElementById("FType").value;
    let hcity = document.getElementById("City's").value;

    if (no_of_people === "" || no_of_people > 0) {
        if (checkCusine(htype)) {
            if (checkLocation(hcity)) {
                localStorage.setItem("name", no_of_people);
                localStorage.setItem("time", htime);
                localStorage.setItem("Ftype", htype);
                localStorage.setItem("city", hcity);
                document.location.href = "https://devweb2020.cis.strath.ac.uk/~kbb17123/IndividualProject/IndividualProject/ViewRestruants.html"
            } else {
                alert("Chose a Location from the list provided");
            }
        } else {
            alert("Chose a Cuisine from the list provided");
        }
    } else {
        alert("Number of people entered has to be positive");
    }
}

//Input validation function
function checkLocation(inputLocation) {
    if (inputLocation === "") {
        return true
    } else {
        for (let i = 0; i < locations.length; i++) {
            if (inputLocation === locations[i]) {
                return true
            }
        }
        return false
    }
}

//Input validation function
function checkCusine(inputCusine) {
    if (inputCusine === "") {
        return true
    } else {
        for (let i = 0; i < Cuisine.length; i++) {
            if (inputCusine === Cuisine[i]) {
                return true
            }
        }
        return false
    }
}

//Gets the inputted registration data from the user
//Performs a series of input validation to ensure the data entered is correct
function getRegData() {
    let id = localStorage.getItem("AccID")
    let type = document.getElementById("AccType").value
    let fullName = document.getElementById("Name").value
    let userName = document.getElementById("Username").value
    let passwowrd = document.getElementById("Password").value
    let repassword = document.getElementById("Re-Password").value
    if (checkAccType(type)) {
        if (!checkUsername(userName)) {
            if (passwowrd === repassword) {
                if ((type !== "") & (fullName !== "") & (userName !== "") && (passwowrd !== "")) {
                    sendData(id, type, fullName, userName, passwowrd)
                    id++
                    localStorage.setItem("AccID", id)
                    document.getElementById('id02').style.display = 'none' //closes the form without reloading the page
                } else {
                    alert("Fill in all required boxes");
                }
            } else {
                alert("Password does not match");
            }
        } else {
            alert("This user name has already been taken");
        }
    } else {
        alert("The account type has to be chosen from the present list. Either 'Customer' or 'Staff'");
    }
}

//Input validation function
function checkUsername(inputUsername) {
    for (let i = 0; i < Usernames.length; i++) {
        if (inputUsername === Usernames[i]) {
            return true
        }
    }
    return false
}

//Input validation function
function checkAccType(inputAcctype) {
    if (inputAcctype !== "Customer" & inputAcctype !== "Staff") {
        return false
    } else {
        return true
    }
}

//Gets the inputted user log in details and validated them before sending them to the server to be checked
function getSignInData() {
    let uname = document.getElementById("uname").value
    let pass = document.getElementById("pass").value
    if ((uname !== "") & (pass !== "")) {
        sendLogIn(uname, pass)
    } else {
        alert("Fill in all required boxes")
    }
}

//Given server responded data (the ID of the account that the user was trying to log into) it checks to see if the ID is there.
//If so the user has provided correct log in credentials
function checkLogIn(data) {
    if (data.A_id >= 0) {
        disable(1)
        localStorage.setItem("SignedIn", "true")
        localStorage.setItem("SignedInID", data.A_id)
        localStorage.setItem("AccType", data.accountType)
        alert("Logged in Successfully")
    } else {
        alert("Username or Password doesnt match try again")
    }
}

function quickTimeSearches(time) {
    localStorage.setItem("time", time)
    document.location.href = "https://devweb2020.cis.strath.ac.uk/~kbb17123/IndividualProject/IndividualProject/ViewRestruants.html"
}

function quickLocationSearches(location) {
    localStorage.setItem("City", location)
    document.location.href = "https://devweb2020.cis.strath.ac.uk/~kbb17123/IndividualProject/IndividualProject/ViewRestruants.html"
}

function signOut() {
    localStorage.setItem("SignedIn", "false")
    disable(2);
}
