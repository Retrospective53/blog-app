const User = require('../models/user')
const Blog = require('../models/blog')

const userInDb = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

module.exports = {
    userInDb
}