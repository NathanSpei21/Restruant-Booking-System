let bookResID = 0;
let bookResName = ""
let bookResLocation = ""
let Cusname = ""
let Restruants = []
let bookResCap = 0

window.onload = function onload() {
    displayButtons();
    console.log("loaded");
    setPlaceHolder();
    getSearchData();
}

document.querySelector('table tbody').addEventListener('click', function (event) {
    if (localStorage.getItem("SignedIn") === "true") {
        if (localStorage.getItem("AccType") === "Customer") {
            getAccountData();
            getResDates(event.target.dataset.id);
        } else {
            alert("Log into a Customer account to book");
        }
    } else {
        alert("Sign in or Register an account before booking a restaurant");
    }
});

//Retrieves the search data that is stored locally on the web browser
//It is then packaged up in a JSON package and sent to the back-end
//It then receives the data from the backend and passes it to be displayed
function getSearchData() {
    fetch('http://localhost:5000/search', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            people: getSearch("People"),
            time: getSearch("Time"),
            type: getSearch("Types"),
            location: getSearch("City")
        })
    })
        .then(response => response.json())
        .then(data => LoadHTMLTable(data['data']));
}

//Server request to get all the Dates that a given Restaurant has made available.
//Passes the restrunat ID to the server to be used to identify the Restaurant
function getResDates(ID) {
    fetch('http://localhost:5000/getDates', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            R_ID: ID,
        })
    })
        .then(response => response.json())
        .then(data => getResInfo(ID, data['data']));
}

//Server request to get all the known Information of a Restaurant to show the user more restaurant details whine they are booking it.
function getResInfo(ID, dates) {
    fetch('http://localhost:5000/getResInfo', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            R_ID: ID,
        })
    })
        .then(response => response.json())
        .then(data => showResDates(data['data'], dates));
}

//Server request to get the account info to be able to be used when trying to book a restaurant
function getAccountData() {
    fetch('http://localhost:5000/getAccount', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            ID: localStorage.getItem("SignedInID")
        })
    })
        .then(response => response.json())
        .then(data => setAccname(data['data']));
}

//Server request to pass all the needed information to the server to make a booking entry
function sendBookingInfo(A_ID, R_ID, ResName, no_of_people, time, date, location, cusname) {
    fetch('http://localhost:5000/addBooking', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            A_ID: A_ID,
            R_ID: R_ID,
            name: ResName,
            no_of_people: no_of_people,
            time: time,
            date: date,
            location: location,
            Cusname: cusname
        })
    })
        .then(response => response.json())
        .catch(err => console.log(err))

    document.getElementById("id06").style.display = "none";
}

//Server request to update the current capacity of a given date when a booking is made
function updateCurrentCapacity(R_id, date, numberOfPeople) {
    fetch('http://localhost:5000/updateCap', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            R_id: R_id,
            date: date,
            number: numberOfPeople
        })
    })
        .then(response => response.json())
        .catch(err => console.log(err))
}

//Server request to get the current capacity of a given date that the user has selected
function fetchCurrentCap() {
    if (document.getElementById("No.of.People").value === "") {
        alert("Please enter the number of people you want to book for");
    } else if (document.getElementById("ResDates").value === "") {
        alert("Please enter the date that you want to book");
    } else {
        fetch('http://localhost:5000/getCurrentCap', {
            headers: {
                'Content-type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                R_id: bookResID,
                date: reverseDate(document.getElementById("ResDates").value)
            })
        })
            .then(response => response.json())
            .then(data => checkCapacity(data['data']))
            .catch(err => console.log(err))
    }
}

function setAccname(data) {
    Cusname = data[0].name
}

//Checks to see if the date selected by the user has enough space to fit their booking and if not tell the user how many spaces are left
function checkCapacity(fetchCap) {
    let enteredNumber = parseInt(document.getElementById("No.of.People").value, 10);
    let fetchedCap = fetchCap[0].CurrentCapacity;
    if (fetchedCap + enteredNumber > bookResCap) {
        let spaces_left = bookResCap - (fetchedCap)
        alert("The current date only has " + spaces_left + " left. Try another date")
    } else {
        getBookingInfo();
    }
}

