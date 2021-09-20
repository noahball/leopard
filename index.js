// Leopard. A simple way to log school bus users.
// Copyright (c) 2021 Noah Ball.

const express = require('express') // Import express.js (the web server used for Leopard)
let ejs = require('ejs'); // Import EJS (dynamic page generator)
var bodyParser = require('body-parser'); // Parser
const cookieParser = require("cookie-parser"); // Parser
const axios = require('axios'); // Outgoing HTTP requests
const app = express() // Define Express
const port = 3000 // Port for Leopard's web server to run on

var config = require('./config.json'); // Config File

// Firebase
const admin = require('firebase-admin'); // Firebase package
const serviceAccount = require(config.serviceAccount); // Import Firebase authentication info
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount), // Service Account
  databaseURL: config.databaseURL // URL for RTDB
});
var db = admin.database(); // Define RTDB

connectionStatus(); // Log the connection state (function at bottom of file)
console.log('Server time: ' + new Date().getHours() + ':xx. Please ensure this is the same as where Leopard is used, else bus route times may break.') // Log the time settings in the environment. Using a different time to the place that Leopard is used can muck up AM/PM trip logging, Good Morning/Afternoon messages and more.

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser()); // To read cookies (such as the session ID for the admin page)

const {
  render
} = require('ejs'); // EJS (rendering engine)
const {
  response
} = require('express');

// Use ejs to render pages
app.set('view engine', 'ejs');

// Serve static files from the static directory
app.use('/static', express.static('static'))

app.get('/', (req, res) => { // Splash page at /
  res.render('splash', {
    body: 'You\'ve reached Leopard, a simple contact tracing system for school buses.<br><b>Please scan a Leopard QR code to check-in.</b><br>A project by <a href="https://www.noahball.com">Noah Ball</a>.'
  });
});

app.get('/check-in/:school/:bus', (req, res) => { // Check-in page
  if (req.params.school == config.school) { // If the school in the URL is the school that Leopard is being used at

    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var dayName = days[new Date().getDay()]; // Store the current day name in a variable

    var hours = new Date().getHours(); // Get the current hour
    var ampm = (hours >= 12) ? "PM" : "AM"; // Is it currently AM or PM?
    var timeOfDay = (hours >= 12) ? "Afternoon" : "Morning"; // AM/PM > Morning/Afternoon translation

    var busFormatted = req.params.bus.toLowerCase(); // Turns out Firebase is case-sensitive, so format it how we like it!

    res.render('checkin', { // Render the check-in page
      busNumber: busFormatted, // Bus number grabbed from the request URL
      currentDay: dayName, // Current day
      date: getDate(), // Current date (grabbed from function at the bottom of this file)
      ampm: ampm, // Is it AM or PM right now?
      timeOfDay: timeOfDay, // Is it the morning or afternoon?
      recaptchaSite: config.recaptchaSite,
      schoolColour: config.schoolColour,
      schoolTextColour: config.schoolTextColour
    });
  } else { // If the school in the URL is not the school that Leopard is being used at
    res.render('splash', { // Render the splash screen...
      body: req.params.school + ' does not use this Leopard instance.' // ...but set the text differently
    });
  }
});

app.get('/privacy', (req, res) => { // Rendering the privacy page (no need for variables as it's static) 
  res.render('privacy');
});

