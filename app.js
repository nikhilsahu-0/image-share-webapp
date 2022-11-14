const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const multer = require("multer");
const ejs = require("ejs");
const {
  userSignup,
  userLogin,
  protect,
  loginCheck,
} = require("./controllers/authController");
const { editProfile, uploadPost } = require("./controllers/profileController");
const User = require("./models/userModel");
const Post = require("./models/postModel");

const app = express();

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.set("views", "./public");
app.use(express.static(`${__dirname}/public`));
app.use(morgan("dev"));

// MULTER SETUP
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/profilePic");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".jpg");
  },
});
const upload = multer({ storage: storage });

// HOME PAGE
app.route("/").get(loginCheck, (req, res) => {
  if (req.user) {
    res.render("index", { data: { flag: true, user: req.user } });
  } else {
    res.render("index", { data: { flag: false } });
  }
});

// EXPLORE PAGE
app.route("/explore").get(loginCheck, async (req, res) => {
  const posts = await Post.find();
  res.render("explore", { data: { posts, loggedUser: req.user } });
});

// USER SIGNUP
app
  .route("/signup")
  .get((req, res) => {
    res.render("signup");
  })
  .post(userSignup);

// USER LOGIN
app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post(userLogin);

// USER PROFILE
app.route("/p/:profile").get(loginCheck, async (req, res) => {
  try {
    const currUser = await User.findById(req.params.profile);
    console.log(currUser);
    if (currUser)
      res.render("profile2", { data: { currUser, loggedUser: req.user } });
    else res.render("404");
  } catch {
    res.render("404");
  }
});

// USER PROFILE EDIT
app
  .route("/p/:profile/edit-profile")
  .get(protect, (req, res) => {
    if (req.user._id != req.params.profile) {
      return res.redirect("/404");
    }
    res.render("profile-edit");
  })
  .post(protect, upload.single("file"), editProfile);

// USER UPLOAD POST
app
  .route("/p/:profile/upload")
  .get(protect, (req, res) => {
    if (req.user._id != req.params.profile) {
      return res.redirect("/404");
    }
    res.render("upload");
  })
  .post(protect, upload.single("file"), uploadPost);

// USER POSTS
app.route("/p/:profile/posts").get(loginCheck, async (req, res) => {
  const posts = await Post.find({ authorId: req.params.profile });
  res.render("showPosts", { data: { posts, loggedUser: req.user } });
});

// USER LOGOUT
app.route("/logout").get(protect, (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});
app.all("*", (req, res) => {
  res.render("404");
});
module.exports = app;

//34 203 10 4-5MT 11-3F
