const mysql = require('mysql');
const bcryt = require("bcrypt");
const res = require("express");
let instance = null

//creates connection needed to connect to the database
const con = mysql.createConnection({
    host: "localhost",
    user: "*********",
    password: "********",
    database: "********",
    port: 33306
});

//Attempts to connect to the Database
con.connect(function (err) {
    if (err) {
        console.log("Cant connect to DB")
        console.log("The Error: " + err.message)
    } else {
        console.log("DB Connected");
    }
});

//Database the contains all the needed functions to manage the Database
class DB {

    //Returns the Instance of the DB if one has already been made to avoid creating multiple instances of the Database class
    static getDBInstance() {
        return instance ? instance : new DB();
    }

    async CreateBookingsTable() {
        const sql = "CREATE TABLE IF NOT EXISTS Bookings (A_id INT, R_id INT, Resname VARCHAR(256), no_of_people INT, time VARCHAR(256), date VARCHAR(256), location VARCHAR(256), Cusname VARCHAR(256))"
        con.query(sql, function (err) {
            if (err) {
                console.log(err)
            } else {
                console.log("Bookings table Created")
            }
        })
    }

    async CreateLinkedTable() {
        const sql = "CREATE TABLE IF NOT EXISTS LinkedAccRes (A_id INT, R_id INT)"
        con.query(sql, function (err) {
            if (err) {
                console.log(err)
            } else {
                console.log("Linked table Created")
            }
        })
    }

    async CreateDatesTable() {
        const sql = "CREATE TABLE IF NOT EXISTS ResDates (R_id INT, date VARCHAR(256), CurrentCapacity INT)"
        con.query(sql, function (err) {
            if (err) {
                console.log(err)
            } else {
                console.log("Dates table Created")
            }
        })
    }


    async CreateResTable() {
        const sql = "CREATE TABLE IF NOT EXISTS Restaurant (R_id INT,name VARCHAR(256), location VARCHAR(256), capacity INT, cuisine VARCHAR(256), opentime VARCHAR(256), closetime VARCHAR(256))"
        con.query(sql, function (err) {
            if (err) {
                console.log("Error: " + err.message)
            } else {
                console.log("Res Table Created")
            }
        })
    }

    async CreateAccountTable() {
        var sql = "CREATE TABLE IF NOT EXISTS Account (A_id INT,accountType VARCHAR(256), name VARCHAR(256), username VARCHAR(256), password VARCHAR(256))"
        con.query(sql, function (err) {
            if (err) {
                console.log("Error: " + err.message)
            } else {
                console.log("Account Table Created")
            }
        })
    }

    async deltedTableRestaurantRows() {
        let sql = "TRUNCATE TABLE Restaurant";
        con.query(sql, function (err) {
            if (err) {
                console.log("Error: " + err.message)
            } else {
                console.log("Table Res rows deleted")
            }
        });
    }


    async deleteTableAccountRows() {
        let sql = "TRUNCATE TABLE Account";
        con.query(sql, function (err) {
            if (err) {
                console.log("Error: " + err.message)
            } else {
                console.log("Table Account rows deleted")
            }
        })
    }

    async deleteTableLinkedRows() {
        let sql = "TRUNCATE TABLE LinkedAccRes";
        con.query(sql, function (err) {
            if (err) {
                console.log("Error: " + err.message)
            } else {
                console.log("Table LinkedAccRes rows deleted")
            }
        })
    }

    async deleteResDatesRows() {
        let sql = "TRUNCATE TABLE ResDates";
        con.query(sql, function (err) {
            if (err) {
                console.log("Error: " + err.message)
            } else {
                console.log("Table ResDates rows deleted")
            }
        })
    }

    async deleteBookingsRows() {
        let sql = "TRUNCATE TABLE Bookings";
        con.query(sql, function (err) {
            if (err) {
                console.log("Error: " + err.message)
            } else {
                console.log("Table Bookings rows deleted")
            }
        })
    }

    //Build the Search query for the Restaurant search function int he front end.
    //Then query's the database with the custom query and returns the results
    async getSearchData(people, time, type, city) {
        let morethanOne = false;
        const values = [];
        let query = "SELECT * FROM Restaurant";

        if (people !== "") {
            query += ' WHERE capacity > ?';
            values.push(people);
            morethanOne = true;
        }
        if (time !== "") {
            if (morethanOne === false) {
                query += ' WHERE opentime <= ? AND closetime > ?';
                morethanOne = true;
            } else {
                query += ' AND opentime <= ? AND closetime > ?';
            }
            values.push(time);
            values.push(time);

        }
        if (type !== "") {
            if (morethanOne === false) {
                query += ' WHERE cuisine = ?';
                morethanOne = true;
            } else {
                query += ' AND cuisine = ?';
            }
            values.push(type);
        }
        if (city !== "") {
            if (morethanOne === false) {
                query += ' WHERE location = ?';
                morethanOne = true;
            } else if (morethanOne === true) {
                query += ' AND location = ?';
            }
            values.push(city);
        }

        try {
            const response = await new Promise((resolve) => {
                con.query(query, values, function (err, results) {
                    if (err) {
                        console.log(err)
                    }
                    resolve(results);
                });
            });
            return response;

        } catch (error) {
            console.log(error)
        }
    }

