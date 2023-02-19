const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/user')

userRouter.post('/', async (request, response) => {
    const { username, name, password } = request.body

    if (username.length < 3) {
        response.status(400).send({ error: 'username must be at least 3 characters long'})
        return
    }

    if (password.length <= 3) {
        response.status(400).send({ error: 'password must be at least 3 characters long'})
        return
    }
    const saltRound = 10
    const passwordHash = await bcrypt.hash(password, saltRound)

    const user = new User ({
        username,
        name,
        passwordHash
    })

    const savedUser = await user.save()
    
    response.status(201).json(savedUser)
})

userRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', { user: 0, id: 0})
    response.json(users)
})
module.exports = userRouter