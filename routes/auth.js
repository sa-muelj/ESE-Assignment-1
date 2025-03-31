const express = require('express');
const authRouter = express.Router();
const bcrypt = require('bcrypt');
const session = require('express-session'); // required libraries
require('dotenv').config();
const fetch = require('node-fetch');

authRouter.get('/register', async (req, res) => { // display register page
    res.render('register', { message: req.flash('message') });
});

authRouter.post('/register', async (req, res) => { // POST for registering a user
    let { username, password } = req.body;
    


    if (username == "" || password == "" || username == null || password == null) {        // required fields server side check
        console.log({
            status: "FAILED",
            message: "Empty input fields provided! Please provide data for these fields"
        });
        req.flash('message', 'Empty input fields provided! Please provide data for these fields');
        return res.redirect('/user/register');
    } else if (password.length < 8) {              // password policy check
        console.log({
            status: "FAILED",
            message: "Password is too short! A strong password should be at least 8 characters long"
        });
        req.flash('message', 'Password is too short! A strong password should be at least 8 characters long');
        return res.redirect('/user/register');
    } else {                                       // Check if the user already exists
        
        const userFound = await User.findAll({     // sequelize WHERE query to retrieve usernames - unique field server side check
            where: {
                username: req.body.username,
            },
        });

        if (userFound.length !== 0) {              // If a user already exists
            console.log({
                status: "FAILED",
                message: "User already exists"
            });
        req.flash('message', 'Username already exists! Please choose another');
            return res.redirect('/user/register');
        } else {           
            username = username.trim();
            password = password.trim();                    // removes trailing whitespaces                      
            const saltRounds = 10;
            bcrypt.hash(password, saltRounds).then(async (hashedPassword) => {   // Password encryption
                try {
                    const requestBody = {
                        username: req.body.username,  // Replace with the actual username from the request
                        hashedPassword: hashedPassword      // Replace with the hashed password
                    };

                    console.log(requestBody)
                
                    // Prepare the authorization token from the environment variables
                    const authorizationToken = "Bearer " + process.env.SUPABASE_AUTHORIZATION_TOKEN;
                    console.log(authorizationToken)
                
                    // Make the PUT request to the Supabase Edge Function
                    const response = await fetch('https://bppgpbfiuhpwxvswayey.supabase.co/functions/v1/User', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': authorizationToken  // Add the authorization header
                        },
                        body: JSON.stringify(requestBody)  // Send the request body as a JSON string
                    });

                    if (!response.ok) {
                        // Read the response body as JSON
                        const errorBody = await response.json();
                        // Throw an error with both the status code
                        throw new Error("Request failed with status: " + response.status);
                    }
                    
                    // If the response is successful, process it further
                    const responseBody = await response.json();
                    console.log('Response Body:', responseBody);

                    console.log(response)
                    console.log({
                        status: "SUCCESS",
                        message: "Account created successfully",
                        data: requestBody
                    });
                    req.flash('message', 'Account created successfully! Please log into the application');
                    res.redirect('/user/login');
                } catch (err) {
                    console.log({
                        status: "FAILED",
                        message: "An error occurred while creating user account",
                        response: err

                    });
                    req.flash('message', 'An error occurred. Please try again');
                    res.redirect('/user/register');
                }
            }).catch(err => {
                console.log({
                    status: "FAILED",
                    message: "An error occurred while hashing password"
                });
                req.flash('message', 'An error occurred. Please try again');
                res.redirect('/user/register');
            });
        }
    }
});


authRouter.get('/login', (req, res) => {
    if (req.session && req.session.username) {
      return res.redirect('/');                    // If the user is logged in, redirect them to the home page
    }
    res.render('login', { message: req.flash('message') });                           // Render the login page if not logged in
  });
  

  authRouter.post('/login', async (req, res) => {    // POST to allow user to login
    let { username, password } = req.body;

    if (username == "" || password == "" || username == null || password == null) {        // Server side validation - empty fields
        console.log({
            status: "FAILED",
            message: "Empty fields"
        });
        req.flash('message', 'Invalid username or password. Please try again!');
        return res.redirect('/user/login');
    } else {
        // Replace Sequelize query with a POST request to the /User endpoint
        const requestBody = {
            username: req.body.username,
        };

        try {
            const response = await fetch('https://bppgpbfiuhpwxvswayey.supabase.co/functions/v1/User', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.SUPABASE_AUTHORIZATION_TOKEN}` // Make sure the token is correct
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                // Handle the case where the API request fails
                console.log('Error fetching user data');
                req.flash('message', 'Error occurred while checking user data');
                return res.redirect('/user/login');
            }

            const userFound = await response.json();  // Parse the JSON response

            if (userFound.length > 0) {  
                username = username.trim();
                password = password.trim();  // Remove trailing whitespaces

                const hashedPassword = userFound[0].password; // Assuming the first element in the array is the user

                // Compare passwords using bcrypt
                bcrypt.compare(password, hashedPassword).then((result) => {  // If user exists, compare hashedPassword to password given
                    if (result) {
                        const sessionData = req.session;
                        sessionData.username = username;  // Create session and assign username to session
                        res.redirect('/');
                        console.log({
                            status: "SUCCESS",
                            message: "Signin Successful",
                            data: userFound,
                            data2: sessionData
                        });
                    } else {
                        console.log({
                            status: "FAILED",
                            message: "Invalid password entered"
                        });
                        req.flash('message', 'Invalid username or password. Please try again!');
                        return res.redirect('/user/login');
                    }
                }).catch((err) => {
                    console.log({
                        status: "FAILED",
                        message: "An error occurred while comparing password"
                    });
                    req.flash('message', 'An error occurred. Please try again.');
                    return res.redirect('/user/login');
                });
            } else {
                console.log({
                    status: "FAILED",
                    message: "Invalid credentials"
                });
                req.flash('message', 'Invalid username or password. Please try again!');
                return res.redirect('/user/login');
            }

        } catch (err) {
            console.log({
                status: "FAILED",
                message: "An error occurred while fetching user data"
            });
            req.flash('message', 'An error occurred. Please try again');
            return res.redirect('/user/login');
        }
    }
});

authRouter.get('/logout', (req, res) => {          // Logout route
    if (req.session) {                             // if session exists
      req.session.destroy((err) => {               // destory session
        if (err) {
          return res.status(500).json({ message: 'Failed to log out' });
        }  
        res.clearCookie('connect.sid'); // Clear the session cookie
        res.redirect('/login'); // Redirect to the login page after logout
      });
    } else {                                       // If the session doesn't exist, just redirect to the login page
      res.redirect('/login');
    }
  });
  

module.exports = authRouter;