app.post('/api/v1/check-in', (req, res) => { // Endpoint to log a check-in
  if (!req.body.bus || !req.body.date || !req.body.journey || !req.body.name || !req.body.class || !req.body.recaptchaResponse) { // If any of the submitted fields are empty
    res.redirect('/check-in/' + config.school + '/' + req.body.bus + '?signed-in=incomplete'); // Return them to the check-in page and throw a "incomplete" message
  } else { // If all fields contain data

    // reCAPTCHA Verification
    const captchaURL = `https://www.google.com/recaptcha/api/siteverify`
    // Get the token from the form
    const key = req.body['recaptchaResponse'];
    const recpatchaSecret = config.recpatchaSecret;

    axios({
      url: captchaURL + `?secret=` + recpatchaSecret + `&response=` + key,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
    }).then((captchaRes) => {
      const data = captchaRes.data
      if (!data.success === true || !data.score > 0.5) {
        res.redirect('/check-in/' + config.school + '/' + req.body.bus + '?signed-in=recaptcha-failed');
      } else {
        // If all fields contain data
        const db = admin.database(); // Define the DB
        const ref = db.ref('/check-in'); // Define the reference to use

        var busFormatted = req.body.bus.toLowerCase(); // Turns out Firebase is case-sensitive, so format it how we like it!
        var journeyFormatted = req.body.journey.toUpperCase(); // Same as above, but time is upper instead of lowercase!

        const schoolArraysRef = ref.child(config.school + '/' + req.body.date + '/' + busFormatted + '/' + journeyFormatted); // Extend on the reference to get the location that data will be stored
        schoolArraysRef.once("value", function (data) { // Read data from the reference above

          try {
            var currentID = data.val().currentID; // Attempts trying to find the current array ID
          } catch (err) { // This block runs if an error is thrown above - which is usually because the array ID hasn't been set - meaning this is probably a first check-in for this bus ride/time
            schoolArraysRef.update({ // Create the currentID object. Using .update instead of .set, else all data at schoolArraysRef would be overwritten - even if we don't set it here!
              currentID: 0
            });
            var currentID = 0; // Grabbing the current ID from data.val() would crash the program here. I assume this is because currentID did not exist when we grabbed data from schoolArraysRef. The data inside the schoolArraysRef.once function doesn't update because we're using .once - only grab the data once. We could use .on and grab the data from data.val(), however that would create an event listener and cause many new complications (including endlessly looping and spamming the RTDB until a stack overload), so we'll just manually set this variable to zero - since that's the only value it'd need to be set to under a normal scenario that this code block is run.
          }

          var newID = currentID + 1; // Get the value for the new "currentID" - for when this code block is run when we need to add more check-ins
          schoolArraysRef.update({
            [`students/` + currentID]: req.body.name, // Update schoolArraysRef/students/num with the name of the student.
            [`studentsTutor/` + currentID]: req.body.class, // Update schoolArraysRef/studentsTutor/num with the student's tutor class.
            currentID: newID // Update the currentID
          });
        });

        res.redirect('/check-in/' + config.school + '/' + req.body.bus + '?signed-in=success'); // If we get to here, everything worked nicely! Return the user back from the API endpoint to the check-in page with a success message.
      }
    }).catch((error) => {
      console.log('reCAPTCHA - HTTP POST Error: ' + error)
      res.redirect('/check-in/' + config.school + '/' + req.body.bus + '?signed-in=error&error=' + error);
    })
  }
});

