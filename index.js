// Leopard. A simple way to log school bus users.
// Copyright (c) 2021 Noah Ball.

const express = require('express') // Import express.js (the web server used for Leopard)
const app = express() // Define Express
const port = 3000 // Port for Leopard's web server to run on

app.get('/', (req, res) => {
  res.send('<img src="https://www.pngmart.com/files/3/Leopard-PNG-File.png" height="100"><br><br>You\'ve reached Leopard, a simple contact tracing system for school buses. You shouldn\'t be seeing this page.<br>A project by <a href="https://www.noahball.com">Noah Ball</a>.')
})

app.listen(port, () => {
  console.log(`Leopard is running at http://localhost:${port}`)
})
