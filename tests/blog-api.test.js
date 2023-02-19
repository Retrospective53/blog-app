const mongoose = require('mongoose')
const supertest = require('supertest')
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
require('dotenv')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const { response } = require('../app')

jest.setTimeout(100000)

const initialBlogs = [
    {
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7,
    },
    {
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
    },
    {
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12,
    },
    {
        title: "First class tests",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
        likes: 10,
    },
    {
        title: "TDD harms architecture",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
        likes: 0,
    },
    {
        title: "Type wars",
        author: "Robert C. Martin",
        url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
        likes: 2,
    }  
]

let token = null
beforeAll( async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekeret', 10)
    const user = new User({ username: "sweet", passwordHash})
    await user.save()

    const userForToken = { username: "sweet", id: user.id}
    token = jwt.sign(userForToken, process.env.Secret)
})

beforeEach(async () => {
    await Blog.deleteMany({})

    let blogObject = initialBlogs
        .map(blog => new Blog(blog))
   
    const promiseArray = blogObject.map(blog => blog.save())
    await Promise.all(promiseArray)
})

// test('blog returned as json', async () => {
//     await api
//         .get('/api/blogs')
//         .expect(200)
//         .expect('Content-Type', /application\/json/)
// })


describe('validation return default', () => {

    test('return the correct length', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    
        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(6)
    }, 100000)
    
    test('blog post has id property', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    
        const response = await api.get('/api/blogs')
        expect(response.body[0].id).toBeDefined()
    })
    
    test('a valid blog can be added', async () => {
        const newBlog = {
            title: "Life is short",
            author: "Shoko",
            url: "http://hurt.com/y/2016/05/01/LifeShort.html",
            likes: 10,
        }  
    
        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
    
        const response = await api.get('/api/blogs')
        const blogContent = response.body.map(blog => blog.title)
    
        expect(response.body).toHaveLength(initialBlogs.length + 1)
        expect(blogContent).toContain('Life is short')
    })
    
    
    test('if likes property is missing, default likes to 0', async () => {
        const newBlog = {
            title: 'acchi',
            author: 'kocchi',
            url: 'www.blala.com',
        }
    
        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
    
        const response = await api.get('/api/blogs')
        const addedBlog = response.body.find(blog => blog.title === 'acchi')
        expect(addedBlog.likes).toBe(0)
    })
    
    test('if the title or url properties are missing from the request data, responds with status code 400', async () => {
        const invalidBlog = {
            title: 'acchieee',
            author: 'kocchi',
            likes: 9982
        }
    
        const response = await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(invalidBlog)
            .expect(400)
            .expect('Content-Type', /text\/html/)
        
        expect(response.text).toBe('Bad Request: title or url properties missing')
    })

    test('adding a blog fails with the proper status code 401 unauthorized if a token is not provided', async () => {
        const newBlog = {
            title: 'nyannyan',
            author: 'catneko',
            likes: 7777
        }

        const response = await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)
            .expect('Content-Type', /application\/json/)
        
        expect(response.body.error).toContain('token missing or invalid')
    })
    
})

describe('deletion of a blog', () => {
    test('succes with status code 204', async () => {
        const blogsAtStart = await api.get('/api/blogs')
        const blogToDelete = blogsAtStart.body[0]
        console.log(blogToDelete.id)
        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)
        
        const blogsAtEnd = await api.get('/api/blogs')

        expect(blogsAtEnd.body).toHaveLength(initialBlogs.length - 1)

        const titles = blogsAtEnd.body.map(blog => blog.title)
        expect(titles).not.toContain(blogToDelete.title)
    })
})

describe('updating a blog', () => {
    test('updating the likes', async () => {
        const newLikes = {
            likes: 99999
        }
        
        const blogsAtStart = await api.get('/api/blogs')

        await api
            .put(`/api/blogs/${blogsAtStart.body[0].id}`)
            .send(newLikes)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        
        const blogsAtEnd = await api.get('/api/blogs')
        expect(blogsAtEnd.body[0].likes).toBe(newLikes.likes)
        })
})

afterAll(async () => {
    await mongoose.connection.close()
})