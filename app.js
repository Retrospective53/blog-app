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
const path = require('path')

mongoose.connect(config.MONGODB_URI)


app.use(cors())
app.use(express.json())

app.use(middleware.tokenExtractor)

app.use('/api/login', loginRouter)
app.use('/api/blogs', blogRouter)
app.use('/api/users', userRouter)

app.use(express.static(path.join(__dirname, 'build')))
const handler = (req, res) => res.sendFile(path.join(__dirname, "build/index.html"))
const routes = ["/", "/blogs", "/users"]
routes.forEach( route => app.get(route, handler))
app.get('/blogs/:id', (req, res) => {
  const id = req.params.id
  res.sendFile(path.join(__dirname, "build/index.html"))
})
app.get('/users/:id', (req, res) => {
  const id = req.params.id
  res.sendFile(path.join(__dirname, "build/index.html"))
})

app.use(middleware.unknownEndPoint)
app.use(middleware.errorHandler)

module.exports = app