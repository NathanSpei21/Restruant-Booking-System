let dates = []
let Accname = ""
let Accusername = ""
let AccBookings = 0
let AllAccBookingsInfo = []
let ResAccountCap = 0
let CancelResID = ""

let locations = ["Glasgow", "Edinburgh", "Dundee", "Inverness", "Aberdeen", "London", "Manchester", "Liverpool", "Newcastle", "Birmingham", "Leeds"]
let Cuisine = ["Italian", "Seafood", "Indian", "Chinese", "Mexican", "SteakHouse", "French", "Japanese", "Greek", "British"]


window.onload = function () {
    document.getElementById("AddDate").style.display = "none"
    document.getElementById("tick").style.display = "none"
    getAccountData();
    if (localStorage.getItem("AccType") === "Staff") {
        getLinkedRes();
    }
    showChart("Table")
    showChartOption();
    if (localStorage.getItem("AccType") === "Customer") {
        getCustomerBookings();
    }
}

//EventListener that looks for a click event on the cancel button that is displayed in the bookings table in the Customer account page
document.querySelector('table tbody').addEventListener('click', function (event) {
    if (localStorage.getItem("AccType") === "Customer") {
        document.getElementById("id07").style.display = 'block'
        let bookingId = event.target.dataset.id
        CancelResID = AllAccBookingsInfo[bookingId].R_id
        document.getElementById("CancelResName").innerText = AllAccBookingsInfo[bookingId].Resname
        document.getElementById("CancelNumberOfPeople").innerText = AllAccBookingsInfo[bookingId].no_of_people
        document.getElementById("CancelLocation").innerText = AllAccBookingsInfo[bookingId].location
        document.getElementById("CancelTime").innerText = AllAccBookingsInfo[bookingId].time
        document.getElementById("CancelDate").innerText = reverseDate(AllAccBookingsInfo[bookingId].date)
    }
});

//EventListener that catches the click event on the show bookings in the graph format button on the Account page
document.getElementById("graphBookings").addEventListener('click', function (event) {
    showChart('Graph')
});

//EventListener that catches the click event on the show bookings in the Table format button on the Account page
document.getElementById("tableBookings").addEventListener('click', function (event) {
    showChart('Table')
});

//Makes a request to get the highest used Res ID in the database in case a new restaurant is added and then we know what the new ID for that should
function getResID() {
    fetch('http://localhost:5000/getResID')
        .then(response => response.json())
        .then(data => setResID(data['data']));
}

//Makes a request to server to add a restaurant to the DB
function AddRes() {
    fetch("http://localhost:5000/addRes", {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            //add what to be sent
            ID: arguments[0],
            name: arguments[1],
            location: arguments[2],
            capacity: arguments[3],
            cuisine: arguments[4],
            open: arguments[5],
            close: arguments[6]
        })
    })
        .then(response => response.json())
        .then(data => ResAdded(data['data']))

}

//Makes a request to the server to add new dates that the user has entered for their Restaurant to be open
//and accept booking for
function SendDates(dates) {
    fetch("http://localhost:5000/addDates", {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            //add what to be sent
            R_ID: localStorage.getItem("SignedInResID"),
            Dates: dates
        })
    })
        .then(response => response.json())
}

//Makes a request to the server to add a link between an Account and Restaurant
function insertResAccLink() {
    fetch("http://localhost:5000/addLink", {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            //add what to be sent
            A_ID: localStorage.getItem("SignedInID"),
            R_ID: localStorage.getItem("ResID")
        })
    })
        .then(response => response.json())
}

//Makes a request to the server to get Account information for a given Account ID
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
        .then(data => loadAccountInfo(data['data']));
}

//Makes a request to the server to get the Restaurant Information that is linked to the Signed in account
function getLinkedRes() {
    fetch('http://localhost:5000/getAccID', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            ID: localStorage.getItem("SignedInID")
        })
    })
        .then(response => response.json())
        .then(data => setAccountResID(data['data']));
}

//Makes a request to the server to get all the Customer's booking's that they have made
function getCustomerBookings() {
    fetch('http://localhost:5000/getCustomerBookings', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            ID: localStorage.getItem("SignedInID")
        })
    })
        .then(response => response.json())
        .then(data => displayBookings(data['data']));
}