    //Inserts an account row into the Account Table given the required information
    async registerAccount(id, type, name, uname, password) {
        let query = "INSERT INTO Account (A_id,accountType, name, username, password) VALUES ?"
        const RowList = []
        RowList.push(arguments[0])
        RowList.push(arguments[1])
        RowList.push(arguments[2])
        RowList.push(arguments[3])
        RowList.push(await this.hasher(arguments[4]))
        const values = []
        values.push(RowList)
        con.query(query, [values], function (err) {
            if (err) {
                console.log(err)
            }
        });
    }

    //Returns True or False if a given username and password is present in a row in the Account table
    async getLogIn(Uname, pass) {
        let found = false
        try {
            const response = await new Promise((resolve) => {
                let query = "SELECT * FROM Account"
                con.query(query, function (err, results) {
                    if (err) {
                        console.log(err)
                    }
                    for (let i = 0; i < results.length; i++) {
                        if ((Uname === results[i].username) & (bcryt.compareSync(pass, results[i].password))) {
                            resolve(results[i])
                            found = true
                            return
                        }
                    }
                    if (found === false) {
                        resolve("false")
                    }
                });
            });
            return response
        } catch (error) {
            console.log(error)
        }
    }

    //Gets the current Max Account ID used in the database
    async getID() {
        try {
            const response = await new Promise((resolve) => {
                let query = "SELECT A_id from Account WHERE A_id =(SELECT max(A_id) FROM Account)"
                con.query(query, function (err, results) {
                    if (err) {
                        console.log(err)
                    } else {
                        resolve(results)
                    }
                });
            });
            return response
        } catch (error) {
            console.log(error)
        }
    }

    //Gets all the account information for a given account ID
    async getAccount(ID) {
        try {
            const response = await new Promise((resolve) => {
                let query = "SELECT * FROM Account WHERE A_id = ?"
                con.query(query, [ID], function (err, results) {
                    if (err) {
                        console.log(err)
                    } else {
                        resolve(results)
                    }
                });
            });
            return response
        } catch (error) {
            console.log(error)
        }
    }

    //Gets all the Restaurant information for a given restaurant ID
    async getRestaurant(R_ID) {
        try {
            const response = await new Promise((resolve) => {
                let query = "SELECT * FROM Restaurant WHERE R_id = ?"
                con.query(query, [R_ID], function (err, results) {
                    if (err) {
                        console.log(err)
                    } else {
                        resolve(results)
                    }
                });
            });
            return response
        } catch (error) {
            console.log(error)
        }
    }

    //Inserts the new Restaurant into the Restaurant table
    async addRes(ID, name, location, cap, cuisine, open, close) {
        try {
            const response = await new Promise(resolve => {
                let query = "INSERT INTO Restaurant (R_id,name,location,capacity,cuisine,opentime, closetime) VALUES ?"
                const RowList = []
                RowList.push(arguments[0])
                RowList.push(arguments[1])
                RowList.push(arguments[2])
                RowList.push(arguments[3])
                RowList.push(arguments[4])
                RowList.push(arguments[5])
                RowList.push(arguments[6])
                const values = []
                values.push(RowList)
                con.query(query, [values], function (err) {
                    if (err) {
                        console.log(err);
                        resolve("Error")
                    } else {
                        resolve("Inserted")
                    }
                });
            });
            return response
        } catch (error) {
            console.log(error)
        }

    }

    //Inserts a new row of Account ID and Restaurant ID to know what account is linked to what Restaurant.
    async insertLinked(A_ID, R_ID) {
        var sql = "INSERT INTO LinkedAccRes (A_id,R_id) VALUES ?";
        const RowList = []
        RowList.push(arguments[0])
        RowList.push(arguments[1])
        const values = []
        values.push(RowList)
        con.query(sql, [values], function (err) {
            if (err) throw err
        })
    }

    //Inserts a row into Bookings for a new booking that has been made
    async insertBookings(A_ID, R_ID, name, people, time, date, location, Cusname) {
        let sql = "INSERT INTO Bookings (A_id,R_id,Resname,no_of_people,time,date,location,Cusname) VALUES ?"
        const RowList = []
        RowList.push(A_ID)
        RowList.push(R_ID)
        RowList.push(name)
        RowList.push(people)
        RowList.push(time)
        RowList.push(date)
        RowList.push(location)
        RowList.push(Cusname)
        const values = []
        values.push(RowList)
        con.query(sql, [values], function (err) {
            if (err) throw err
        })


    }

