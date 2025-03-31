
const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Make the GET request to the Supabase function
    const response = await fetch('https://bppgpbfiuhpwxvswayey.supabase.co/functions/v1/BlogPost', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_AUTHORIZATION_TOKEN}`,  // Make sure the token is correct
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Handle the case where the API request fails
      console.log('Error fetching blog posts');
      req.flash('message', 'Error occurred while fetching blog posts');
      return res.redirect('/');  // Redirect if there is an error
    }

    const posts = await response.json();  // Parse the JSON response

    res.render('index', { title: 'Blog Posts', posts });  // Render the 'index' template with the fetched posts

  } catch (err) {
    console.log('Error fetching blog posts:', err);
    req.flash('message', 'An error occurred while fetching blog posts');
    res.redirect('/');  // Handle error and redirect if necessary
  }
});

router.get("/create", (req, res) => {
  res.render("create", { title: "Create Post" });
});


router.post("/create", async (req, res) => {
  try {
    // Retrieve the current user's username from the session
    const author = req.session.username;

    if (!author) {
      console.log("No user session found.");
      req.flash('message', 'You need to be logged in to create a post');
      return res.redirect('/user/login');  // Redirect to login if no session is found
    }

    // Prepare the request body for the Supabase function
    const requestBody = {
      title: req.body.title,
      content: req.body.content,
      author: author,  // Use the session's username as the author
    };

    console.log("Request Body: ", requestBody);  // Log the body to ensure it's correct

    // Make the POST request to the Supabase function
    const response = await fetch('https://bppgpbfiuhpwxvswayey.supabase.co/functions/v1/BlogPost/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_AUTHORIZATION_TOKEN}`,  // Authorization header with token
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),  // Send the request body as a JSON string
    });

    if (!response.ok) {
      // Handle errors if the POST request fails
      console.log('Error creating blog post');
      req.flash('message', 'Error occurred while creating the blog post');
      return res.redirect('/');  // Redirect the user on error
    }

    // Successfully created the blog post
    console.log("Blog post created successfully!");
    req.flash('message', 'Blog post created successfully!');
    res.redirect("/");  // Redirect to the homepage after post creation

  } catch (err) {
    console.error("Error in creating post:", err);
    req.flash('message', 'An error occurred while creating the post');
    res.redirect('/');  // Handle error and redirect to home
  }
});

router.get("/post/:id", async (req, res) => {
  try {
    const postId = req.params.id;

    // Fetch the post data from Supabase using the GET request with a query parameter
    const response = await fetch(`https://bppgpbfiuhpwxvswayey.supabase.co/functions/v1/BlogPost?${new URLSearchParams({ id: postId })}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_AUTHORIZATION_TOKEN}`
      }
    });

    const postData = await response.json();
    console.log("Post Data: ", postData);  // Log the post data for debugging

    // If no post was returned from the Supabase function, show a 404 error
    if (response.status !== 200 || !postData || postData.error) {
      return res.status(404).send("Post not found");
    }

    // If post found, render the 'post' view with the post data
    res.render("post", { title: postData.title, post: postData });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).send("Internal server error");
  }
});

router.get("/edit/:id", async (req, res) => {
  try {
    const postId = req.params.id;

    // Fetch the post data from Supabase using the GET request with a query parameter
    const response = await fetch(`https://bppgpbfiuhpwxvswayey.supabase.co/functions/v1/BlogPost?${new URLSearchParams({ id: postId })}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_AUTHORIZATION_TOKEN}`
      }
    });

    const postData = await response.json();
    console.log("Post Data: ", postData);  // Log the post data for debugging

    // If no post was returned from the Supabase function, show a 404 error
    if (response.status !== 200 || !postData || postData.error) {
      return res.status(404).send("Post not found");
    }

    // If post found, render the 'post' view with the post data
    res.render("edit", { title: "Edit Post", post: postData });
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).send("Internal server error");
  }
});

router.post("/edit/:id", async (req, res) => {
  const postId = req.params.id;  // Extract post ID from URL parameter
  const { content, title } = req.body;  // Extract content and title from request body

  try {
    // Prepare the request body for the Edge Function
    const requestBody = {
      id: postId,
      content: content,    // Assuming you're updating content, add other fields as necessary
      title: title
    };

    console.log("Request Body: ", requestBody);  // Log the body to ensure it's correct

    // Send PUT request to the Supabase Edge Function
    const response = await fetch('https://bppgpbfiuhpwxvswayey.supabase.co/functions/v1/BlogPost/edit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_AUTHORIZATION_TOKEN}`  // Replace with actual token
      },
      body: JSON.stringify(requestBody)  // Send the request body as JSON
    });

    // Check the response from the Edge Function
    const result = await response.json();
    
    if (response.ok) {
      // Redirect to the updated post if the update was successful
      res.redirect(`/post/${postId}`);
    } else {
      // Handle any error returned by the Edge Function
      console.error("Error updating blog post:", result);
      res.status(500).send("Failed to update the blog post");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred while updating the post");
  }
});

router.get("/delete/:id", async (req, res) => {
  const postId = req.params.id;  // Extract post ID from URL parameter

  try {
    // Prepare the request body for the Edge Function
    const requestBody = { id: postId };

    // Send DELETE request to the Supabase Edge Function
    const response = await fetch('https://bppgpbfiuhpwxvswayey.supabase.co/functions/v1/BlogPost/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_AUTHORIZATION_TOKEN}`  // Replace with actual token
      },
      body: JSON.stringify(requestBody)  // Send the request body as JSON
    });

    // Check the response from the Edge Function
    const result = await response.json();

    if (response.ok) {
      // If deletion was successful, redirect to the homepage
      return res.redirect('/');

    } else {
      // Handle any error returned by the Edge Function
      console.error("Error deleting blog post:", result);
      res.status(500).send("Failed to delete the blog post");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("An error occurred while deleting the post");
  }
});

router.get("/stats", async (req, res) => {
  try {
    // Make the GET request to the Supabase function
    const response = await fetch('https://bppgpbfiuhpwxvswayey.supabase.co/functions/v1/BlogPost', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_AUTHORIZATION_TOKEN}`,  // Make sure the token is correct
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Handle the case where the API request fails
      console.log('Error fetching blog posts');
      req.flash('message', 'Error occurred while fetching blog posts');
      return res.redirect('/');  // Redirect if there is an error
    }

    const posts = await response.json();  // Parse the JSON response

    const lengths = posts.map(post => post.title.length + post.content.length);
    const stats = {
      average_length: lengths.reduce((a, b) => a + b, 0) / lengths.length,
      median_length: lengths.sort((a, b) => a - b)[Math.floor(lengths.length / 2)],
      max_length: Math.max(...lengths),
      min_length: Math.min(...lengths),
      total_length: lengths.reduce((a, b) => a + b, 0)
    };
    res.render("stats", { title: "Post Statistics", ...stats });

  } catch (err) {
    console.log('Error fetching blog posts:', err);
    req.flash('message', 'An error occurred while fetching blog posts');
    res.redirect('/');  // Handle error and redirect if necessary
  }

});





module.exports = router;
