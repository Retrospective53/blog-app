const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const cors = require('cors')
const blogRouter = require('./controllers/blogs')
const userRouter = require('./controllers/userRouter')
const loginRouter = require('./controllers/login')
const mongoose = require('mongoose')
const app = express()
const middleware = require('./utils/middleware')

mongoose.connect(config.MONGODB_URI)

app.use(express.static('build'))
app.use(cors())
app.use(express.json())

app.use(middleware.tokenExtractor)

app.use('/api/login', loginRouter)
app.use('/api/blogs', blogRouter)
app.use('/api/users', userRouter)

app.use(middleware.errorHandler)

module.exports = app