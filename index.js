// Leopard. A simple way to log school bus users.
// Copyright (c) 2021 Noah Ball.

const express = require('express') // Import express.js (the web server used for Leopard)
let ejs = require('ejs'); // Import EJS (dynamic page generator)
var bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
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
    body: 'You\'ve reached Leopard, a simple contact tracing system for school buses. You shouldn\'t be seeing this page.<br>A project by <a href="https://www.noahball.com">Noah Ball</a>.'
  });
});

app.get('/check-in/:school/:bus', (req, res) => {
  if (req.params.school == 'aquinas') {

    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var dayName = days[new Date().getDay()];

    var hours = new Date().getHours();
    console.log(hours)
    var ampm = (hours >= 12) ? "PM" : "AM";

    res.render('checkin', {
      busNumber: req.params.bus,
      currentDay: dayName,
      date: getDate(),
      ampm: ampm
    });
  } else {
    res.send(req.params.school + ' does not currently use Leopard.');
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

  //if (!req.body.bus || !req.body.date || !req.body.journey || !req.body.name || !req.body.class) {
  //res.send('incomplete')
  //} else {
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

  res.send('success');
  //}
});

// Functions
function getDate() {
  const dateObj = new Date();
  const month = dateObj.getMonth() + 1;
  const day = String(dateObj.getDate()).padStart(2, '0');
  const year = dateObj.getFullYear();
  const output = day + '-' + month + '-' + year;

  return output;
}

function connectionStatus() {
  const db = admin.database();
  const ref = db.ref('/connection');

  ref.on('value', (snapshot) => {
    if(snapshot.val() == 'online') {
      console.log('Connected to Firebase RTDB.')
    } else {
      console.log('Connected to Firebase RTDB with message: "' + snapshot.val() + '"')
    }
  }, (errorObject) => {
    console.log('Failed to connect to Firebase RTDB: ' + errorObject.name);
  });
}