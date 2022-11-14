// postedBy title description photo
const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema({
  title: String,
  photo: String,
  author: String,
  authorId: String,
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