    //Gets the capacity of a restaurant for a given date
    async getCurrentCap(R_id, date) {
        try {
            const response = await new Promise((resolve) => {
                let query = "SELECT  CurrentCapacity FROM ResDates WHERE R_id = ? AND date = ?"
                con.query(query, [R_id, date], function (err, results) {
                    if (err) {
                        console.log(err)
                    } else {
                        resolve(results)
                    }
                });
            });
            return response
        } catch (error) {
            console.log(error)
        }
    }

    //Inserts new dates that the Restaurant is open for bookings
    async insertDates(ID, date) {
        var sql = "INSERT INTO ResDates (R_id, date, CurrentCapacity) VALUES ?"
        const RowList = []
        RowList.push(arguments[0])
        RowList.push(arguments[1])
        RowList.push(0)
        const values = []
        values.push(RowList)
        con.query(sql, [values], function (err) {
            if (err) throw err
        })
    }

    //Updates the capacity of a date when a new booking is made by adding the existing current capacity and the number of people in the new booking.
    async updateCapacity(ID, bookDate, number) {
        let sql = "UPDATE ResDates SET CurrentCapacity = CurrentCapacity + ? WHERE R_id = ? AND date = ?"
        con.query(sql, [number, ID, bookDate], function (err) {
            if (err) throw err
        })
    }

    //Deleted a booking from the Booking Table given the need information to identify the Booking
    async removeBooking(Resname, people, location, time, date) {
        let sql = "DELETE FROM Bookings WHERE Resname = ? AND no_of_people = ? AND location = ? AND time = ? AND date = ?"
        con.query(sql, [Resname, people, location, time, date], function (err) {
            if (err) throw err
        });
    }

    //Updates the capacity of a date when a booking is deleted by subtracting the existing current capacity and the number of people in the booking that has been deleted
    async removeCapacity(R_id,date,number_of_people){
        let sql = "UPDATE ResDates SET CurrentCapacity = CurrentCapacity - ? WHERE R_id = ? AND date = ?"
        con.query(sql, [number_of_people, R_id, date], function (err) {
            if (err) throw err
        })
    }

    //Gets the current Max Restraint ID used in the database
    async getResID() {
        try {
            const response = await new Promise((resolve) => {
                let query = "SELECT R_id from Restaurant WHERE R_id =(SELECT max(R_id) FROM Restaurant)"
                con.query(query, function (err, results) {
                    if (err) {
                        console.log(err)
                    } else {
                        resolve(results)
                    }
                });
            });
            return response
        } catch (error) {
            console.log(error)
        }
    }

    //Given an Account ID it returns the restaurant ID that is linked with that account
    async getLinkedRes(A_id) {
        try {
            const response = await new Promise((resolve) => {
                let query = "SELECT R_id FROM LinkedAccRes WHERE A_id = ?"
                con.query(query, [A_id], function (err, results) {
                    if (err) {
                        console.log(err)
                    } else {
                        resolve(results)
                    }
                });
            });
            return response
        } catch (error) {
            console.log(error)
        }
    }

    //Returns all the dates that are available for a given Restaurant
    async getDates(R_id) {
        try {
            const response = await new Promise((resolve) => {
                let query = "SELECT date FROM ResDates WHERE R_id = ?"
                con.query(query, [R_id], function (err, results) {
                    if (err) {
                        console.log(err)
                    } else {
                        resolve(results)
                    }
                });
            });
            return response
        } catch (error) {
            console.log(error)
        }
    }

    //Returns all the bookings made by a specific customer
    async getCustomerBookings(A_ID) {
        try {
            const response = await new Promise((resolve) => {
                let query = "SELECT * FROM Bookings WHERE A_id = ?"
                con.query(query, [A_ID], function (err, results) {
                    if (err) {
                        console.log(err)
                    } else {
                        resolve(results)
                    }
                });
            });
            return response
        } catch (error) {
            console.log(error)
        }
    }

    //Returns all the booking made for given Restaurant
    async getStaffBookings(R_ID) {
        try {
            const response = await new Promise((resolve) => {
                let query = "SELECT * FROM Bookings WHERE R_id = ?"
                con.query(query, [R_ID], function (err, results) {
                    if (err) {
                        console.log(err)
                    } else {
                        resolve(results)
                    }
                });
            });
            return response
        } catch (error) {
            console.log(error)
        }
    }

    //Returns all the usernames in the DB
    async getUsernames() {
        try {
            const response = await new Promise((resolve) => {
                let query = "SELECT username FROM Account"
                con.query(query, function (err, results) {
                    if (err) {
                        console.log(err)
                    } else {
                        resolve(results)
                    }
                });
            });
            return response
        } catch (error) {
            console.log(error)
        }
    }

    //Given Text (a password in this case it returns a hash of that password)
    async hasher(text) {
        let hash = bcryt.hashSync(text, 10);
        return hash
    }
}

module.exports = DB;
