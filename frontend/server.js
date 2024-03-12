const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');

const app = express();

// View engine to EJS 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Parsing of request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'node_modules')));

// ------------------------------------------------------------------------------------------------------------------

// ☆･ﾟﾟ･｡.✧ LOGIN ☆･ﾟﾟ･｡.✧

// Login screen
app.get('/', function(req, res) {
    res.render("pages/login.ejs", {
    });
});


// Process login screen
app.get('/login', function(req, res) {

    const username = req.query.username;
    const password = req.query.password;

    const url = 'http://127.0.0.1:5000/login';

    axios.get(url, {
        auth: {
            username: username,
            password: password
        }
    })

    // If successful, allow access to main ejs
    .then((response) => {
        if (response.data === 'Successfully Login!') {
            // Successful login
            res.render('pages/success.ejs', {
                user: username,
                auth: true
            });
        } else {
            // Unsuccessful login
            res.render('pages/fail.ejs', {
                user: 'UNAUTHORIZED',
                auth: false
            });
        }
    })
    .catch((error) => {
        console.error('Error Response:', error.response);
    });
});

// Home page
app.get('/home', function(req, res) {
    res.render("pages/success.ejs", {
    });
});

// ------------------------------------------------------------------------------------------------------------------

// ☆･ﾟﾟ･｡.✧ FLOOR ☆･ﾟﾟ･｡.✧

// Get all floors route (floor page)
app.get('/floor', function(req, res) {

    const url = 'http://127.0.0.1:5000/floor/all';

    // GET request to the Flask API 
    axios.get(url, {})
    
    .then((response) => {

        // Extract the floor data from the response
        let floorArray = response.data

        // Passes the floorArray data to the ejs template & render the floor page
        res.render("pages/floor.ejs", {
            floorArray: floorArray
        });      
    })

    .catch((error) => {
        console.error('Error Response:', error.response);
    });
});


// Add a new floor route 
app.post('/floor', function(req, res) {

    const floorLevel = req.body.floorLevel;
    const floorName = req.body.floorName;

    const url = 'http://127.0.0.1:5000/floor';

    // POST request to Flask API
    axios.post(url, {
        floor_level: floorLevel,
        floor_name: floorName
    })

    .then(() => {
       // Refresh page if successful
        res.redirect('/floor');
    })

    .catch(error => {
        console.error('Error Response:', error.response);
    });
});


// Update floor route
app.post('/update-floor', function(req, res) {

    const floorId = req.body.floor_id;
    const updatedLevel = req.body.updatedLevel;
    const updatedName = req.body.updatedName;

    // Url for the Flask API; including the floorId as a query parameter
    const url = `http://127.0.0.1:5000/floor?id=${floorId}`;

    // Create an object to hold the data to be updated
    const updatedData = {};

    // Check to see which data is provided to be added to the updatedData object
    if (updatedLevel) {
        updatedData.floor_level = updatedLevel;
    }
    if (updatedName) {
        updatedData.floor_name = updatedName;
    }

    // PUT request to the Flask API with the updated data
    axios.put(url, updatedData)
        .then(() => {
            // Refresh page if successful
            res.redirect('/floor');      
        })

        .catch(error => {
            console.error('Error Response:', error.response);
    });
});


// Delete floor route
app.post('/delete-floor', function(req, res) {

    // Extract floorId from the request body
    const floorId = req.body.floor_id;

    // Url for the Flask API; including the floorId as a query parameter
    const url = `http://127.0.0.1:5000/floor?id=${floorId}`;

    // DELETE request to the Flask API w/ the provided ID
    axios.delete(url)
    .then(() => {
        // Refresh page if successful
        res.redirect('/floor');
    })

    .catch(error => {
        console.error('Error Response:', error.response);
    });
});

// ------------------------------------------------------------------------------------------------------------------

// ☆･ﾟﾟ･｡.✧ ROOM ☆･ﾟﾟ･｡.✧

