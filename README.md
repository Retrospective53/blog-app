# Blog App

This is a Single Page Application that allows users to view a list of blog posts sorted by the number of likes. Users can click on a post to view more details, as well as leave comments on blog posts. Registration and login are required to access the app, and users can delete their own blog posts.

## Live Demo

A live demo of the application can be found at: https://busy-gray-jackrabbit-fez.cyclic.app/
![Example Image](./example.jpg)

## Technologies Used

This application was built using the following technologies:

- Node.js with Express for the backend
- React with React-Query and useContext for state management
- React-Bootstrap for styling
- MongoDB as the database
- RESTful API
- Token authentication using JSON Web Token (JWT)
- Password hashing using bcrypt

## Getting Started

To run this application locally, follow these steps:

1. Clone the repository using `git clone https://github.com/your_username/blog-app.git`
2. Install dependencies by running `npm install` in both the root directory and the `client` directory
3. Start the server by running `npm start` in the root directory
4. Start the client by running `npm start` in the `client` directory
5. Access the application in your browser at `http://localhost:3000`

## API Endpoints

This application includes the following API endpoints:

- `/posts` - GET, POST
- `/posts/:id` - GET, PUT, DELETE
- `/comments` - POST
- `/comments/:postId` - GET

## Authentication

This application uses token-based authentication with JSON Web Token (JWT). To access the application, users must register and login with valid credentials.

## Future Improvements

Some possible improvements for this application include:

- Implementing pagination for the blog post list
- Adding search functionality for blog posts
- Allowing users to edit their own blog posts
- Adding a feature to allow users to like and dislike blog posts

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
