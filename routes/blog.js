
const express = require('express');
const { Op } = require('sequelize');

const router = express.Router();
const { BlogPost } = require("../models");

router.get("/", async (req, res) => {
  const posts = await BlogPost.findAll();


  res.render('index', { title: 'Blog Posts', posts });


});

router.get("/create", (req, res) => {
  res.render("create", { title: "Create Post" });
});

router.post("/create", async (req, res) => {
  await BlogPost.create(req.body);
  res.redirect("/");
});

router.get("/post/:id", async (req, res) => {
  const post = await BlogPost.findByPk(req.params.id);
  if (post) {
    res.render("post", { title: post.title, post });
  } else {
    res.status(404).send("Post not found");
  }
});

  
router.get("/edit/:id", async (req, res) => {
  const post = await BlogPost.findByPk(req.params.id);
  if (post) {
    res.render("edit", { title: "Edit Post", post });
  } else {
    res.status(404).send("Post not found");
  }
});

router.post("/edit/:id", async (req, res) => {
  const post = await BlogPost.findByPk(req.params.id);
  if (post) {
    await post.update(req.body);
    res.redirect(`/post/${post.id}`);
  } else {
    res.status(404).send("Post not found");
  }
});

router.post("/delete/:id", async (req, res) => {
  const post = await BlogPost.findByPk(req.params.id);
  if (post) {
    await post.destroy();
    res.redirect("/");
  } else {
    res.status(404).send("Post not found");
  }
});

router.get("/stats", async (req, res) => {
  const posts = await BlogPost.findAll();
  const lengths = posts.map(post => post.title.length + post.content.length);
  const stats = {
    average_length: lengths.reduce((a, b) => a + b, 0) / lengths.length,
    median_length: lengths.sort((a, b) => a - b)[Math.floor(lengths.length / 2)],
    max_length: Math.max(...lengths),
    min_length: Math.min(...lengths),
    total_length: lengths.reduce((a, b) => a + b, 0)
  };
  res.render("stats", { title: "Post Statistics", ...stats });
});

router.get('/search', async (req, res) => {  
  const query = req.query.query;

    // Debugging: Log the incoming query  
    console.log('Received search query:', query);  
    
    try {  
      let posts = [];  
      if (query) {  
        // Debugging: Log the query conditions  
        console.log('Searching for posts with title matching:', `%${query}%`);  
    
        // Perform a case-insensitive search on the title  
        posts = await BlogPost.findAll({  
          where: {  
            title: {  
              [Op.like]: `%${query}%`, // Adjust for case sensitivity based on DB  
            },  
          },  
        });  
    
        // Debugging: Log the results  
        console.log('Found posts:', posts);  
      }  
      res.render('search', { title: 'Search Posts', posts, query, error: null });  
    } catch (error) {  
      // Debugging: Log the error details  
      console.error('Error searching for posts:', error);  
    
      res.render('search', { title: 'Search Posts', posts: [], query, error: 'An error occurred while searching for posts. Please try again later.' });  
    }  
  });



module.exports = router;