// Get all rooms route (room page)
app.get('/room', function(req, res) {

    const roomUrl = 'http://127.0.0.1:5000/room/all';
    const floorUrl = 'http://127.0.0.1:5000/floor/all'; 
  
    // Multiple requests to the Flask API to fetch both room and floor data
    axios.all([
        axios.get(roomUrl),
        axios.get(floorUrl)
    ])

    .then(function (responses) {
        // Extract responses from the axios.all array
        const roomResponse = responses[0];
        const floorResponse = responses[1];

        const roomArray = roomResponse.data;
        const floorArray = floorResponse.data

        // Init empty object to store floor data
        const floorData = {};

        // loop through floor response and assign key value pairs with the floor id being the key
        for (let i = 0; i < floorResponse.data.length; i++) {
            const floor = floorResponse.data[i];
            floorData[floor.floor_id] = floor;
        }

        // Combine room and floor data
        const combinedData = [];
        for (let i = 0; i < roomArray.length; i++) {
            const room = roomArray[i];
            // Retrieves the corresponding floor data using the floor_id of the current room
            const floor = floorData[room.floor_id];

            // Push the needed data into combinedData
            combinedData.push({
                room_number: room.room_number,
                floor_level: floor.floor_level,
                room_capacity: room.room_capacity,
                room_id: room.room_id
            });
        }

        // Passes the combinedData to the ejs template & render the room page
        res.render("pages/room.ejs", {
            roomArray: combinedData,
            floorArray: floorArray
        });
    })

    .catch(error => {
        console.error('Error Response:', error.response);
    });
});


// Add a new room route 
app.post('/room', function(req, res) {

    const roomNum = req.body.roomNum;
    const roomCapacity = req.body.roomCapacity;
    const floorLevel = req.body.floorLevel;
  
    const floorUrl = 'http://127.0.0.1:5000/floor/all'; 

    // GET request to fetch floor data
    axios.get(floorUrl)
        .then(floorResponse => {

            // Extract floor data from the response
            const floorArray = floorResponse.data;

            // Fnd the floor that matches the specified floor level (since user can only provide floor level and not id)
            const floor = floorArray.find(floor => floor.floor_level === parseInt(floorLevel));

            if (floor) {
                // If a matching floor is found, make a POST request 
                const roomUrl = 'http://127.0.0.1:5000/room';
                return axios.post(roomUrl, {
                    room_number: roomNum,
                    room_capacity: roomCapacity,
                    floor_id: floor.floor_id 
                });       
            };
        })

        .then(() => {
            // Refresh page if successful
            res.redirect('/room');
        })

        .catch(error => {
            console.error('Error Response:', error.response);
        });
});


// Update room route
app.post('/update-room', function(req, res) {

    const updatedfloorLevel = req.body.updatedfloorLevel;
    const updatedRoomCapacity = req.body.updatedRoomCapacity;
    const updatedRoomNum = req.body.updatedRoomNum;
    const roomId = req.body.room_id;

    // Url for the Flask API; including the roomId as a query parameter
    const url = `http://127.0.0.1:5000/room?id=${roomId}`;

    // Create an object to hold the data to be updated
    const updatedData = {};

    // Check to see which data is provided to be added to the updatedData object
    if (updatedfloorLevel) {
        updatedData.floor_level = updatedfloorLevel;
    }
    if (updatedRoomCapacity) {
        updatedData.room_capacity = updatedRoomCapacity;
    }
    if (updatedRoomNum) {
        updatedData.room_number = updatedRoomNum;
    }

    // PUT request to the Flask API with the updated data
    axios.put(url, updatedData)
        .then(() => {
            // Refresh page if successful
            res.redirect('/room');
        })

        .catch(error => {
            console.error('Error Response:', error.response);   
    });
});


// Delete room route
app.post('/delete-room', function(req, res) {

    // Extract room id from the request body
    const roomId = req.body.room_id;

     // Url for the Flask API; including the roomId as a query parameter
    const url = `http://127.0.0.1:5000/room?id=${roomId}`;

    // DELETE request to the Flask API w/ the provided ID
    axios.delete(url)
    .then(() => {
        // Refresh page if successful
        res.redirect('/room');
    })

    .catch(error => {
        console.error('Error Response:', error.response);
    });
});

// ------------------------------------------------------------------------------------------------------------------

// ☆･ﾟﾟ･｡.✧ RESIDENT ☆･ﾟﾟ･｡.✧

