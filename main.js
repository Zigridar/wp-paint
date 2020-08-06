'use strict'

/** Constants **/
const PORT = 3000

/** libs **/
const express = require('express')

const app = express()

app.listen(PORT, () => {
    console.log(`Server start up on port: ${PORT}`)
})

app.use(express.static('src/html'))
app.use(express.static('src/js'))
app.use(express.static('src/css'))
app.use(express.static('src/img'))
