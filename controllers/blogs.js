const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const Comment = require('../models/comment')
const { userExtractor } = require('../utils/middleware')

blogRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1}).populate('comments')
    response.json(blogs)
})

// const getTokenFrom = request => {
//     const authorization = request.get('authorization')
//     if (authorization && authorization.startsWith('Bearer ')) {
//         console.log(authorization)
//         return authorization.replace('Bearer ', '')
//     }
//     return null
// }

blogRouter.post('/', userExtractor, async (request, response) => {
    const body = request.body
    const user = request.user
    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user._id
    })

    if (!blog.likes || blog.likes < 0) {
        blog.likes = 0
    } 

    if (!blog.url || !blog.title) {
        response.status(400).send('Bad Request: title or url properties missing')
        return
    }
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    // Populate the user field in the saved blog
    const populatedBlog = await Blog.findById(savedBlog._id).populate('user', { username: 1, name: 1 })
    response.status(201).json(populatedBlog)
})

blogRouter.delete('/:id', userExtractor, async (request, response) => {
    const user = request.user
    const blog = await Blog.findById(request.params.id)
    if (blog.user.toString() !== user.id.toString()) {
        return response.status(401).json({ error: 'invalid id'})
    }

    await Blog.findByIdAndDelete(request.params.id)
    console.log(blog.toString())
    user.blogs = user.blogs.filter(b => b.toString() !== blog._id.toString())
    await user.save()
    response.status(204).end()
})

blogRouter.put('/:id', async (request, response) => {
    const body = request.body

    const blogLikes = {
        likes: body.likes
    }

    const updatedLikes = await Blog.findByIdAndUpdate(request.params.id, blogLikes, {new: true})
    response.json(updatedLikes)
    console.log(updatedLikes)
})

// Comment

blogRouter.post('/:id/comments', async (request, response) => {
    const { author, content, is_anonymous } = request.body
    const comment = new Comment({
        blog: request.params.id,
        author,
        content,
        is_anonymous
    })

    const savedComment = await comment.save()
    console.log(savedComment)
    const blog = await Blog.findById(request.params.id)
    blog.comments = blog.comments.concat(savedComment._id)
    await blog.save()

    response.status(201).json(savedComment)
})

blogRouter.get('/:id/comments', async (request, response) => {
    const blog = await Blog.findById(request.params.id).populate('comments')
    response.json(blog)
})

module.exports = blogRouter