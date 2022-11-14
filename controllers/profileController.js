const mongoose = require("mongoose");
const User = require("./../models/userModel");
const Post = require("./../models/postModel");

const editProfile = async (req, res) => {
  const data = {};
  if (req.body.name) data.name = req.body.name;
  if (req.body.bio) data.bio = req.body.bio;
  if (req.file) data.photo = `/images/profilePic/${req.file.filename}`;

  const newData = await User.findByIdAndUpdate(req.user._id, data, {
    new: true,
  });

  res.redirect(`/p/${req.user._id}`);
};

const uploadPost = async (req, res) => {
  const tempPost = {
    title: req.body.title,
    photo: `/images/profilePic/${req.file.filename}`,
    author: req.user.email,
    authorId: req.user._id,
  };

  const newPost = await Post.create(tempPost);
  res.redirect(`/p/${req.user._id}`);
};

module.exports = { editProfile, uploadPost };