//Makes a request to the server to get all the Customer's booking's that have been made for a given restaurant
function getStaffBookings() {
    console.log("The res ID: " + localStorage.getItem("SignedInResID"))
    fetch('http://localhost:5000/getStaffBookings', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            ID: localStorage.getItem("SignedInResID")

        })
    })
        .then(response => response.json())
        .then(data => displayBookings(data['data']));
}

//Makes a request to the server to retrieve the Restaurant Info of a given restaurant that is linked to the current logged in Staff Account
function fetchResData() {
    var obj;
    fetch('http://localhost:5000/getResInfo', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            R_ID: localStorage.getItem("SignedInResID")
        })
    })
        .then(response => response.json())
        .then(data => setRestruantDisplay(data['data']));
}

//Makes a request to the server to delete a given booking
function deleteBooking() {
    fetch('http://localhost:5000/deleteBooking', {
        headers: {
            'Content-type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
            Resname: document.getElementById("CancelResName").innerText,
            people: document.getElementById("CancelNumberOfPeople").innerText,
            location: document.getElementById("CancelLocation").innerText,
            time: document.getElementById("CancelTime").innerText,
            date: reverseDate(document.getElementById("CancelDate").innerText),
            R_id: CancelResID
        })
    })
        .then(response => response.json())
}

//Gets the restaurant data that the user enters and sends it to the AddRes function to make a request to the server
function getResData() {
    const ID = localStorage.getItem("ResID")
    const name = document.getElementById("ResName").value
    const Reslocation = document.getElementById("ResLocation").value
    const capcity = document.getElementById("Capacity").value
    const cuisine = document.getElementById("Cuisine").value
    const open = document.getElementById("Open").value
    const close = document.getElementById("Close").value

    if (checkLocation(Reslocation)) {
        if (checkCusine(cuisine)) {
            let checkCap = parseInt(capcity, 10)
            if (isNaN(checkCap)) {
                alert("Capcity has to be a number")
            } else if (checkCap <= 0) {
                alert("Capacity has to be greater than 0")
            } else {
                if ((name !== "") & (Reslocation !== "") & (capcity !== "") & (cuisine !== "") & (open !== "") && (close !== "")) {
                    AddRes(ID, name, Reslocation, capcity, cuisine, open, close);
                    location.reload();
                } else {
                    alert("Fill in all required boxes");
                }
            }
        } else {
            alert("Chose a Cuisine from the list provided");
        }
    } else {
        alert("Chose a Location from the list provided");
    }

}

//Alerts the user if there restaurant has been added successfully or not
function ResAdded(data) {
    if (data === "Error") {
        alert("Couldn't add your restaurant")
    } else if (data === "Inserted") {
        alert("Restaurant Added")
        document.getElementById("id04").style.display = ""
        disableAddRes(true)
        insertResAccLink()
    }
}

//Disable the add Restaurant Button after the user has already added a restaurant before
function disableAddRes(input) {
    if (input === true) {
        document.getElementById("AddAccount").style.display = "none"
        document.getElementById("AddDate").style.display = ""
    }
}

//Gets the dates that the user want to make available for their restaurant
//and then calls the function to make a request to the server to add then to the database
function addDate(StoreOrSend) {
    if (StoreOrSend === "store") {
        let date = document.getElementById("date").value
        if (date) {
            if (!dates.includes(date)) {
                dates.push(date);
                document.getElementById("tick").style.display = ""
                setTimeout(function () {
                    document.getElementById("tick").style.display = "none"
                }, 1000)
            } else {
                alert("Date: " + date + "already added");
            }
        } else {
            document.getElementById("tick").style.display = "none"
            alert("Select a Date");
        }
    } else if (StoreOrSend === "send") {
        document.getElementById('id05').style.display = 'none'
        SendDates(dates)
    }
}

//Sets the Heading of the Account Page to the name of the account that is logged in
function setHeading(Name) {
    const head = document.getElementById("Heading")
    head.innerText = "Welcome," + Name
}

//Sets the account details section to the correct information
function setAccountDetails() {
    document.getElementById("Name").innerText = "Name: " + Accname
    document.getElementById("Uname").innerText = "Username: " + Accusername
    document.getElementById("NoBookings").innerText = "Number of Bookings: " + AccBookings
}

//Sets the Restaurant ID in the localstorage to the next ID that can be used if a restaurant is added
//Or it sets it to "-1" if no Restaurant ID is returned from the request. (i.e. when its customer account with no restaurant linked tio that account)
function setResID(data) {
    if (data.length === 0) {
        localStorage.setItem("ResID", "1");
    } else {
        localStorage.setItem("ResID", data[0].R_id + 1)
    }
}