app.post('/api/v1/lookup', (req, res) => { // Lookup endpoint (for grabbing lists of students who checked in at a specific bus/time)
  if (!req.body.bus || !req.body.date || !req.body.journey || !req.body.idToken) { // If not all fields are filled
    res.redirect('/admin' + '?result=incomplete'); // Redirect to admin page and throw an incomplete message
  } else {
    var idToken = req.body.idToken;
    admin.auth().verifyIdToken(idToken) // So they provided an ID token, but is it a real ID token?
      .then(function (decodedToken) { // Yes, it's a real token!

        // They're genuine, let them through the floodgates.

        const db = admin.database(); // Define the database
        const requestedRef = db.ref(`/users/` + config.school + `/` + decodedToken.uid + `/name`); // Database reference

        requestedRef.once('value', (snapshot) => { // Grab the data from the reference above
          var requestedByVar = snapshot.val();
          if (requestedByVar == null) { // Isn't an actual valid id token. Sneaky impostor!
            res.redirect('/login');
            return
          }
          // Else if all fields are filled
          // Swap from American date format to Aotearoa date format
          var dateString = req.body.date; // Grab the date from the date field
          dateString = dateString.substr(8, 2) + "-" + dateString.substr(5, 2) + "-" + dateString.substr(0, 4); // HTML date fields display the date differently to us, so we'll rearrange it to suit the way we format the date (which is DD-MM-YYYY)
          // Grab positions 8 and 9 from req.body.date (DD)
          // Grab positions 5 and 6 from req.body.date (MM)
          // Grab positions 0, 1, 2, 3 and 4 from req.body.date (YYYY)
          // All of this is merged together into our DD-MM-YY format.

          var busFormatted = req.body.bus.toLowerCase(); // Turns out Firebase is case-sensitive, so format it how we like it!
          var journeyFormatted = req.body.journey.toUpperCase(); // Same as above, but time is upper instead of lowercase!
          const ref = db.ref('/check-in'); // Database reference

          const schoolRef = ref.child(config.school + '/' + dateString + '/' + busFormatted + '/' + journeyFormatted); // Expand on the database reference to the location we want to read data from

          schoolRef.once('value', (data) => { // Read the data
            try { // Try this
              var studentsArray = data.val().students; // Grab the students' names for the bus/time in question. This is retrieved as an array from Firebase
              var tutorsArray = data.val().studentsTutor; // Grab the students' tutor classes for the bus/time in question. This is retrieved as an array from Firebase

              var timeOfDay = (journeyFormatted == "PM") ? "afternoon" : "morning"; // If after 12pm, it's afternoon, else it's morning

              res.render('results', { // Render the results page
                busNumber: busFormatted, // Bus number looked up
                date: dateString, // Date looked up
                timeOfDay: timeOfDay, // Journey time in morning/afternoon format
                students: studentsArray, // Students array
                tutors: tutorsArray, // Tutor classes array
                resultsFound: true, // Yes, we found results
                requestedBy: requestedByVar // Who requested these results
              });
            } catch (err) { // An error is normally encountered when trying to grab the students array above when there aren't any check-ins for the specified params!
              try {
                // Trying to narrow down the error here. Don't want to return a 'no results' message if a different error was encountered. A null value always crashes node... so I can't just simply check for it :/
                var studentsArray = data.val().students;
                res.render('splash', { // Render the splash screen...
                  body: 'Something went wrong. Debug information for nerds:<br>' + err // ...but set the text differently
                }); // This response will only run if there's an error with running the line before, meaning that the students value was successfully recieved from Firebase, but something else is amiss.
                console.log('An unexpected error was encountered: ' + err); // Log it, because something really went to custard!
              } catch (err) { // There was an error in the try statement - normally this is that execution stopped because data.val().students is empty (there is no data for the params entered!). Assume this, and throw a no results found screen.
                res.render('results', { // Render the results page
                  resultsFound: false // No, we didn't find any results matching the criteria provided
                });
              }
            }
          }, (errorObject) => { // Error encountered related to Firebase
            res.render('splash', { // Render the splash screen...
              body: 'Something went wrong. Debug information for nerds:<br>' + errorObject.name // ...but set the text differently
            }); // Tell the user the nerdy debug info so I look cool (yikes!)
            console.log('An unexpected error was encountered: ' + errorObject.name); // Log it, because something really went to custard!
          });
        }).catch(function (error) { // IMPOSTOR! IMPOSTOR! AMOGUS SUS
          // Check if their ID token actually just expired...
          if (error != "Error: Firebase ID token has expired. Get a fresh ID token from your client app and try again (auth/id-token-expired). See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token." && error != "Firebase ID token has invalid signature. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.") {

            // Definitely a fake ID token! IMPOSTOR! IMPOSTOR! IMPOSTOR! IMPOSTOR! IMPOSTOR! IMPOSTOR! IMPOSTOR! IMPOSTOR! 
            res.render('splash', {
              body: 'Something went wrong. Debug information for nerds:<br>' + error + '<br>Please try signing in again <a href="/login">here</a>.' // Tell the sussy baka an error in case my code funked up
            });
          } else {
            res.redirect('/login'); // Else, their ID token has expired. Chuck em to the login page, and it'll automagically update it without them needing to enter their credentials again, it'll throw them back here and this code will run again (and hopefully not loop them into oblivion #nocookiesusersffs)
          }
        });
      }, (errorObject) => {
        var error = errorObject.message;
        console.log(error);
        // Check if their ID token actually just expired...
        if (error != "Error: Firebase ID token has expired. Get a fresh ID token from your client app and try again (auth/id-token-expired). See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token." && error != "Firebase ID token has invalid signature. See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.") {

          // Definitely a fake ID token! IMPOSTOR! IMPOSTOR! IMPOSTOR! IMPOSTOR! IMPOSTOR! IMPOSTOR! IMPOSTOR! IMPOSTOR! 
          res.render('splash', {
            body: 'Something went wrong. Debug information for nerds:<br>' + error + '<br>Please try signing in again <a href="/login">here</a>.' // Tell the sussy baka an error in case my code funked up
          });
        } else {
          res.redirect('/login'); // Else, their ID token has expired. Chuck em to the login page, and it'll automagically update it without them needing to enter their credentials again, it'll throw them back here and this code will run again (and hopefully not loop them into oblivion #nocookiesusersffs)
        }
      });
  }
});

app.get('/login', (req, res) => {
  res.render('login'); // Render the static /login page (authentication is handled through client side JS - it's just easier - see /static/login.js)
});

app.get('/signup', (req, res) => {
  res.render('signup'); // Render the static /signup page (authentication is handled through client side JS - it's just easier - see /static/login.js)
});

