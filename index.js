// Leopard. A simple way to log school bus users.
// Copyright (c) 2021 Noah Ball.

const express = require('express') // Import express.js (the web server used for Leopard)
let ejs = require('ejs'); // Import EJS (dynamic page generator)
var bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const app = express() // Define Express
const port = 3000 // Port for Leopard's web server to run on

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
    var hours = hours + 14;
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

  if (!req.body.bus || !req.body.date || !req.body.journey || !req.body.name || !req.body.class) {
    res.send('incomplete')
  } else {
    console.log('Bus: ' + req.body.bus + '\nDate: ' + req.body.date + '\nJourney: ' + req.body.journey + '\nName: ' + req.body.name + '\nTutor Class: ' + req.body.class)
    res.send('success');
  }
});

// Functions
function getDate() {
  const dateObj = new Date();
  const month = dateObj.getMonth() + 1;
  const day = String(dateObj.getDate()).padStart(2, '0');
  const year = dateObj.getFullYear();
  const output = day + '/' + month + '/' + year;

  return output;
}