// Get all residents route (resident page)
app.get('/resident', function(req, res) {

    const residentUrl = 'http://127.0.0.1:5000/resident/all'; 
    const roomUrl = 'http://127.0.0.1:5000/room/all';
  
    // Multiple requests to the Flask API to fetch both room and resident data
    axios.all([
        axios.get(roomUrl),
        axios.get(residentUrl)
    ])

    .then(function (responses) {
        // Extract responses from the axios.all array
        const roomResponse = responses[0];
        const residentResponse = responses[1];

        // Extract resident data from the room response
        const residentArray = residentResponse.data;
        // Init empty object to store room data
        const roomData = {};

        const roomArray = roomResponse.data

        // Loop through room response and assign key value pairs with the room id being the key
        for (let i = 0; i < roomResponse.data.length; i++) {
            const room = roomResponse.data[i];
            roomData[room.room_id] = room;
        }

        // Combine room and resident data
        const combinedData = [];
        for (let i = 0; i < residentArray.length; i++) {
            const resident = residentArray[i];
            // Retrieves the corresponding room data using the room_id of the current resident
            const room = roomData[resident.room_id];

            // Push the needed data into combinedData
            combinedData.push({
                resident_firstname: resident.resident_firstname,
                resident_lastname: resident.resident_lastname,
                resident_age: resident.resident_age,
                room_number: room.room_number,
                resident_id: resident.resident_id,
            });
        }

        // Passes the combinedData to the ejs template & render the resident page
        res.render("pages/resident.ejs", {
            residentArray: combinedData,
            roomArray: roomArray
        });
    })

    .catch(error => {
        console.error('Error Response:', error.response);
    });
});


// Add a new resident route 
app.post('/resident', function(req, res) {

    const residentFirstName = req.body.residentFirstName;
    const residentLastName = req.body.residentLastName;
    const residentAge = req.body.residentAge;
    const roomNum = req.body.roomNum;
  
    const roomUrl = 'http://127.0.0.1:5000/room/all'; 

    // GET request to fetch room data
    axios.get(roomUrl)
        .then(roomResponse => {

            // Extract room data from the response
            const roomArray = roomResponse.data;

            // Find the room that matches the specified room num (since user can only provide room num and not id)
            const room = roomArray.find(room => room.room_number === parseInt(roomNum));

            if (room) {
                // If a matching room is found, make a POST request 
                const residentUrl = 'http://127.0.0.1:5000/resident';
                return axios.post(residentUrl, {
                    resident_firstname: residentFirstName,
                    resident_lastname: residentLastName,
                    resident_age: residentAge,
                    room_id: room.room_id
                });       
            };
        })

        .then(() => {
            // Refresh page if successful
            res.redirect('/resident');
        })

        .catch(error => {
            console.error('Error Response:', error.response);
        });
});


// Update resident route
app.post('/update-resident', function(req, res) {

    // Extract data from the request 
    const residentFirstName = req.body.residentFirstName;
    const residentLastName = req.body.residentLastName;
    const residentAge = req.body.residentAge;
    const roomNum = req.body.roomNum;
    const residentId = req.body.resident_id;

    // Url for the Flask API; including the residentId as a query parameter
    const url = `http://127.0.0.1:5000/resident?id=${residentId}`;

    // Create an object to hold the data to be updated
    const updatedData = {};

    // Check to see which data is provided to be added to the updatedData object
    if (residentFirstName) {
        updatedData.resident_firstname = residentFirstName;
    }
    if (residentLastName) {
        updatedData.resident_lastname = residentLastName;
    }
    if (residentAge) {
        updatedData.resident_age = residentAge;
    }
    if (roomNum) {
        updatedData.room_number = roomNum;
    }

    // PUT request to the Flask API with the updated data
    axios.put(url, updatedData)
        .then(() => {
            // Refresh page if successful
            res.redirect('/resident');
        })

        .catch(error => {
            console.error('Error Response:', error.response);   
    });
});


// Delete resident route
app.post('/delete-resident', function(req, res) {

    // Extract resident id from the request body
    const residentId = req.body.resident_id;

     // Url for the Flask API; including the residentId as a query parameter
    const url = `http://127.0.0.1:5000/resident?id=${residentId}`;

    // DELETE request to the Flask API w/ the provided ID
    axios.delete(url)
    .then(() => {
        // Refresh page if successful
        res.redirect('/resident');
    })

    .catch(error => {
        console.error('Error Response:', error.response);
    });
});

// ------------------------------------------------------------------------------------------------------------------

// Starts the server on port 8080
app.listen(8080);
console.log('port 8080 starting');