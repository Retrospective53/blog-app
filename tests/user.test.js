const mongoose = require('mongoose')
const supertest = require('supertest')
const bcrypt = require('bcrypt')

const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
const Blog = require('../models/blog')

const helper = require('./helper')

jest.setTimeout(100000)

describe('when there is initally one user in db', () => {
    beforeAll( async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekeret', 10)
        const user = new User ({ username: 'root', password: passwordHash})

        await user.save()
    })

    test('creation succeds with fresh username', async () => {
        const userAtStart = await helper.userInDb()

        const newUser = {
            username: 'mikuu',
            name: 'Miku Hatsune',
            password: 'mikuu'
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const userAtEnd = await helper.userInDb()
        expect(userAtEnd.length).toBe(userAtStart.length + 1)

        const usernames = userAtEnd.map(user => user.username)
        expect(usernames).toContain(newUser.username)
    })

    test('creation fails with proper status code and message if username is already taken', async () => {
        const userAtStart = await helper.userInDb()

        const newUser = {
            username: 'root',
            name: 'superuser',
            password: 'lolo'
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('expected `username` to be unique')

        const userAtEnd = await helper.userInDb()
        expect(userAtEnd.length).toBe(userAtStart.length)
    })
})

afterAll(async () => {
    await mongoose.connection.close()
})