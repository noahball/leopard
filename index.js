// Leopard. A simple way to log school bus users.
// Copyright (c) 2021 Noah Ball.

const express = require('express') // Import express.js (the web server used for Leopard)
let ejs = require('ejs'); // Import EJS (dynamic page generator)
var bodyParser = require('body-parser'); // Parser
const cookieParser = require("cookie-parser"); // Parser
const app = express() // Define Express
const port = 3000 // Port for Leopard's web server to run on

// Firebase
const admin = require('firebase-admin');
const serviceAccount = require("./firebase.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://leopard-data-default-rtdb.asia-southeast1.firebasedatabase.app"
});
var db = admin.database();
var ref = db.ref("activation");
var connection = db.ref("/");
var keysRef = ref.child("keys");

connectionStatus();
console.log('Server time: ' + new Date().getHours() + ':xx. Please ensure this is the same as where Leopard is used, else bus route times may break.')

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

const {
  render
} = require('ejs');

// Use ejs to render pages
app.set('view engine', 'ejs');

// Serve static files from the static directory
app.use('/static', express.static('static'))

app.get('/', (req, res) => {
  // res.send('<img src="https://www.pngmart.com/files/3/Leopard-PNG-File.png" height="100"><br><br>You\'ve reached Leopard, a simple contact tracing system for school buses. You shouldn\'t be seeing this page.<br>A project by <a href="https://www.noahball.com">Noah Ball</a>.');
  res.render('splash', {
    body: 'You\'ve reached Leopard, a simple contact tracing system for school buses.<br><b>Please scan a Leopard QR code to check-in.</b><br>A project by <a href="https://www.noahball.com">Noah Ball</a>.'
  });
});

app.get('/check-in/:school/:bus', (req, res) => {
  if (req.params.school == 'aquinas') {

    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var dayName = days[new Date().getDay()];

    var hours = new Date().getHours();
    var ampm = (hours >= 12) ? "PM" : "AM";
    var timeOfDay = (hours >= 12) ? "Afternoon" : "Morning";

    res.render('checkin', {
      busNumber: req.params.bus,
      currentDay: dayName,
      date: getDate(),
      ampm: ampm,
      timeOfDay: timeOfDay
    });
  } else {
    res.render('splash', {
      body: req.params.school + ' does not currently use Leopard.'
    });
  }
});

app.get('/privacy', (req, res) => {
  res.render('privacy');
});

app.listen(port, () => {
  console.log(`Leopard is running at http://localhost:${port}`);
})

app.post('/api/v1/check-in', (req, res) => {
  //const {
  //error
  //} = validate(req.body);
  //if (error) return res.status(400).send('Something went wrong.<br>Error: ' + error.details[0].message + '<br>Press the back button in your browser to try again.');

  if (!req.body.bus || !req.body.date || !req.body.journey || !req.body.name || !req.body.class) {
    res.redirect('/check-in/aquinas/' + req.body.bus + '?signed-in=incomplete');
  } else {
    console.log('Bus: ' + req.body.bus + '\nDate: ' + req.body.date + '\nJourney: ' + req.body.journey + '\nName: ' + req.body.name + '\nTutor Class: ' + req.body.class)

    const db = admin.database();
    const ref = db.ref('/check-in');

    const schoolRef = ref.child('aquinas/' + req.body.date + '/' + req.body.bus + '/' + req.body.journey + '/' + req.body.name);
    schoolRef.set({
      name: req.body.name,
      bus: req.body.bus,
      date: req.body.date,
      class: req.body.class,
      journey: req.body.journey
    });

    res.redirect('/check-in/aquinas/' + req.body.bus + '?signed-in=success');
  }
});

app.post('/api/v1/lookup', (req, res) => {
  //const {
  //error
  //} = validate(req.body);
  //if (error) return res.status(400).send('Something went wrong.<br>Error: ' + error.details[0].message + '<br>Press the back button in your browser to try again.');

  if (!req.body.bus || !req.body.date || !req.body.journey) {
    res.redirect('/lookup' + req.body.bus + '?result=incomplete');
  } else {
    // Swap from American date format to Aotearoa date format
    var dateString = req.body.date;
    console.log(req.body.date);
    dateString = dateString.substr(8, 2)+"-"+dateString.substr(5, 2)+"-"+dateString.substr(0, 4);

    console.log('Bus: ' + req.body.bus + '\nDate: ' + dateString + '\nJourney: ' + req.body.journey)

    const db = admin.database();
    const ref = db.ref('/check-in');

    const schoolRef = ref.child('aquinas/' + dateString + '/' + req.body.bus + '/' + req.body.journey);
    console.log('aquinas/' + dateString + '/' + req.body.bus + '/' + req.body.journey);
    schoolRef.once('value', (data) => {
      console.log(data.val());
    }, (errorObject) => {
      console.log('The read failed: ' + errorObject.name);
    }); 

    res.redirect('/check-in/aquinas/' + req.body.bus + '?signed-in=success');
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/admin', (req, res) => {
  var idToken = req.cookies['sessionid'];
  if (idToken == null) {
    return res.redirect('/login');
  }

  admin.auth().verifyIdToken(idToken)
    .then(function (decodedToken) {
      let uid = decodedToken.uid;
      console.log(uid);
    }).catch(function (error) {
      if(error != "Error: Firebase ID token has expired. Get a fresh ID token from your client app and try again (auth/id-token-expired). See https://firebase.google.com/docs/auth/admin/verify-id-tokens for details on how to retrieve an ID token.") {
        res.render('splash', {
          body: 'An error occured: ' + error + '<br>Please try signing in again <a href="/login">here</a>.'
        });
      } else {
        res.redirect('/login');
      }
    });

    var datesRef = db.ref(`check-in/aquinas`);
    datesRef.once("value", function (data) {
        var dates = data.val();
        console.log(dates);
        res.render('admin');
        try {
            for (var i = 0; i < dates.length; i++) {
                console.log(dates[i]);
            }
        } catch (err) {
            console.log(err);
        }
    });
});

// Functions
function getDate() {
  const dateObj = new Date();
  const originalMonth = dateObj.getMonth() + 1;
  if(originalMonth == 1 || originalMonth == 2 || originalMonth == 3 || originalMonth == 4 || originalMonth == 5 || originalMonth == 6 || originalMonth == 7 || originalMonth == 8 || originalMonth == 9) {
    var month = '0' + originalMonth
  }

  const day = String(dateObj.getDate()).padStart(2, '0');
  const year = dateObj.getFullYear();
  const output = day + '-' + month + '-' + year;

  return output;
}

function connectionStatus() {
  const db = admin.database();
  const ref = db.ref('/connection');

  ref.on('value', (snapshot) => {
    if (snapshot.val() == 'online') {
      console.log('Connected to Firebase RTDB.')
    } else {
      console.log('Connected to Firebase RTDB with message: "' + snapshot.val() + '"')
    }
  }, (errorObject) => {
    console.log('Failed to connect to Firebase RTDB: ' + errorObject.name);
  });
}