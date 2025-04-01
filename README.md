# ESE-Assignment-1

## Solution Overview

BlogPost is a simple CRUD application where a user can register a unique account and log in to the application, where they can create, view, edit and delete posts, as well as see some overall stats for the posts. The application is cloned from [another repository](https://github.com/sa-muelj/SQA-Assignment-1) of mine from a previous assignment. It uses Supabase, Node.JS/Express and Pug as its tech stack, also including the use of Render.com to deploy the application.

**Project Aim & Objectives**

The main goal of BlogPost should be to allow users to have a simple and easy to manage blog site. Given its size and nature of functionality, it is designed to allow users to take a ‘fork’ of the application and set up their own application, using Supabase and Render themselves. It is also up to the user should they wish to invite others to their environment, where they can create and share BlogPosts together.

As this project is a fork of a previous assignment, there are some key objectives that I would like to meet:

- Implement Edge Functions within the application for handling REST API calls to the Supabase Project
- Replace the pre-existing SQLite3 database with Supabase integration across all usage of SQLite3
- Clean up error handling
- Deploy the application to a live environment using Render.com

---

## Enterprise Considerations

**Performance**

One particular case of performance enhancement is only calling the Supabase Edge Function API when necessary. This can be seen in (auth.js : 12), authRouter.post(‘/register’).
For registering a new user, there are various validation requirements that must be met, such as:

- No Null values - handled both client side and server side
- Strong Password - handled server side: input value must have a length over 8

Only once the two conditions are met, I then check for a unique user by calling the BlogPost?id= endpoint. The reason for this order is that by placing our validation requiring use of an API last, I have reduced the number of times a request might be made unnecessarily. Whilst not a massive issue in this case, considering when we call an API is an essential consideration in Enterprise Software Engineering, as it can both save time and money.

---

## Scalability

Growth as a factor has been considered across the application, in not only the application usage and data storage but future iterations and features.

For application usage, both Supabase and Render offer ‘premium’ services with more capable databases and deployment services, ranging from upgraded storage capacity to higher performance CPU and RAM options. Whilst not necessary for the current state of the application, it is very easy and accessible to upgrade these integrations, and somewhat affordable at only £20-£30 GBP each. (Supabase. (n.d.). Pricing. Available at: https://supabase.com/pricing (Accessed: 1 April 2025). // Render. (2025). Pricing - Compute. Available at: https://render.com/pricing-2025-03#compute (Accessed: 1 April 2025).)

In terms of future iterations and features, the application is currently developed to allow for easy creation of new routes and features. Effective file structure and a standard URL schema allows for new development to be efficient and developer friendly. Using well known packages for this application removes some of the barrier to a potential new developer on the project as well. Alongside this, both Supabase and Render are user friendly with simple integrations - Supabase provides users with boilerplate code for their REST calls and removes the complexity of SQL from their request bodies, whilst Render at its core only requires you to sign in with GitHub to deploy a repository.

Both factors above place this application in a positive field for future growth and development.

---

## Robustness

One of my key objectives for this iteration of BlogPost was to introduce better error handling and logging, both of which I have achieved. Across both the Express Routers and Supabase integrations, each code block includes error handling to log failures, as well as logging relevant information within the application itself, such as a user logging in.

Logs within the application can be found within the Render deployment as well, providing a more accessible format to read live logs from the application, rather than requiring access to monitor logs in VSCode/GitHub Codespaces.

---

## Security

Across the entire technology stack, security is a key consideration.

**Supabase:**

- When calling an API, I must provide a bearer token provided by Supabase to authenticate the API request.
- This Bearer Token is stored in a dotenv file to ensure correct practice and not include sensitive information in a Git repository.
- In the ‘User’ table, I store a user’s password as the hash, meaning I do not expose or store sensitive information.

**Express:**

- I use BCrypt for password hashing, and never store a user’s input once it has been used for comparing with or creating a hash.
- I also make use of express-session and cookies to protect a user's session, as well as CSRF protection using a sameSite: strict flag.
- I also implement input sanitisation to ensure a user cannot input any malicious code and have this run on the database.

**Frontend/Pug:**

- I have ensured that only the required information is being sent/received to and from the client, as to not expose any unnecessary information to a potential malicious user.

---

## Deployment

The application is hosted and deployed using Render.com, an easy to use and accessible deployment platform for various applications. Whilst the application spins down after ~10 minutes, it will easily start up within 50 seconds of the web page being loaded.

As aforementioned, the application also uses Supabase as a cloud database service. Similar to Render, after a week of inactivity on the project it will pause the project; whilst a slightly more intrusive process to start the database again, it is still simple and easy to do.

---

## Installation and Usage Requirements

**Pre-requesites**

This project uses NodeJS and associated libraries, Supabase and Render. You should have either access to GitHub Codespaces or VS Code installed on your computer, as well as accounts for Supabase and Render.

**Setup Instructions**

- Navigate to the Git Repository and clone it following standard procedures. 
- Once cloned, open in your IDE of choice and run npm install in your bash terminal, which will install all necessary packages.
- Create a .env file and place your Supabase Bearer Token in this file, with a Key: SUPABASE_AUTHORIZATION_TOKEN
- Run npx supabase login - login with your Supabase credentials and follow the steps
- Run npx supabase functions deploy and select your project in the terminal, this will deploy the edge functions in this repository to your Supabase project.
- Change the URL found in API calls to your Supabase Project Reference
- Navigate to Render.com, login to your account and follow the steps to create a new deployment

**Commands**

If testing locally, please use npm start in the terminal to start the application

---

## Feature Overview

**Authentication**

- Handles user registration and sign in to the application
- Code is located in [auth.js](https://github.com/sa-muelj/ESE-Assignment-1/blob/main/routes/auth.js) as well as [index.ts](https://github.com/sa-muelj/ESE-Assignment-1/blob/main/supabase/functions/User/index.ts)
- The endpoint used through Supabase is https://bppgpbfiuhpwxvswayey.supabase.co/functions/v1/User
- Authentication makes use of express, bcrypt, express-session, express-flash, node-fetch and dotenv

**Blog**

- Handles CRUD operations of BlogPosts
- Code is located in [blog.js](https://github.com/sa-muelj/ESE-Assignment-1/blob/main/routes/blog.js) as well as [index.ts](https://github.com/sa-muelj/ESE-Assignment-1/blob/main/supabase/functions/BlogPost/index.ts)
- The endpoint used through Supabase is https://bppgpbfiuhpwxvswayey.supabase.co/functions/v1/BlogPost and one endpoint also includes a url query parameter ?id
- Blog makes use of express, node-fetch, dotenv

---

**Known issues and future enhancements**

As aforementioned, the key limitation is both Supabase and Render having a period of inactivity limit before spinning down the service. Whilst Render will automatically start when requested, Supabase requires manual intervention. This isn’t a huge issue, however is a key consideration towards future enhancements.

One area I’ve identified for future improvement is implementing a global error handler, to provide a standardised and modular approach to error handling. This would further enhance the scalability of the application.



