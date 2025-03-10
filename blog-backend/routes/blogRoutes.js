const express = require("express");
const auth = require("../middleware/auth");
const Blog = require("../models/Blog");
const router = express.Router();

// Create Blog
router.post("/", auth, async (req, res) => {
  try {
    const newBlog = new Blog({ ...req.body, author: req.user.id });
    await newBlog.save();
    res.json(newBlog);
  } catch (err) {
    res.status(400).json({ message: "Failed to create blog", error: err.message, err });
  }
});

// Get All Blogs
router.get("/", async (req, res) => {
  const blogs = await Blog.find().populate("author", "username");
  res.json(blogs);
});

// Get Blog by ID
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("author", "username");
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(400).json({ message: "Failed to fetch blog", error: err.message });
  }
});

// Update Blog
router.put("/:id", auth, async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (blog.author.toString() !== req.user.id)
    return res.status(403).json({ message: "Not Authorized" });

  const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedBlog);
});

// Delete Blog
router.delete("/:id", auth, async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (blog.author.toString() !== req.user.id)
    return res.status(403).json({ message: "Not Authorized" });

  await Blog.findByIdAndDelete(req.params.id);
  res.json({ message: "Blog Deleted" });
});

module.exports = router;