//Retrieves data from the user and input validates all the information needed to make a booking
function getBookingInfo() {
    let A_ID = localStorage.getItem("SignedInID");
    let R_ID = bookResID
    let ResName = bookResName
    let no_of_people = document.getElementById("No.of.People").value
    let time = document.getElementById("BookTime").value
    let date = reverseDate(document.getElementById("ResDates").value)
    let location = bookResLocation;
    let cusname = Cusname

    let opentime = ""
    let closetime = ""

    for (let i = 0; i < Restruants.length; i++) {
        if (bookResID === Restruants[i].R_id) {
            opentime = Restruants[i].opentime
            closetime = Restruants[i].closetime
        }
    }


    if (opentime < time && time < closetime) {
        if (no_of_people > 0) {
            if (time !== "" && date !== "") {
                sendBookingInfo(A_ID, R_ID, ResName, no_of_people, time, date, location, cusname)
                updateCurrentCapacity(R_ID, date, no_of_people);
            } else {
                alert("Fill in all required the required boxes");
            }
        } else {
            alert("Number of people has to be positive");
        }
    } else {
        alert("The booking time has to between: " + opentime + " and " + closetime);
    }
}

//Displays the booking form along with information on that restaurant along with all the dates that they have available
function showResDates(resInfo, dates) {
    if (dates.length > 0) {
        bookResID = resInfo[0].R_id
        bookResName = resInfo[0].name
        bookResLocation = resInfo[0].location
        bookResCap = resInfo[0].capacity

        document.getElementById("id06").style.display = "block"
        document.getElementById("ResName").innerText = resInfo[0].name
        document.getElementById("Reslocation").innerText = resInfo[0].location
        document.getElementById("Dates").innerHTML

        let listHtml = "";
        dates = removeDuplicates(dates)
        dates.forEach(function ({date}) {
            listHtml += `<option>${reverseDate(date)}</option>`
        });
        document.getElementById("Dates").innerHTML = listHtml
    } else {
        alert("Restaurant currently doesnt have any dates available");
    }
}

//Displays the restaurant data that has been retrieved from the database
function LoadHTMLTable(data) {
    const table = document.querySelector('table tbody');
    const header = document.getElementById("NoResults");
    if (data.length === 0) {
        header.innerHTML = "Found 0 Restaurants"
        table.innerHTML = "<tr><td class='NoData' colspan='6'>No Restaurants Found</td></tr>"
        return;
    } else {
        let tableHtml = "";
        header.innerHTML = "Found " + data.length + " Restaurants"
        let i = 0;
        data.forEach(function ({R_id, name, location, cuisine, opentime, closetime}) {
            tableHtml += "<tr>";
            tableHtml += `<td>${name}</td>`;
            tableHtml += `<td>${location}</td>`;
            tableHtml += `<td>${cuisine}</td>`;
            tableHtml += `<td>${opentime}</td>`;
            tableHtml += `<td>${closetime}</td>`;
            tableHtml += `<td><button data-id=${R_id}>BOOK</button></td>`
            tableHtml += "</tr>";
            Restruants.push(data[i])
            i++
        });
        table.innerHTML = tableHtml;
    }
}

//inputs the searched data as a place holder to show what was searched from the other search
function setPlaceHolder() {
    document.getElementById("People").placeholder = getSearch("People");
    document.getElementById("Time").placeholder = getSearch("Time");
    document.getElementById("FType").placeholder = getSearch("Types");
    document.getElementById("City's").placeholder = getSearch("City");
}

//Returns the search information for a given ID (e.g. ID = "Date")
function getSearch(id) {
    if (id === "People") {
        if (localStorage.getItem("name") !== null) {
            return localStorage.getItem("name");
        }
    } else if (id === "Time") {
        if (localStorage.getItem("time") !== null) {
            return localStorage.getItem("time");
        }
    } else if (id === "Date") {
        if (localStorage.getItem("date") !== null) {
            return localStorage.getItem("date");
        }
    } else if (id === "Types") {
        if (localStorage.getItem("Ftype") !== null) {
            return localStorage.getItem("Ftype");
        }
    } else if (id === "City") {
        if (localStorage.getItem("city") !== null) {
            return localStorage.getItem("city");
        }
    }
}

//Disables and enables buttons that the user has access to
function displayButtons() {
    const signedIn = localStorage.getItem("SignedIn")
    if (signedIn === "true") {
        disableInRes(1);
    } else {
        disableInRes(2);
    }
}

function disableInRes(a) {
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

//Removes Duplicate dates in an array if there are any (precaution)
function removeDuplicates(DupArray) {
    let dupPosition = []
    for (let i = 0; i < DupArray.length; i++) {
        let potentialDup = DupArray[i].date
        let found = 0
        for (let j = 0; j < DupArray.length; j++) {
            if (potentialDup === DupArray[j].date) {
                found++
                if (found > 1) {
                    dupPosition.push(i)
                }
            }
        }
    }

    for (let i = 1; i < dupPosition.length; i++) {
        DupArray.splice(dupPosition[i], 1)
    }

    return DupArray
}

//Used to reverse the date from YY/MM/DD to DD/MM/YY format
function reverseDate(date) {
    return date.split("-").reverse().join("-");
}