app.get('/admin', (req, res) => { // /admin page
  var idToken = req.cookies['sessionid']; // Grab the ID token set when the user logs in (this token is set in /static/login.js)
  if (idToken == null) { // If the idToken cookie doesn't exist
    return res.redirect('/login'); // Make the user log in (impostor!)
  }

  admin.auth().verifyIdToken(idToken) // So they provided an ID token, but is it a real ID token?
    .then(function (decodedToken) { // Yes, it's a real token!
      var susIDToken = isSus(decodedToken.uid)
      if (!susIDToken) {
        res.render('admin', {
          idToken: req.cookies['sessionid']
        }); // They're genuine, let them through the floodgates.
      } else if (susIDToken) {
        res.redirect('login');
      }
    }).catch(function (error) { // IMPOSTOR! IMPOSTOR! AMOGUS SUS
      // Check if their ID token actually just expired...
      if (error != "Error: Firebase ID token has expired. Get a fresh ID token from your client app and try again (auth/id-token-expired). See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.") {

        // Definitely a fake ID token! IMPOSTOR! IMPOSTOR! IMPOSTOR! IMPOSTOR! IMPOSTOR! IMPOSTOR! IMPOSTOR! IMPOSTOR! 
        res.render('splash', {
          body: 'Something went wrong. Debug information for nerds:<br>' + error + '<br>Please try signing in again <a href="/login">here</a>.' // Tell the sussy baka an error in case my code funked up
        });
      } else {
        res.redirect('/login'); // Else, their ID token has expired. Chuck em to the login page, and it'll automagically update it without them needing to enter their credentials again, it'll throw them back here and this code will run again (and hopefully not loop them into oblivion #nocookiesusersffs)
      }
    });
});

app.listen(port, () => { // Start Express
  console.log(`Leopard is running at http://localhost:${port}`); // Log the URL/Port (URL doesn't actually matter for accessing the pages themselves, however domain access is whitelisted for access to services like Firebase Authentication on the admin page)
})

// Functions
function getDate() { // Just a function to get the current date in a nice, Firebase-friendly format
  const dateObj = new Date();
  const originalMonth = dateObj.getMonth() + 1;
  if (originalMonth == 1 || originalMonth == 2 || originalMonth == 3 || originalMonth == 4 || originalMonth == 5 || originalMonth == 6 || originalMonth == 7 || originalMonth == 8 || originalMonth == 9) {
    var month = '0' + originalMonth
  }

  const day = String(dateObj.getDate()).padStart(2, '0');
  const year = dateObj.getFullYear();
  const output = day + '-' + month + '-' + year;

  return output;
}

function connectionStatus() { // Connection status thingy because I like being technical, okay?
  const db = admin.database(); // Define the database
  const ref = db.ref('/connection'); // Database reference

  ref.once('value', (snapshot) => { // Grab the data from the reference above
    if (snapshot.val() == 'online') {
      console.log('Connected to Firebase RTDB.') // Boring
    } else {
      console.log('Connected to Firebase RTDB with message: "' + snapshot.val() + '"') // IDK why this is here - maybe if I wanted to throw a fun message or something lol
    }
  }, (errorObject) => {
    console.log('Failed to connect to Firebase RTDB: ' + errorObject.name); // Firebase committed bath toaster SCREAM (or maybe /connection just doesn't exist)
  });
}

//function requestedBy(uid) { // Connection status thingy because I like being technical, okay?
//const db = admin.database(); // Define the database
//const ref = db.ref('/users/aquinas/' + uid + `/name`); // Database reference

//ref.once('value', (snapshot) => { // Grab the data from the reference above
//var personWhoRequested = snapshot.val();
//return personWhoRequested;
//}, (errorObject) => {
//console.log('requestedBy Error: ' + errorObject.name); // Firebase committed bath toaster SCREAM (or maybe /connection just doesn't exist)
//return "Error"
//});
//}

function isSus(uid) {
  const db = admin.database(); // Define the database
  const ref = db.ref('/users/' + config.school + '/' + uid + '/name'); // Database reference

  ref.once('value', (snapshot) => { // Grab the data from the reference above
    if (snapshot.val() != null) { // If the user's name exists (meaning if there's actually a user properly registered with this idea)
      return false; // They aren't sus
    }
  }, (errorObject) => { // Error... beep boop
    return true; // They are very sus!
  });
}

function recaptchaResponse(req, res, next) {
  const captchaURL = `https://www.google.com/recaptcha/api/siteverify`
  // Get the token from the form
  const key = req.body['recaptchaResponse'];
  const secret = config.recpatchaSecret;

  axios({
    url: captchaURL,
    method: 'POST',
    headers: {
      ContentType: 'application/x-www-form-urlencoded'
    },
    body: `secret=${SECRET}&response=${req.body['g-recaptcha-response']}`,
  }).then((captchaRes) => {
    const data = captchaRes.data

    if (data.success === true && data.score > 0.5) {
      console.log('hooman')
    } else {
      console.log('beep boop')
    }
  }).catch((error) => {
    next(error)
  })
}

// Notes:
// Example school assets:
// #333366
// https://lh3.googleusercontent.com/proxy/2LsKu3idlH_dfgQizqLgyQ4hHzP1gHz76KQOX8u711rIUp0-kUk7jqXTm3yy4rT9SpJygkBasb8glE2wPZW35DXln888gIW8D2vhKOmUN0A7