//Sets the account type in the local storage
function loadAccountInfo(data) {
    if (data[0].accountType === "Customer") {
        document.getElementById("AddAccount").style.display = "none"
        localStorage.setItem("AccType", data[0].accountType)
    } else if (data[0].accountType === "Staff") {
        localStorage.setItem("AccType", data[0].accountType)
        getResID();
    }
    setHeading(data[0].name)
    Accname = data[0].name
    Accusername = data[0].username
}

//Displays the bookings in a table format.
//The table changes dependant on the Account that is logged in (Staff or Customer)
//Displays "No Bookings made" if the bookings passed into the function is empty
function displayBookings(data) {
    const table = document.querySelector('table tbody')
    console.log(data)
    if (data.length === 0) {
        table.innerHTML = "<tr><td class='NoData' colspan='6'>No Bookings Made</td></tr>"
        AccBookings = data.length
        setAccountDetails();
        setDisplayInfo(data.length);
        return;
    } else {
        AccBookings = data.length
        setAccountDetails();
        if (localStorage.getItem("AccType") === "Customer") {
            setDisplayInfo(data.length, data[data.length - 1].Resname, data[data.length - 1].location, data[data.length - 1].date)
            document.getElementById("FirstCol").innerText = "Restaurant Name"
            document.getElementById("SecondCol").innerHTML = `<th>Location</th>`
            document.getElementById("LastCol").innerHTML = `<th>Cancel Booking</th>`
            let tableHtml = "";
            let tableID = 0;
            data.forEach(function ({Resname, no_of_people, time, date, location}) {
                tableHtml += "<tr>";
                tableHtml += `<td>${Resname}</td>`;
                tableHtml += `<td>${location}</td>`;
                tableHtml += `<td>${no_of_people}</td>`;
                tableHtml += `<td>${time}</td>`;
                tableHtml += `<td>${reverseDate(date)}</td>`;
                tableHtml += `<td><button data-id=${tableID}>Cancel</button></td>`
                tableHtml += "</tr>";
                AllAccBookingsInfo.push(data[tableID]);
                tableID++;
            });
            table.innerHTML = tableHtml;
        } else if (localStorage.getItem("AccType") === "Staff") {
            let tableID = 0;
            setDisplayInfo(data.length, data[0].Resname, data[0].location)
            document.getElementById("FirstCol").innerText = "Customer Name"
            document.getElementById("LastCol").innerHTML = `<th>Approve Booking</th>`
            table.removeAttribute("second")
            let tableHtml = "";
            data.forEach(function ({Cusname, no_of_people, time, date, location}) {
                tableHtml += "<tr>";
                tableHtml += `<td>${Cusname}</td>`;
                tableHtml += `<td>${location}</td>`;
                tableHtml += `<td>${no_of_people}</td>`;
                tableHtml += `<td>${time}</td>`;
                tableHtml += `<td>${reverseDate(date)}</td>`;
                tableHtml += `<td><button>Confirm</button></td>`
                tableHtml += "</tr>";
                AllAccBookingsInfo.push(data[tableID]);
                tableID++;
            });
            table.innerHTML = tableHtml;
        }
    }
}

//Calls the function to make a request to server if the User wants to cancel a booking
function cancelBooking(userDecision) {
    if (userDecision === "No") {
        document.getElementById("id07").style.display = 'none'
    } else if (userDecision === "Yes") {
        deleteBooking();
        getCustomerBookings();
        alert("Booking Canceled");
        document.getElementById("id07").style.display = 'none'
    }
}

//Sets the Account/Restaurant details section of the account page to the correct information dependant on what account type is logged in
function setDisplayInfo(data_size, name, location, date) {
    if (data_size === 0) {
        if (localStorage.getItem("AccType") === "Customer") {
            document.getElementById("ResN").innerText = "No Bookings made"
            document.getElementById("ResL").innerText = ""
            document.getElementById("ResC").innerText = ""
        } else if (localStorage.getItem("AccType") === "Staff" & localStorage.getItem("SignedInResID") === "-1") {
            document.getElementById("ResN").innerText = "No Restaurant Linked with account"
            document.getElementById("ResL").innerText = ""
            document.getElementById("ResC").innerText = ""
        } else if (localStorage.getItem("AccType") === "Staff" & localStorage.getItem("SignedInResID") !== "-1") {
            fetchResData();
        }
    } else {
        if (localStorage.getItem("AccType") === "Customer") {
            document.getElementById("MostRecent").innerText = "Most Recent Booking"
            document.getElementById("ResN").innerText = "Restaurant: " + name
            document.getElementById("ResL").innerText = "Location: " + location
            document.getElementById("ResC").innerText = "Date: " + reverseDate(date)
        } else if (localStorage.getItem("AccType") === "Staff") {
            fetchResData();
        }
    }
}

