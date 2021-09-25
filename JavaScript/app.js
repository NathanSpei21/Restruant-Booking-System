const express = require('express')
const app = express();
const cors = require('cors');
const DBFile = require('./DB');

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended: false}))

//Takes a json object with the search details.
//Converts it to be used in a SQL query then sends the data to the database service.
//Then gets the response from the DB sends it back to the front-end to be displayed.
app.post('/search', (request, response) => {
    const {people} = request.body
    const {time} = request.body
    const {type} = request.body
    const {location} = request.body

    const db = DBFile.getDBInstance();
    const result = db.getSearchData(people, time, type, location);
    result.then(data => response.json({data: data}))
        .catch(err => console.log(err));
});

//register route request to pass the register account info the database
app.post('/register', (request) => {
    const {id} = request.body
    const {Acctype} = request.body
    const {name} = request.body
    const {Uname} = request.body
    const {Pword} = request.body
    const db = DBFile.getDBInstance();
    db.registerAccount(id, Acctype, name, Uname, Pword)
        .catch(err => console.log(err))
});

//get the Account info of a given account ID
app.post('/getAccount', (req, res) => {
    const {ID} = req.body
    const db = DBFile.getDBInstance();
    const result = db.getAccount(ID)
    result.then(data => res.json({data: data}))
        .catch(err => console.log(err))
});

//gets all the customers Bookings given a Cusomter's ID which it passes to the Database
app.post('/getCustomerBookings', (req, res) => {
    const {ID} = req.body
    const db= DBFile.getDBInstance();
    const result = db.getCustomerBookings(ID)
    result.then(data => res.json({data: data}))
        .catch(err => console.log(err))

});

//gets all the Restaurant Bookings that's linked to a staff's account given its ID which it passes to the Database
app.post('/getStaffBookings', (req, res) => {
    const {ID} = req.body
    const db= DBFile.getDBInstance();
    const result = db.getStaffBookings(ID)
    result.then(data => res.json({data: data}))
        .catch(err => console.log(err))

});

//passes the attempted login username and password to the Database
app.post('/signIn', (req, res) => {
    const {Uname} = req.body
    const {Pass} = req.body
    const db = DBFile.getDBInstance();
    const result = db.getLogIn(Uname, Pass);
    result.then(data => res.json({data: data}))
        .catch(err => console.log(err))
});

//deals with the request of getting the current capacity of a given Restaurant on a given date
app.post('/getCurrentCap', (req, res) => {
    const {R_id} = req.body
    const {date} = req.body
    const db = DBFile.getDBInstance();
    const result = db.getCurrentCap(R_id,date)
    result.then(data => res.json({data: data}))
        .catch(err => console.log(err))
});

//passes the Restaurant info to the database in order for it to be added
app.post('/addRes', ((req, res) => {
    const {ID} = req.body
    const {name} = req.body
    const {location} = req.body
    const {capacity} = req.body
    const {cuisine} = req.body
    const {open} = req.body
    const {close} = req.body
    const db = DBFile.getDBInstance();
    const result = db.addRes(ID, name, location, capacity, cuisine, open, close);
    result.then(data => res.json({data: data}))
        .catch(err => console.log(err))
}));

//Adds a entry to know what Staff Account is linked to which Restraint
app.post('/addLink', (req, res) => {
    const {A_ID} = req.body
    const {R_ID} = req.body
    const db = DBFile.getDBInstance();
    db.insertLinked(A_ID, R_ID)
        .catch(err => console.log(err));
});

//Given an accounts ID it retrieves the Restaurants ID which it is linked to
app.post('/getAccID', (req, res) => {
    const {ID} = req.body
    const db = DBFile.getDBInstance();
    const result = db.getLinkedRes(ID)
        result.then(data => res.json({data:data}))
            .catch(err => console.log(err))
});

//Passes dates to the database to be added and shown for cusomters to book on they dates
app.post('/addDates', (req) => {
    const {R_ID} = req.body
    const {Dates} = req.body
    const db = DBFile.getDBInstance();
    for(let i = 0; i < Dates.length; i++) {
        db.insertDates(R_ID,Dates[i])
            .catch(err => console.log(err))
    }
});

//Given a Restaurant ID it gets all the dates that the restaurant has added for availability
app.post('/getDates', (req, res) => {
    const {R_ID} = req.body
    const db = DBFile.getDBInstance();
    const result = db.getDates(R_ID);
    result.then(data => res.json({data:data}))
        .catch(err => console.log(err))
});

//Given a Restaurant ID it retrieves all the restaurant information associated with that ID
app.post('/getResInfo', (req, res) => {
    const {R_ID} = req.body
    const db = DBFile.getDBInstance();
    const result = db.getRestaurant(R_ID)
    result.then(data => res.json({data:data}))
        .catch(err => console.log(err))
})

//Given the needed info it sends all the booking info to the database in order to insert a new bookings to the bookings table
app.post('/addBooking', ((req, res) => {
    const {A_ID} = req.body
    const {R_ID} = req.body
    const {name} = req.body
    const {no_of_people} = req.body
    const {time} = req.body
    const {date} = req.body
    const {location} = req.body
    const {Cusname} = req.body
    const db = DBFile.getDBInstance();
    const result = db.insertBookings(A_ID,R_ID,name,no_of_people,time,date,location,Cusname)
    result.then(data => res.json({data:data}))
        .catch(err => console.log(err))
}));

//Given the needed information it  removes the booking from the bookings table and recalculates the capcity for that date
app.post('/deleteBooking', (req) => {
    const {Resname} = req.body
    const {people} = req.body
    const {location} = req.body
    const {time} = req.body
    const {date} = req.body
    const {R_id} = req.body
    const db = DBFile.getDBInstance();
     db.removeBooking(Resname,people,location,time,date)
         .catch(err => console.log(err))
    db.removeCapacity(R_id,date,people)
        .catch(err => console.log(err))
});

//Given the Restaurant ID and the date it updates the capacity of that date (adds the new booking)
app.post('/updateCap', (req) => {
    const {R_id} = req.body
    const {date} = req.body
    const {number} = req.body
    const db = DBFile.getDBInstance();
    db.updateCapacity(R_id, date, number)
        .catch(err => console.log(err))
});


app.get('/getAll', (req, res) => {
    const db = DBFile.getDBInstance();
    const result = db.getSearchData();
    result.then(data => res.json({data: data}))
        .catch(err => console.log(err));
});

//gets all the usernames in the DB
app.get('/getUsernames', (req, res) => {
    const db = DBFile.getDBInstance();
    const result = db.getUsernames();
    result.then(data => res.json({data: data}))
        .catch(err => console.log(err));
});

//Gets the current max account ID in order to be able to determine what the next ID for an account should be
app.get('/getID', (req, res) => {
    const db = DBFile.getDBInstance();
    const result = db.getID()
    result.then(data => res.json({data: data}))
        .catch(err => console.log(err));
});

//Gets the current max Restaurant ID in order to be able to determine what the next ID for an Restaurant should be
app.get('/getResID', (req, res) => {
    const db = DBFile.getDBInstance();
    const result = db.getResID();
    result.then(data => res.json({data: data}))
        .catch(err => console.log(err));
});


app.listen(5000, () => console.log("App is running"));