//Display's the Restaurants details fo the Restaurant that is linked to the logged in account
function setRestruantDisplay(data) {
    document.getElementById("MostRecent").innerText = "Restaurant Details"
    document.getElementById("ResN").innerText = "Restaurant: " + data[0].name
    document.getElementById("ResL").innerText = "Location: " + data[0].location
    document.getElementById("ResC").innerText = "Max Capacity: " + data[0].capacity
    ResAccountCap = data[0].capacity
}

//Stores the Restaurant ID, in local storage that is linked with the account that is logged in.
function setAccountResID(data) {
    console.log(data)
    if (data.length > 0) {
        localStorage.setItem("SignedInResID", data[0].R_id)
        disableAddRes(true);
        getStaffBookings();
    } else {
        localStorage.setItem("SignedInResID", "-1")
        getStaffBookings();
    }
}

//Makes sure that a location entered is one that is in the list of location's available to the user
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

//Makes sure that a cusine entered is one that is in the list of cuisine's available to the user
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

//Shows the Graph button if the account that is logged in is of type Staff
function showChartOption() {
    if (localStorage.getItem("AccType") === "Customer") {
        document.getElementById("graphBookings").style.display = 'none'
    }
}

//Changes what is displayed in the bottom section of the Account page either the Table fo bookings or the Graph of bookings
function showChart(display) {
    if (display === "Table") {
        document.getElementById("bookingsChart").style.display = 'none'
        document.getElementById("bookings").style.display = ''
    } else if (display === "Graph") {
        document.getElementById("bookings").style.display = 'none'
        document.getElementById("bookingsChart").style.display = ''
        CalcChartInfo();
    }
}

//Works out all the need information that the chart requires to display each date and each dates number of bookings
function CalcChartInfo() {
    let dates = []
    const bookingNumbers = [0]
    for (let i = 0; i < AllAccBookingsInfo.length; i++) {
        if (!dates.includes(AllAccBookingsInfo[i].date)) {
            let date = AllAccBookingsInfo[i].date
            dates.push(date)
        }
    }

    for (let i = 0; i < dates.length; i++) {
        bookingNumbers[i] = 0
    }

    for (let i = 0; i < dates.length; i++) {
        for (let j = 0; j < AllAccBookingsInfo.length; j++) {
            if (dates[i] === AllAccBookingsInfo[j].date) {
                bookingNumbers[i] = bookingNumbers[i] + AllAccBookingsInfo[j].no_of_people
            }
        }
    }
    for (let i = 0; i < dates.length; i++) {
        dates[i] = reverseDate(dates[i])
    }

    BookingsChart(dates, bookingNumbers);
}

//The Chart object that displays the restaurant's dates and the number of people that have been booked for that date
function BookingsChart(Xdates, YNumberofBookings) {
    const ctx = document.getElementById("bookingsChart").getContext('2d')
    const myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Xdates,
            datasets: [{
                label: 'Bookings per Date',
                data: YNumberofBookings,
                backgroundColor: 'darkblue',
                fill: false,
                borderColor: 'darkblue',
                borderWidth: 1
            }]
        },
        options: {
            title: {
                display: true,
                text: "Bookings per Date",
                fontSize: 30,
                fontColor: "black"

            },
            scales: {
                xAxes: [{
                    ticks: {
                        fontSize: 20
                    }
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        max: ResAccountCap,
                        fontSize: 20
                    }
                }]
            }
        }
    });
}

//Used to reverse the date from YY/MM/DD to DD/MM/YY format
function reverseDate(date) {
    return date.split("-").reverse().join("-");
}

//re-directs to the ViewRestruants webpage
function redirect() {
    window.location.href = "https://devweb2020.cis.strath.ac.uk/~kbb17123/IndividualProject/IndividualProject/ViewRestruants.html"
}

